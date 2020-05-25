// @flow

import AppAda, {ErrorCodes} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {BigNumber} from 'bignumber.js'
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble'
import TransportHID from '@ledgerhq/react-native-hid'
import {TransportStatusError} from '@ledgerhq/hw-transport'
import {BleError} from 'react-native-ble-plx'
import ExtendableError from 'es6-error'

import {Logger} from '../../utils/logging'
import {CONFIG} from '../../config'
import {
  generateFakeWallet,
  signTransaction,
  encodeTxAsRust,
  decodeRustTx,
} from './util'
import {Bip32PublicKey} from 'react-native-chain-libs'

import type {
  Addressing,
  PreparedTransactionData,
  TransactionInput,
  TransactionOutput,
  TxBodiesResponse,
  V1SignedTx,
} from '../../types/HistoryTransaction'
import type {
  GetVersionResponse,
  GetExtendedPublicKeyResponse,
  InputTypeUTxO,
  OutputTypeAddress,
  OutputTypeChange,
  SignTransactionResponse,
  Witness,
} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import type {TxWitness} from './util'
import type BluetoothTransport from '@ledgerhq/react-native-hw-transport-ble'
import type HIDTransport from '@ledgerhq/react-native-hid'

//
// ============== Errors ==================
//

export class BluetoothDisabledError extends ExtendableError {
  constructor() {
    super('BluetoothDisabledError')
  }
}

export class GeneralConnectionError extends ExtendableError {
  constructor() {
    super('GeneralConnectionError')
  }
}

export class LedgerUserError extends ExtendableError {
  constructor() {
    super('LedgerUserError')
  }
}

const _isConnectionError = (e: Error | TransportStatusError): boolean => {
  if (
    e instanceof BleError ||
    e.message.includes('was disconnected') ||
    e.message.includes('DisconnectedDevice') ||
    e.name.includes('DisconnectedDevice') ||
    e.message.includes('not found')
  ) {
    return true
  }
  return false
}

// note: e.statusCode === ErrorCodes.ERR_CLA_NOT_SUPPORTED is more probably due
// to user not having ADA app opened instead of having the wrong app opened
const _isUserError = (e: Error | TransportStatusError): boolean => {
  if (
    (e.statusCode != null &&
      e.statusCode === ErrorCodes.ERR_REJECTED_BY_USER) ||
    (e.statusCode != null && e.statusCode === ErrorCodes.ERR_CLA_NOT_SUPPORTED)
  ) {
    return true
  }
  return false
}

//
// ============== Types ==================
//

// these are defined in LedgerConnectStore.js in yoroi-frontend
type LedgerConnectionResponse = {|
  extendedPublicKeyResp: GetExtendedPublicKeyResponse,
  deviceId: string,
|}

type LedgerSignTxPayload = {|
  inputs: Array<InputTypeUTxO>,
  outputs: Array<OutputTypeAddress | OutputTypeChange>,
|}

// this type is used by @ledgerhq/react-native-hid and it's not exposed
// so we redefine it here
export type DeviceObj = {
  vendorId: number,
  productId: number,
}

// for bluetooth, we just save a string id
export type DeviceId = string

// Hardware wallet device Features object
// borrowed from HWConnectStoreTypes.js in yoroi-frontend
export type HWFeatures = {|
  vendor: string,
  model: string,
  deviceId: ?DeviceId, // for establishing a connection through BLE
  deviceObj: ?DeviceObj, // for establishing a connection through USB
|}

export type HWDeviceInfo = {|
  bip44AccountPublic: string,
  hwFeatures: HWFeatures,
|}

//
// ============== General util ==================
//

const VENDOR = CONFIG.HARDWARE_WALLETS.LEDGER_NANO.VENDOR
const MODEL = CONFIG.HARDWARE_WALLETS.LEDGER_NANO.MODEL

const HARDENED = CONFIG.NUMBERS.HARD_DERIVATION_START
const PURPOSE = CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.BIP44
const COIN_TYPE = CONFIG.NUMBERS.COIN_TYPES.CARDANO

const ACCOUNT_LEVEL = 3

// borrowed from yoroi-extension-ledger-bridge
const makeCardanoAccountBIP44Path = (account: number) => [
  PURPOSE,
  COIN_TYPE,
  HARDENED + account,
]

const makeCardanoBIP44Path = (
  account: number,
  chain: number,
  address: number,
) => [PURPOSE, COIN_TYPE, HARDENED + account, chain, address]

const validateHWResponse = (resp: LedgerConnectionResponse): boolean => {
  const {extendedPublicKeyResp, deviceId} = resp
  if (deviceId == null) {
    throw new Error('Ledger device id response is undefined')
  }
  if (extendedPublicKeyResp == null) {
    throw new Error('Ledger device extended public key response is undefined')
  }
  return true
}

const normalizeHWResponse = (resp: LedgerConnectionResponse): HWDeviceInfo => {
  validateHWResponse(resp)
  const {extendedPublicKeyResp, deviceId} = resp
  return {
    bip44AccountPublic:
      extendedPublicKeyResp.publicKeyHex + extendedPublicKeyResp.chainCodeHex,
    hwFeatures: {
      vendor: VENDOR,
      model: MODEL,
      deviceId,
    },
  }
}

