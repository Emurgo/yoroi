// @flow

import AppAda, {ErrorCodes} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import {BigNumber} from 'bignumber.js'
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble'
// note(v-almonacid) we'll be using a fork of @ledgerhq/react-native-hid
// so that we can keep minSdkVersion = 21
// import TransportHID from '@ledgerhq/react-native-hid'
import TransportHID from '@v-almonacid/react-native-hid'
import {TransportStatusError} from '@ledgerhq/hw-transport'
import {BleError} from 'react-native-ble-plx'
import ExtendableError from 'es6-error'
import {Platform, PermissionsAndroid} from 'react-native'

import {Logger} from '../../utils/logging'
import {CONFIG} from '../../config/config'
import {
  generateFakeWallet,
  signTransaction,
  encodeTxAsRust,
  decodeRustTx,
} from './util'
import {Bip32PublicKey} from 'react-native-chain-libs'

import type {TxBodiesResponse} from '../../api/types'
import type {
  LegacyAddressing,
  PreparedTransactionData,
  TransactionInput,
  TransactionOutput,
  V1SignedTx,
} from '../../crypto/types'
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
// import type HIDTransport from '@ledgerhq/react-native-hid'
import type HIDTransport from '@v-almonacid/react-native-hid'

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

// this type is used by @ledgerhq/react-native-hid and it's not exposed
// so we redefine it here
export type DeviceObj = {
  vendorId: number,
  productId: number,
}

// for bluetooth, we just save a string id
export type DeviceId = string

// these are defined in LedgerConnectStore.js in yoroi-frontend
type LedgerConnectionResponse = {|
  extendedPublicKeyResp: GetExtendedPublicKeyResponse,
  deviceId: ?DeviceId,
  deviceObj: ?DeviceObj,
|}

type LedgerSignTxPayload = {|
  inputs: Array<InputTypeUTxO>,
  outputs: Array<OutputTypeAddress | OutputTypeChange>,
|}

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
  const {extendedPublicKeyResp, deviceId, deviceObj} = resp
  if (deviceId == null && deviceObj == null) {
    throw new Error(
      'LedgerUtils::validateHWResponse: a non-null descriptor is required',
    )
  }
  if (extendedPublicKeyResp == null) {
    throw new Error(
      'LedgerUtils::validateHWResponse: extended public key is undefined',
    )
  }
  return true
}

const normalizeHWResponse = (resp: LedgerConnectionResponse): HWDeviceInfo => {
  validateHWResponse(resp)
  const {extendedPublicKeyResp, deviceId, deviceObj} = resp
  return {
    bip44AccountPublic:
      extendedPublicKeyResp.publicKeyHex + extendedPublicKeyResp.chainCodeHex,
    hwFeatures: {
      vendor: VENDOR,
      model: MODEL,
      deviceId,
      deviceObj,
    },
  }
}

const connectionHandler = async (
  deviceId: ?DeviceId,
  deviceObj: ?DeviceObj,
  useUSB?: boolean = false,
): Promise<BluetoothTransport | HIDTransport> => {
  let descriptor
  if (useUSB) {
    descriptor = deviceObj
    if (descriptor == null) {
      throw new Error('ledgerUtils::connectionHandler deviceObj is null')
    }
    return await TransportHID.open(descriptor)
  } else {
    // check for permissions just in case
    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      )
    }
    descriptor = deviceId
    if (descriptor == null) {
      throw new Error('ledgerUtils::connectionHandler deviceId is null')
    }
    return await TransportBLE.open(descriptor)
  }
}

export const getHWDeviceInfo = async (
  deviceId: ?DeviceId,
  deviceObj: ?DeviceObj,
  useUSB?: boolean = false,
): Promise<HWDeviceInfo> => {
  try {
    Logger.debug('ledgerUtils::getHWDeviceInfo called')

    const transport = await connectionHandler(deviceId, deviceObj, useUSB)
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
    Logger.debug('transport.id', transport.id)

    const hwDeviceInfo = normalizeHWResponse({
      extendedPublicKeyResp,
      deviceId,
      deviceObj,
    })
    Logger.info('ledgerUtils::getHWDeviceInfo: Ledger device OK')
    Logger.info('hwDeviceInfo', hwDeviceInfo)
    await transport.close()
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
  addressing: LegacyAddressing,
  hwDeviceInfo: HWDeviceInfo,
  useUSB?: boolean = false,
): Promise<void> => {
  try {
    Logger.debug('ledgerUtils::verifyAddress called')
    Logger.debug('hwDeviceInfo', hwDeviceInfo)

    if (hwDeviceInfo == null) {
      throw new Error('ledgerUtils::verifyAddress: hwDeviceInfo is null')
    }

    const path = makeCardanoBIP44Path(
      addressing.addressing.account,
      addressing.addressing.change,
      addressing.addressing.index,
    )

    const transport = await connectionHandler(
      hwDeviceInfo.hwFeatures.deviceId,
      hwDeviceInfo.hwFeatures.deviceObj,
      useUSB,
    )
    const appAda = new AppAda(transport)

    await appAda.showAddress(path)
    await transport.close()
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
  addressedChange: {address: string, ...LegacyAddressing},
): Promise<CreateLedgerSignTxPayloadResponse> => {
  Logger.debug('unsigned inputs', JSON.stringify(unsignedTx.inputs))
  Logger.debug('unsigned outputs', JSON.stringify(unsignedTx.outputs))

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
      if (i.id === input.ptr.id && i.index === input.ptr.index) return true
    }
    return false
  })
  Logger.debug(
    'ledgerUtils::createLedgerSignTxPayload: selected inputs',
    JSON.stringify(inputs),
  )
  if (inputs.length === 0) {
    throw Error('createLedgerSignTxPayload: no inputs. Should never happen')
  }
  if (inputs.length !== decodedRustTx.tx.tx.inputs.length) {
    throw Error('createLedgerSignTxPayload: input selection error')
  }

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
  changeAddr: {address: string, ...LegacyAddressing},
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
  useUSB?: boolean = false,
): Promise<V1SignedTx> => {
  try {
    Logger.debug('ledgerUtils::signTxWithLedger called')

    if (hwDeviceInfo == null) {
      throw new Error('ledgerUtils::signTxWithLedger: hwDeviceInfo is null')
    }

    const transport = await connectionHandler(
      hwDeviceInfo.hwFeatures.deviceId,
      hwDeviceInfo.hwFeatures.deviceObj,
      useUSB,
    )
    const appAda = new AppAda(transport)

    Logger.debug('ledgerUtils::signTxWithLedger inputs', payload.inputs)
    Logger.debug('ledgerUtils::signTxWithLedger outputs', payload.outputs)

    const ledgerSignature: SignTransactionResponse = await appAda.signTransaction(
      payload.inputs,
      payload.outputs,
    )

    await transport.close()

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
    Logger.debug(
      'ledgerUtils::signTxWithLedger finalTx',
      JSON.stringify(finalTx),
    )
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
