// @flow

import AppAda, {
  ErrorCodes,
  AddressTypeNibbles,
  CertTypes,
} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble'
// note(v-almonacid) we'll be using a fork of @ledgerhq/react-native-hid
// so that we can keep minSdkVersion = 21
// import TransportHID from '@ledgerhq/react-native-hid'
import TransportHID from '@v-almonacid/react-native-hid'
import {TransportStatusError} from '@ledgerhq/hw-transport'
import {BleError} from 'react-native-ble-plx'
import {Platform, PermissionsAndroid} from 'react-native'
import {
  Address,
  BaseAddress,
  Bip32PublicKey,
  BootstrapWitness,
  BootstrapWitnesses,
  ByronAddress,
  Certificate,
  Certificates,
  Ed25519Signature,
  RewardAddress,
  StakeCredential,
  Transaction,
  TransactionBody,
  TransactionMetadata,
  TransactionOutputs,
  TransactionWitnessSet,
  Vkey,
  Vkeywitness,
  Vkeywitnesses,
  Withdrawal,
  Withdrawals,
} from 'react-native-haskell-shelley'

import {Logger} from '../../utils/logging'
import {CONFIG, isByron, isHaskellShelley} from '../../config/config'
import {NUMBERS} from '../../config/numbers'
import {
  verifyFromBip44Root,
  toHexOrBase58,
  normalizeToAddress,
  derivePublicByAddressing,
} from './utils'
import {ledgerMessages} from '../../i18n/global-messages'
import LocalizableError from '../../i18n/LocalizableError'

import type {
  Address as JsAddress,
  Addressing,
  AddressedUtxo,
  Value,
} from '../../crypto/types'
import type {
  BIP32Path,
  GetVersionResponse,
  GetExtendedPublicKeyResponse,
  GetSerialResponse,
  InputTypeUTxO,
  OutputTypeAddress,
  OutputTypeAddressParams,
  SignTransactionResponse,
  StakingBlockchainPointer,
  Witness,
} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import type BluetoothTransport from '@ledgerhq/react-native-hw-transport-ble'
import type HIDTransport from '@v-almonacid/react-native-hid'
import type {WalletImplementationId} from '../../config/types'
import type {HaskellShelleyTxSignRequest} from './HaskellShelleyTxSignRequest'

//
// ============== Errors ==================
//

export class BluetoothDisabledError extends LocalizableError {
  constructor() {
    super({
      id: ledgerMessages.bluetoothDisabledError.id,
      defaultMessage: ledgerMessages.bluetoothDisabledError.defaultMessage,
    })
  }
}

export class GeneralConnectionError extends LocalizableError {
  constructor() {
    super({
      id: ledgerMessages.connectionError.id,
      defaultMessage: ledgerMessages.connectionError.defaultMessage,
    })
  }
}

// note: uses same message as above.
export class LedgerUserError extends LocalizableError {
  constructor() {
    super({
      id: ledgerMessages.connectionError.id,
      defaultMessage: ledgerMessages.connectionError.defaultMessage,
    })
  }
}

export class RejectedByUserError extends LocalizableError {
  constructor() {
    super({
      id: ledgerMessages.rejectedByUserError.id,
      defaultMessage: ledgerMessages.rejectedByUserError.defaultMessage,
    })
  }
}

export class DeprecatedFirmwareError extends LocalizableError {
  constructor() {
    super({
      id: ledgerMessages.deprecatedFirmwareError.id,
      defaultMessage: ledgerMessages.deprecatedFirmwareError.defaultMessage,
    })
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
    e &&
    e.statusCode != null &&
    e.statusCode === ErrorCodes.ERR_CLA_NOT_SUPPORTED
  ) {
    return true
  }
  return false
}

const _isRejectedError = (e: Error | TransportStatusError): boolean => {
  if (
    e &&
    e.statusCode != null &&
    e.statusCode === ErrorCodes.ERR_REJECTED_BY_USER
  ) {
    return true
  }
  return false
}