export const getHWDeviceInfo = async (
  transport: BluetoothTransport | HIDTransport,
): Promise<?HWDeviceInfo> => {
  try {
    Logger.debug('ledgerUtils::getHWDeviceInfo called')

    const appAda = new AppAda(transport)
    const versionResp: GetVersionResponse = await appAda.getVersion()
    Logger.debug('AppAda version', versionResp)

    // assume single account in Yoroi
    const accountPath = makeCardanoAccountBIP44Path(
      CONFIG.NUMBERS.ACCOUNT_INDEX,
    )
    Logger.debug('bip44 account path', accountPath)

    // get Cardano's first account
    // i.e hdPath = [2147483692, 2147485463, 2147483648]
    const extendedPublicKeyResp: GetExtendedPublicKeyResponse = await appAda.getExtendedPublicKey(
      accountPath,
    )
    Logger.debug('extended public key', extendedPublicKeyResp)

    const deviceId = transport.id

    const hwDeviceInfo = normalizeHWResponse({
      extendedPublicKeyResp,
      deviceId,
    })
    Logger.info('ledgerUtils::getHWDeviceInfo: Ledger device OK')
    return hwDeviceInfo
  } catch (e) {
    if (_isUserError(e)) {
      Logger.info('ledgerUtils::getHWDeviceInfo: User-side error', e)
      throw new LedgerUserError()
    } else if (_isConnectionError(e)) {
      Logger.info('ledgerUtils::getHWDeviceInfo: General/BleError', e)
      throw new GeneralConnectionError()
    } else {
      Logger.error('ledgerUtils::getHWDeviceInfo: Unexpected error', e)
      throw e
    }
  }
}

export const verifyAddress = async (
  address: string,
  addressing: Addressing,
  hwDeviceInfo: HWDeviceInfo,
  useUSB?: boolean = false,
): Promise<void> => {
  try {
    Logger.debug('ledgerUtils::verifyAddress called')
    Logger.debug('hwDeviceInfo', hwDeviceInfo)

    const transportLib = useUSB ? TransportHID : TransportBLE

    if (hwDeviceInfo == null || hwDeviceInfo.hwFeatures.deviceId == null) {
      throw new Error('ledgerUtils::verifyAddress: deviceId is null')
    }

    const path = makeCardanoBIP44Path(
      addressing.addressing.account,
      addressing.addressing.change,
      addressing.addressing.index,
    )

    // TODO once USB support is added
    // if using USB, use correct input for open()
    const transport = await transportLib.open(hwDeviceInfo.hwFeatures.deviceId)
    const appAda = new AppAda(transport)

    await appAda.showAddress(path)
  } catch (e) {
    if (_isUserError(e)) {
      Logger.info('ledgerUtils::verifyAddress: User-side error', e)
      throw new LedgerUserError()
    } else if (_isConnectionError(e)) {
      Logger.info('ledgerUtils::verifyAddress: general/BleError', e)
      throw new GeneralConnectionError()
    } else {
      Logger.error('ledgerUtils::verifyAddress: Unexpected error', e)
      throw e
    }
  }
}

//
// ============== transaction logic ==================
//

export type CreateLedgerSignTxPayloadResponse = {
  ledgerSignTxPayload: LedgerSignTxPayload,
  partialTx: V1SignedTx,
}
/** Generate a payload for Ledger SignTx */
export const createLedgerSignTxPayload = async (
  unsignedTx: PreparedTransactionData,
  txsBodiesMap: TxBodiesResponse,
  addressedChange: {address: string, ...Addressing},
): Promise<CreateLedgerSignTxPayloadResponse> => {
  const fakeWallet = await generateFakeWallet()
  const fakeTx = await signTransaction(
    fakeWallet,
    unsignedTx.inputs,
    unsignedTx.outputs,
    addressedChange.address,
  )
  if (unsignedTx.fee.comparedTo(fakeTx.fee) !== 0) {
    throw Error('createLedgerSignTxPayload: fees should match')
  }
  Logger.debug(
    'ledgerUtils::createLedgerSignTxPayload: fee',
    fakeTx.fee.toString(),
  )

  // parse fake tx to see what are the exact inputs that will be used
  const decodedRustTx = decodeRustTx(fakeTx.cbor_encoded_tx)

  // Inputs
  // we'll use only the inputs that were selected in rust
  const inputs = unsignedTx.inputs.filter((input) => {
    for (const i of decodedRustTx.tx.tx.inputs) {
      if (i.id === input.ptr.id) return true
    }
    return false
  })
  if (inputs.length === 0) {
    throw Error('createLedgerSignTxPayload: no inputs. Should never happen')
  }

  Logger.debug('ledgerUtils::createLedgerSignTxPayload selected inputs', inputs)

  const ledgerInputs: Array<InputTypeUTxO> = _transformToLedgerInputs(
    inputs,
    txsBodiesMap,
  )

  // Outputs
  const ledgerOutputs: Array<
    OutputTypeAddress | OutputTypeChange,
  > = _transformToLedgerOutputs(
    // we could have used outputs from unsignedTx but they don't contain
    // the change addr.
    decodedRustTx.tx.tx.outputs.map((o) => ({
      address: o.address,
      value: o.value.toString(),
    })),
    addressedChange,
    _computeChange(inputs, unsignedTx.outputs, unsignedTx.fee).toString(),
  )

  return {
    ledgerSignTxPayload: {
      inputs: ledgerInputs,
      outputs: ledgerOutputs,
    },
    partialTx: fakeTx,
  }
}