export const mapLedgerError = (
  e: Error | TransportStatusError,
): Error | LocalizableError => {
  if (_isUserError(e)) {
    Logger.info('ledgerUtils::mapLedgerError: User-side error', e)
    return new LedgerUserError()
  } else if (_isRejectedError(e)) {
    Logger.info('ledgerUtils::mapLedgerError: Rejected by user error', e)
    return new RejectedByUserError()
  } else if (_isConnectionError(e)) {
    Logger.info('ledgerUtils::mapLedgerError: General/BleError', e)
    return new GeneralConnectionError()
  } else if (e instanceof DeprecatedFirmwareError) {
    Logger.info('ledgerUtils::mapLedgerError: Deprecated firmware', e)
    return e
  } else {
    Logger.error('ledgerUtils::mapLedgerError: Unexpected error', e)
    return e
  }
}

//
// ============== Types ==================
//

export type WalletType = 'BIP44' | 'CIP1852'

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
  serial: string,
|}

// Hardware wallet device Features object
// borrowed from HWConnectStoreTypes.js in yoroi-frontend
export type HWFeatures = {|
  vendor: string,
  model: string,
  deviceId: ?DeviceId, // for establishing a connection through BLE
  deviceObj: ?DeviceObj, // for establishing a connection through USB
  serial?: string,
|}

export type HWDeviceInfo = {|
  bip44AccountPublic: string,
  hwFeatures: HWFeatures,
|}

// tx API

// from yoroi-extension-ledger-connect-handler
export type SignTransactionRequest = {|
  networkId: number,
  protocolMagic: number,
  inputs: Array<InputTypeUTxO>,
  outputs: Array<OutputTypeAddress | OutputTypeAddressParams>,
  feeStr: string,
  ttlStr: string,
  certificates: Array<Certificate>,
  withdrawals: Array<Withdrawal>,
  metadataHashHex: ?string,
|}

//
// ============== General util ==================
//

const VENDOR = CONFIG.HARDWARE_WALLETS.LEDGER_NANO.VENDOR
const MODEL = CONFIG.HARDWARE_WALLETS.LEDGER_NANO.MODEL

const HARDENED = CONFIG.NUMBERS.HARD_DERIVATION_START
const WALLET_TYPE_PURPOSE = CONFIG.NUMBERS.WALLET_TYPE_PURPOSE
const COIN_TYPE = CONFIG.NUMBERS.COIN_TYPES.CARDANO

const getWalletType = (id: WalletImplementationId): WalletType => {
  if (isByron(id)) {
    return 'BIP44'
  } else if (isHaskellShelley(id)) {
    return 'CIP1852'
  } else {
    throw new Error('ledgerUtils::getWalletType: wallet type not supported')
  }
}

const makeCardanoAccountBIP44Path = (
  walletType: WalletType,
  account: number,
) => [WALLET_TYPE_PURPOSE[walletType], COIN_TYPE, HARDENED + account]

const validateHWResponse = (resp: LedgerConnectionResponse): boolean => {
  const {extendedPublicKeyResp, deviceId, deviceObj, serial} = resp
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
  if (serial == null) {
    throw new Error(
      'LedgerUtils::validateHWResponse: device serial number is undefined',
    )
  }
  return true
}

const normalizeHWResponse = (resp: LedgerConnectionResponse): HWDeviceInfo => {
  validateHWResponse(resp)
  const {extendedPublicKeyResp, deviceId, deviceObj, serial} = resp
  return {
    bip44AccountPublic:
      extendedPublicKeyResp.publicKeyHex + extendedPublicKeyResp.chainCodeHex,
    hwFeatures: {
      vendor: VENDOR,
      model: MODEL,
      deviceId,
      deviceObj,
      serial,
    },
  }
}

const checkDeviceVersion = (version: GetVersionResponse): void => {
  if (version.major == null || version.minor == null || version.patch == null) {
    Logger.warn(
      'ledgerUtils::checkDeviceVersion: incomplete version data from device',
    )
    return
  }
  const deviceVersionArray = [version.major, version.minor, version.path]
  const minVersionArray = CONFIG.HARDWARE_WALLETS.LEDGER_NANO.MIN_FIRMWARE_VERSION.split(
    '.',
  )
  if (minVersionArray.length !== deviceVersionArray.length) {
    Logger.warn('ledgerUtils::checkDeviceVersion: version formats mismatch')
    return
  }
  for (let i = 0; i < minVersionArray.length; i++) {
    if (
      parseInt(deviceVersionArray[i], 10) < parseInt(minVersionArray[i], 10)
    ) {
      throw new DeprecatedFirmwareError()
    }
  }
}