function _computeChange(
  inputs: Array<TransactionInput>,
  outputs: Array<TransactionOutput>,
  fee: BigNumber,
): BigNumber {
  const BigNumberSum = (data: Array<string>): BigNumber =>
    data.reduce((x: BigNumber, y) => x.plus(y), new BigNumber(0))

  const totalInput = BigNumberSum(inputs.map((i) => i.value.value))
  const totalOutput = BigNumberSum(outputs.map((o) => o.value))
  return totalInput.minus(totalOutput).minus(fee)
}

function _transformToLedgerInputs(
  inputs: Array<TransactionInput>,
  txDataHexMap: {[key: string]: string},
): Array<InputTypeUTxO> {
  return inputs.map((input) => {
    return {
      txDataHex: txDataHexMap[input.ptr.id],
      outputIndex: input.ptr.index,
      path: makeCardanoBIP44Path(
        input.addressing.account,
        input.addressing.change,
        input.addressing.index,
      ),
    }
  })
}

function _transformToLedgerOutputs(
  txOutputs: Array<TransactionOutput>,
  changeAddr: {address: string, ...Addressing},
  changeAmount: string,
): Array<OutputTypeAddress | OutputTypeChange> {
  return txOutputs.map((txOutput) => {
    if (txOutput.address === changeAddr.address) {
      return {
        path: makeCardanoBIP44Path(
          changeAddr.addressing.account,
          changeAddr.addressing.change,
          changeAddr.addressing.index,
        ),
        amountStr: changeAmount,
      }
    }
    return {
      address58: txOutput.address,
      amountStr: txOutput.value,
    }
  })
}

export const signTxWithLedger = async (
  payload: LedgerSignTxPayload,
  partialTx: V1SignedTx,
  hwDeviceInfo: HWDeviceInfo,
): Promise<V1SignedTx> => {
  try {
    Logger.debug('ledgerUtils::signTxWithLedger called')

    if (hwDeviceInfo == null || hwDeviceInfo.hwFeatures.deviceId == null) {
      throw new Error('ledgerUtils::signTxWithLedger: deviceId is null')
    }

    const transport = await TransportBLE.open(hwDeviceInfo.hwFeatures.deviceId)
    const appAda = new AppAda(transport)

    Logger.debug('ledgerUtils::signTxWithLedger inputs', payload.inputs)
    Logger.debug('ledgerUtils::signTxWithLedger outputs', payload.outputs)

    const ledgerSignature: SignTransactionResponse = await appAda.signTransaction(
      payload.inputs,
      payload.outputs,
    )

    const decodedRustTx = decodeRustTx(partialTx.cbor_encoded_tx)
    // replace fake witnesses by correct one
    decodedRustTx.tx.witnesses = await Promise.all(
      ledgerSignature.witnesses.map((w) =>
        normalizeWitness(hwDeviceInfo.bip44AccountPublic, w),
      ),
    )
    Logger.debug(
      'ledgerUtils::signTxWithLedger decodeRustTx.tx.witnesses:',
      decodedRustTx,
    )
    const finalTx = {...partialTx}
    finalTx.cbor_encoded_tx = encodeTxAsRust(decodedRustTx).toString('hex')
    Logger.debug('ledgerUtils::signTxWithLedger finalTx')
    return finalTx
  } catch (e) {
    if (_isUserError(e)) {
      Logger.info('ledgerUtils::signTxWithLedger: User-side error', e)
      throw new LedgerUserError()
    } else if (_isConnectionError(e)) {
      Logger.info('ledgerUtils::signTxWithLedger: general/BleError', e)
      throw new GeneralConnectionError()
    } else {
      Logger.error('ledgerUtils::signTxWithLedger: Unexpected error', e)
      throw e
    }
  }
}

// takes a witness generated by ledger and adds the corresponding public key
// the returned witness follows the form of a decoded rust tx
async function normalizeWitness(
  bip44AccountPublic: string,
  witness: Witness,
  keyLevel?: number = ACCOUNT_LEVEL,
): Promise<TxWitness> {
  let finalKey = await Bip32PublicKey.from_bytes(
    Buffer.from(bip44AccountPublic, 'hex'),
  )
  for (let i = keyLevel; i < witness.path.length; i++) {
    finalKey = await finalKey.derive(witness.path[i])
  }
  Logger.debug(
    'final key',
    Buffer.from(await finalKey.as_bytes()).toString('hex'),
  )
  return {
    PkWitness: [
      Buffer.from(await finalKey.as_bytes()).toString('hex'),
      witness.witnessSignatureHex,
    ],
  }
}