const connectionHandler = async (
  deviceId: ?DeviceId,
  deviceObj: ?DeviceObj,
  useUSB?: boolean = false,
): Promise<BluetoothTransport | HIDTransport> => {
  let descriptor
  let transport
  if (useUSB) {
    descriptor = deviceObj
    if (descriptor == null) {
      throw new Error('ledgerUtils::connectionHandler deviceObj is null')
    }
    transport = await TransportHID.open(descriptor)
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
    transport = await TransportBLE.open(descriptor)
  }
  const appAda = new AppAda(transport)
  const versionResp: GetVersionResponse = await appAda.getVersion()
  Logger.debug('ledgerUtils::connectionHandler: AppAda version', versionResp)
  checkDeviceVersion(versionResp)
  return transport
}

export const getHWDeviceInfo = async (
  walletImplementationId: WalletImplementationId,
  deviceId: ?DeviceId,
  deviceObj: ?DeviceObj,
  useUSB?: boolean = false,
): Promise<HWDeviceInfo> => {
  try {
    Logger.debug('ledgerUtils::getHWDeviceInfo called')

    const transport = await connectionHandler(deviceId, deviceObj, useUSB)
    const appAda = new AppAda(transport)

    // assume single account in Yoroi
    const accountPath = makeCardanoAccountBIP44Path(
      getWalletType(walletImplementationId),
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

    const serial: GetSerialResponse = await appAda.getSerial()

    const hwDeviceInfo = normalizeHWResponse({
      extendedPublicKeyResp,
      deviceId,
      deviceObj,
      ...serial,
    })
    Logger.info('ledgerUtils::getHWDeviceInfo: Ledger device OK')
    Logger.info('hwDeviceInfo', hwDeviceInfo)
    await transport.close()
    return hwDeviceInfo
  } catch (e) {
    throw mapLedgerError(e)
  }
}

export const verifyAddress = async (
  walletImplementationId: WalletImplementationId,
  address: string,
  addressing: $PropertyType<Addressing, 'addressing'>,
  hwDeviceInfo: HWDeviceInfo,
  useUSB?: boolean = false,
): Promise<void> => {
  try {
    Logger.debug('ledgerUtils::verifyAddress called')
    Logger.debug('hwDeviceInfo', hwDeviceInfo)
    Logger.debug('path', addressing.path)

    if (hwDeviceInfo == null) {
      throw new Error('ledgerUtils::verifyAddress: hwDeviceInfo is null')
    }

    verifyFromBip44Root(addressing)

    const addressPtr = await normalizeToAddress(address)

    const stakingKeyAddressing = {}
    if (isHaskellShelley(walletImplementationId)) {
      const baseAddr = await BaseAddress.from_address(addressPtr)
      if (baseAddr) {
        const rewardAddr = await RewardAddress.new(
          Number.parseInt(CONFIG.NETWORKS.HASKELL_SHELLEY.CHAIN_NETWORK_ID, 10),
          await baseAddr.stake_cred(),
        )
        const addressPayload = Buffer.from(
          await (await rewardAddr.to_address()).to_bytes(),
        ).toString('hex')
        stakingKeyAddressing[addressPayload] = {
          path: [
            CONFIG.NUMBERS.WALLET_TYPE_PURPOSE.CIP1852,
            CONFIG.NUMBERS.COIN_TYPES.CARDANO,
            CONFIG.NUMBERS.ACCOUNT_INDEX + CONFIG.NUMBERS.HARD_DERIVATION_START,
            CONFIG.NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT,
            CONFIG.NUMBERS.STAKING_KEY_INDEX,
          ],
          startLevel: CONFIG.NUMBERS.BIP44_DERIVATION_LEVELS.PURPOSE,
        }
      }
    }
    const addressingMap = (address) => stakingKeyAddressing[address]
    const addressParams = await toLedgerAddressParameters({
      networkId: Number.parseInt(
        CONFIG.NETWORKS.HASKELL_SHELLEY.CHAIN_NETWORK_ID,
        10,
      ),
      address: await normalizeToAddress(address),
      path: addressing.path,
      addressingMap,
    })

    const transport = await connectionHandler(
      hwDeviceInfo.hwFeatures.deviceId,
      hwDeviceInfo.hwFeatures.deviceObj,
      useUSB,
    )
    Logger.debug('transport.id', transport.id)

    const appAda = new AppAda(transport)

    await appAda.showAddress(
      addressParams.addressTypeNibble,
      addressParams.networkIdOrProtocolMagic,
      addressParams.spendingPath,
      addressParams.stakingPath,
      addressParams.stakingKeyHashHex,
      addressParams.stakingBlockchainPointer,
    )
    await transport.close()
  } catch (e) {
    throw mapLedgerError(e)
  }
}

//
// ============== transaction logic ==================
//

/** Generate a payload for Ledger SignTx */
export const createLedgerSignTxPayload = async (request: {|
  signRequest: HaskellShelleyTxSignRequest,
  byronNetworkMagic: number,
  networkId: number,
  addressingMap: (string) => void | $PropertyType<Addressing, 'addressing'>,
|}): Promise<SignTransactionRequest> => {
  Logger.debug('ledgerUtils::createLedgerSignTxPayload called')
  Logger.debug('signRequest', JSON.stringify(request.signRequest))
  const txBody = await request.signRequest.self().unsignedTx.build()

  // Inputs
  const ledgerInputs = _transformToLedgerInputs(
    request.signRequest.self().senderUtxos,
  )

  // Output
  const ledgerOutputs = await _transformToLedgerOutputs({
    networkId: request.networkId,
    txOutputs: await txBody.outputs(),
    changeAddrs: request.signRequest.self().changeAddr,
    addressingMap: request.addressingMap,
  })

  // withdrawals
  const withdrawals = await txBody.withdrawals()

  const certificates = await txBody.certs()

  const ledgerWithdrawal = []
  if (withdrawals != null && (await withdrawals.len()) > 0) {
    ledgerWithdrawal.push(
      ...(await formatLedgerWithdrawals(withdrawals, request.addressingMap)),
    )
  }

  const ledgerCertificates = []
  if (certificates != null && (await certificates.len()) > 0) {
    ledgerCertificates.push(
      ...(await formatLedgerCertificates(
        request.networkId,
        certificates,
        request.addressingMap,
      )),
    )
  }

  return {
    inputs: ledgerInputs,
    outputs: ledgerOutputs,
    feeStr: await (await txBody.fee()).to_str(),
    ttlStr: (await txBody.ttl()).toString(),
    protocolMagic: request.byronNetworkMagic,
    withdrawals: ledgerWithdrawal,
    certificates: ledgerCertificates,
    metadataHashHex: undefined,
    networkId: request.networkId,
  }
}

function _transformToLedgerInputs(
  inputs: Array<AddressedUtxo>,
): Array<InputTypeUTxO> {
  for (const input of inputs) {
    verifyFromBip44Root(input.addressing)
  }
  return inputs.map((input) => ({
    txHashHex: input.tx_hash,
    outputIndex: input.tx_index,
    path: input.addressing.path,
  }))
}

async function _transformToLedgerOutputs(request: {|
  networkId: number,
  txOutputs: TransactionOutputs,
  changeAddrs: Array<{|...JsAddress, ...Value, ...Addressing|}>,
  addressingMap: (string) => void | $PropertyType<Addressing, 'addressing'>,
|}): Promise<Array<OutputTypeAddress | OutputTypeAddressParams>> {
  const result = []
  for (let i = 0; i < (await request.txOutputs.len()); i++) {
    const output = await request.txOutputs.get(i)
    const address = await output.address()
    const jsAddr = await toHexOrBase58(address)

    const changeAddr = request.changeAddrs.find(
      (change) => jsAddr === change.address,
    )
    if (changeAddr != null) {
      verifyFromBip44Root(changeAddr.addressing)
      const addressParams = await toLedgerAddressParameters({
        networkId: request.networkId,
        address,
        path: changeAddr.addressing.path,
        addressingMap: request.addressingMap,
      })
      result.push({
        addressTypeNibble: addressParams.addressTypeNibble,
        spendingPath: addressParams.spendingPath,
        stakingBlockchainPointer: addressParams.stakingBlockchainPointer,
        stakingKeyHashHex: addressParams.stakingKeyHashHex,
        stakingPath: addressParams.stakingPath,
        amountStr: await (await output.amount()).to_str(),
      })
    } else {
      result.push({
        addressHex: Buffer.from(await address.to_bytes()).toString('hex'),
        amountStr: await (await output.amount()).to_str(),
      })
    }
  }
  return result
}

async function formatLedgerWithdrawals(
  withdrawals: Withdrawals,
  addressingMap: (string) => void | $PropertyType<Addressing, 'addressing'>,
): Promise<Array<Withdrawal>> {
  const result = []

  const withdrawalKeys = await withdrawals.keys()
  for (let i = 0; i < (await withdrawalKeys.len()); i++) {
    const rewardAddress = await withdrawalKeys.get(i) // RewardAddresses
    const withdrawalAmount = await withdrawals.get(rewardAddress) // BigNum
    if (withdrawalAmount == null) {
      throw new Error(
        'formatLedgerWithdrawals: null withdrawal amount, should never happen',
      )
    }

    const rewardAddressPayload = Buffer.from(
      await (await rewardAddress.to_address()).to_bytes(),
    ).toString('hex')
    const addressing = addressingMap(rewardAddressPayload)
    if (addressing == null) {
      throw new Error(
        `formatLedgerWithdrawals Ledger can only withdraw from own address ${rewardAddressPayload}`,
      )
    }
    result.push({
      amountStr: await withdrawalAmount.to_str(),
      path: addressing.path,
    })
  }
  return result
}
async function formatLedgerCertificates(
  networkId: number,
  certificates: Certificates,
  addressingMap: (string) => void | $PropertyType<Addressing, 'addressing'>,
): Promise<Array<Certificate>> {
  const getPath = async (
    stakeCredential: StakeCredential,
  ): Promise<Array<number>> => {
    const rewardAddr = await RewardAddress.new(networkId, stakeCredential)
    const addressPayload = Buffer.from(
      await (await rewardAddr.to_address()).to_bytes(),
    ).toString('hex')
    const addressing = addressingMap(addressPayload)
    if (addressing == null) {
      throw new Error(
        `getPath: Ledger only supports certificates from own address ${addressPayload}`,
      )
    }
    return addressing.path
  }

  const result = []
  for (let i = 0; i < (await certificates.len()); i++) {
    const cert = await certificates.get(i)

    const registrationCert = await cert.as_stake_registration()
    if (registrationCert != null) {
      result.push({
        type: CertTypes.staking_key_registration,
        path: await getPath(await registrationCert.stake_credential()),
        poolKeyHashHex: undefined,
      })
      continue
    }
    const deregistrationCert = await cert.as_stake_deregistration()
    if (deregistrationCert != null) {
      result.push({
        type: CertTypes.staking_key_deregistration,
        path: await getPath(await deregistrationCert.stake_credential()),
        poolKeyHashHex: undefined,
      })
      continue
    }
    const delegationCert = await cert.as_stake_delegation()
    if (delegationCert != null) {
      result.push({
        type: CertTypes.delegation,
        path: await getPath(await delegationCert.stake_credential()),
        poolKeyHashHex: Buffer.from(
          await (await delegationCert.pool_keyhash()).to_bytes(),
        ).toString('hex'),
      })
      continue
    }
    throw new Error(
      "formatLedgerCertificates: Ledger doesn't support this certificate type",
    )
  }
  return result
}

export async function toLedgerAddressParameters(request: {|
  networkId: number,
  address: Address,
  path: Array<number>,
  addressingMap: (string) => void | $PropertyType<Addressing, 'addressing'>,
|}): Promise<{|
  addressTypeNibble: $Values<typeof AddressTypeNibbles>,
  networkIdOrProtocolMagic: number,
  spendingPath: BIP32Path,
  stakingPath: ?BIP32Path,
  stakingKeyHashHex: ?string,
  stakingBlockchainPointer: ?StakingBlockchainPointer,
|}> {
  {
    const byronAddr = await ByronAddress.from_address(request.address)
    if (byronAddr) {
      return {
        addressTypeNibble: AddressTypeNibbles.BYRON,
        networkIdOrProtocolMagic: await byronAddr.byron_protocol_magic(),
        spendingPath: request.path,
        stakingPath: undefined,
        stakingKeyHashHex: undefined,
        stakingBlockchainPointer: undefined,
      }
    }
  }
  {
    const baseAddr = await BaseAddress.from_address(request.address)
    if (baseAddr) {
      const rewardAddr = await RewardAddress.new(
        request.networkId,
        await baseAddr.stake_cred(),
      )
      const addressPayload = Buffer.from(
        await (await rewardAddr.to_address()).to_bytes(),
      ).toString('hex')
      const addressing = request.addressingMap(addressPayload)

      let stakingKeyInfo
      if (addressing == null) {
        const stakeCred = await baseAddr.stake_cred()
        const wasmHash =
          (await stakeCred.to_keyhash()) ?? (await stakeCred.to_scripthash())
        if (wasmHash == null) {
          throw new Error('toLedgerAddressParameters unknown hash type')
        }
        const hashInAddress = Buffer.from(await wasmHash.to_bytes()).toString(
          'hex',
        )

        stakingKeyInfo = {
          stakingPath: undefined,
          // can't always know staking key path since address may not belong to the wallet
          // (mangled address)
          stakingKeyHashHex: hashInAddress,
        }
      } else {
        stakingKeyInfo = {
          stakingPath: addressing.path,
          stakingKeyHashHex: undefined,
        }
      }
      return {
        addressTypeNibble: AddressTypeNibbles.BASE,
        networkIdOrProtocolMagic: await (await baseAddr.to_address()).network_id(),
        spendingPath: request.path,
        ...stakingKeyInfo,
        stakingBlockchainPointer: undefined,
      }
    }
  }
  // TODO(v-almonacid): PointerAddress not yet implemented
  // {
  //   const ptrAddr = await PointerAddress.from_address(request.address)
  //   if (ptrAddr) {
  //     const pointer = await ptrAddr.stake_pointer()
  //     return {
  //       addressTypeNibble: AddressTypeNibbles.POINTER,
  //       networkIdOrProtocolMagic: await (await ptrAddr.to_address()).network_id(),
  //       spendingPath: request.path,
  //       stakingPath: undefined,
  //       stakingKeyHashHex: undefined,
  //       stakingBlockchainPointer: {
  //         blockIndex: await pointer.slot(),
  //         txIndex: await pointer.tx_index(),
  //         certificateIndex: await pointer.cert_index(),
  //       },
  //     }
  //   }
  // }

  // TODO(v-almonacid): EnterpriseAddress not yet implemented
  // {
  //   const enterpriseAddr = await EnterpriseAddress.from_address(request.address)
  //   if (enterpriseAddr) {
  //     return {
  //       addressTypeNibble: AddressTypeNibbles.ENTERPRISE,
  //       networkIdOrProtocolMagic: await (await enterpriseAddr.to_address()).network_id(),
  //       spendingPath: request.path,
  //       stakingPath: undefined,
  //       stakingKeyHashHex: undefined,
  //       stakingBlockchainPointer: undefined,
  //     }
  //   }
  // }
  {
    const rewardAddr = await RewardAddress.from_address(request.address)
    if (rewardAddr) {
      return {
        addressTypeNibble: AddressTypeNibbles.REWARD,
        networkIdOrProtocolMagic: rewardAddr.to_address().network_id(),
        spendingPath: request.path, // reward addresses use spending path
        stakingPath: undefined,
        stakingKeyHashHex: undefined,
        stakingBlockchainPointer: undefined,
      }
    }
  }
  throw new Error('toLedgerAddressParameters: unknown address type')
}

export const signTxWithLedger = async (
  payload: SignTransactionRequest,
  hwDeviceInfo: HWDeviceInfo,
  useUSB?: boolean = false,
): Promise<SignTransactionResponse> => {
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
    Logger.debug('transport.id', transport.id)
    const appAda = new AppAda(transport)

    Logger.debug('ledgerUtils::signTxWithLedger inputs', payload.inputs)
    Logger.debug('ledgerUtils::signTxWithLedger outputs', payload.outputs)

    const ledgerSignature: SignTransactionResponse = await appAda.signTransaction(
      payload.networkId,
      payload.protocolMagic,
      payload.inputs,
      payload.outputs,
      payload.feeStr,
      payload.ttlStr,
      payload.certificates,
      payload.withdrawals,
      payload.metadataHashHex,
    )

    await transport.close()

    Logger.debug(
      'ledgerUtils::ledgerSignature',
      JSON.stringify(ledgerSignature),
    )
    return ledgerSignature
  } catch (e) {
    throw mapLedgerError(e)
  }
}

export const buildSignedTransaction = async (
  txBody: TransactionBody,
  senderUtxos: Array<AddressedUtxo>,
  witnesses: Array<Witness>,
  publicKey: {|
    ...Addressing,
    key: Bip32PublicKey,
  |},
  metadata: TransactionMetadata | void,
): Promise<Transaction> => {
  const isSameArray = (array1: Array<number>, array2: Array<number>) =>
    array1.length === array2.length &&
    array1.every((value, index) => value === array2[index])
  const findWitness = (path: Array<number>) => {
    for (const witness of witnesses) {
      if (isSameArray(witness.path, path)) {
        return witness.witnessSignatureHex
      }
    }
    throw new Error(
      `buildSignedTransaction no witness for ${JSON.stringify(path)}`,
    )
  }

  const keyLevel =
    publicKey.addressing.startLevel + publicKey.addressing.path.length - 1

  const witSet = await TransactionWitnessSet.new()
  const bootstrapWitnesses: Array<BootstrapWitness> = []
  const vkeys: Array<Vkeywitness> = []

  // Note: Ledger removes duplicate witnesses
  // but there may be a one-to-many relationship
  // ex: same witness is used in both a bootstrap witness and a vkey witness
  const seenVKeyWit = new Set<string>()
  const seenBootstrapWit = new Set<string>()

  for (const utxo of senderUtxos) {
    verifyFromBip44Root(utxo.addressing)

    const witness = findWitness(utxo.addressing.path)
    const addressKey = await derivePublicByAddressing({
      addressing: utxo.addressing,
      startingFrom: {
        level: keyLevel,
        key: publicKey.key,
      },
    })

    if (await ByronAddress.is_valid(utxo.receiver)) {
      const byronAddr = await ByronAddress.from_base58(utxo.receiver)
      const bootstrapWit = await BootstrapWitness.new(
        await Vkey.new(await addressKey.to_raw_key()),
        await Ed25519Signature.from_bytes(Buffer.from(witness, 'hex')),
        await addressKey.chaincode(),
        await byronAddr.attributes(),
      )
      const asString = Buffer.from(bootstrapWit.to_bytes()).toString('hex')
      if (seenBootstrapWit.has(asString)) {
        continue
      }
      seenBootstrapWit.add(asString)
      bootstrapWitnesses.push(bootstrapWit)
      continue
    }

    const vkeyWit = await Vkeywitness.new(
      await Vkey.new(await addressKey.to_raw_key()),
      await Ed25519Signature.from_bytes(Buffer.from(witness, 'hex')),
    )
    const asString = Buffer.from(await vkeyWit.to_bytes()).toString('hex')
    if (seenVKeyWit.has(asString)) {
      continue
    }
    seenVKeyWit.add(asString)
    vkeys.push(vkeyWit)
  }

  // add any staking key needed
  for (const witness of witnesses) {
    const addressing = {
      path: witness.path,
      startLevel: 1,
    }
    verifyFromBip44Root(addressing)
    if (
      witness.path[NUMBERS.BIP44_DERIVATION_LEVELS.CHAIN - 1] ===
      NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT
    ) {
      const stakingKey = await derivePublicByAddressing({
        addressing,
        startingFrom: {
          level: keyLevel,
          key: publicKey.key,
        },
      })
      const vkeyWit = await Vkeywitness.new(
        await Vkey.new(await stakingKey.to_raw_key()),
        await Ed25519Signature.from_bytes(
          Buffer.from(witness.witnessSignatureHex, 'hex'),
        ),
      )
      const asString = Buffer.from(await vkeyWit.to_bytes()).toString('hex')
      if (seenVKeyWit.has(asString)) {
        continue
      }
      seenVKeyWit.add(asString)
      vkeys.push(vkeyWit)
    }
  }
  if (bootstrapWitnesses.length > 0) {
    const bootstrapWitWasm = await BootstrapWitnesses.new()
    for (const bootstrapWit of bootstrapWitnesses) {
      await bootstrapWitWasm.add(bootstrapWit)
    }
    await witSet.set_bootstraps(bootstrapWitWasm)
  }
  if (vkeys.length > 0) {
    const vkeyWitWasm = await Vkeywitnesses.new()
    for (const vkey of vkeys) {
      await vkeyWitWasm.add(vkey)
    }
    await witSet.set_vkeys(vkeyWitWasm)
  }
  // TODO: handle script witnesses
  return await Transaction.new(txBody, witSet, metadata)
}
