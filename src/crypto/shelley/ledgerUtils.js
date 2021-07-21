// @flow

import AppAda, {
  AddressType,
  DeviceStatusCodes,
  CertificateType,
  TxOutputDestinationType,
  TransactionSigningMode,
  TxAuxiliaryDataType,
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
  Certificates,
  Ed25519Signature,
  MultiAsset,
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
  Withdrawals,
} from '@emurgo/react-native-haskell-shelley'

import {Logger} from '../../utils/logging'
import {CONFIG, isByron, isHaskellShelley} from '../../config/config'
import {getNetworkConfigById} from '../../config/networks'
import {NUMBERS} from '../../config/numbers'
import {verifyFromBip44Root, toHexOrBase58, normalizeToAddress, derivePublicByAddressing} from './utils'
import {ledgerMessages} from '../../i18n/global-messages'
import LocalizableError from '../../i18n/LocalizableError'

import type {Address as JsAddress, Addressing, AddressedUtxo, Value} from '../../crypto/types'
import type {
  AssetGroup,
  BIP32Path,
  Certificate,
  GetVersionResponse,
  GetExtendedPublicKeyRequest,
  GetExtendedPublicKeyResponse,
  GetSerialResponse,
  SignTransactionResponse,
  Token as LedgerToken,
  Witness,
  Withdrawal,
  // new types
  DeviceOwnedAddress,
  SignTransactionRequest,
  TxInput,
  TxOutput,
} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import type {WalletImplementationId, NetworkId} from '../../config/types'
import type {HaskellShelleyTxSignRequest} from './HaskellShelleyTxSignRequest'

//
// ============== Errors ==================
//

export class BluetoothDisabledError extends LocalizableError {
  constructor() {
    super({
      id: ledgerMessages.bluetoothDisabledError.id,
      // $FlowFixMe undefined is not compatible with string
      defaultMessage: ledgerMessages.bluetoothDisabledError.defaultMessage,
    })
  }
}

export class GeneralConnectionError extends LocalizableError {
  constructor() {
    super({
      id: ledgerMessages.connectionError.id,
      // $FlowFixMe undefined is not compatible with string
      defaultMessage: ledgerMessages.connectionError.defaultMessage,
    })
  }
}

// note: uses same message as above.
export class LedgerUserError extends LocalizableError {
  constructor() {
    super({
      id: ledgerMessages.connectionError.id,
      // $FlowFixMe undefined is not compatible with string
      defaultMessage: ledgerMessages.connectionError.defaultMessage,
    })
  }
}

export class RejectedByUserError extends LocalizableError {
  constructor() {
    super({
      id: ledgerMessages.rejectedByUserError.id,
      // $FlowFixMe undefined is not compatible with string
      defaultMessage: ledgerMessages.rejectedByUserError.defaultMessage,
    })
  }
}

export class DeprecatedAdaAppError extends LocalizableError {
  constructor() {
    super({
      id: ledgerMessages.deprecatedAdaAppError.id,
      // $FlowFixMe undefined is not compatible with string
      defaultMessage: ledgerMessages.deprecatedAdaAppError.defaultMessage,
      values: {
        version: `${CONFIG.HARDWARE_WALLETS.LEDGER_NANO.MIN_ADA_APP_VERSION}`,
      },
    })
  }
}

export class NoDeviceInfoError extends LocalizableError {
  constructor() {
    super({
      id: ledgerMessages.noDeviceInfoError.id,
      // $FlowFixMe undefined is not compatible with string
      defaultMessage: ledgerMessages.noDeviceInfoError.defaultMessage,
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

// note: e.statusCode === DeviceErrorCodes.ERR_CLA_NOT_SUPPORTED is more probably due
// to user not having ADA app opened instead of having the wrong app opened
const _isUserError = (e: Error | TransportStatusError): boolean => {
  if (e && e.code != null && e.code === DeviceStatusCodes.ERR_CLA_NOT_SUPPORTED) {
    return true
  }
  return false
}

const _isRejectedError = (e: Error | TransportStatusError): boolean => {
  if (e && e.code != null && e.code === DeviceStatusCodes.ERR_REJECTED_BY_USER) {
    return true
  }
  return false
}

export const mapLedgerError = (e: Error | TransportStatusError): Error | LocalizableError => {
  if (_isUserError(e)) {
    Logger.info('ledgerUtils::mapLedgerError: User-side error', e)
    return new LedgerUserError()
  } else if (_isRejectedError(e)) {
    Logger.info('ledgerUtils::mapLedgerError: Rejected by user error', e)
    return new RejectedByUserError()
  } else if (_isConnectionError(e)) {
    Logger.info('ledgerUtils::mapLedgerError: General/BleError', e)
    return new GeneralConnectionError()
  } else if (e instanceof DeprecatedAdaAppError) {
    Logger.info('ledgerUtils::mapLedgerError: Deprecated Ada app', e)
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

const makeCardanoAccountBIP44Path: (walletType: WalletType, account: number) => GetExtendedPublicKeyRequest = (
  walletType: WalletType,
  account: number,
) => ({
  path: [WALLET_TYPE_PURPOSE[walletType], COIN_TYPE, HARDENED + account],
})

const validateHWResponse = (resp: LedgerConnectionResponse): boolean => {
  const {extendedPublicKeyResp, deviceId, deviceObj, serial} = resp
  if (deviceId == null && deviceObj == null) {
    throw new Error('LedgerUtils::validateHWResponse: a non-null descriptor is required')
  }
  if (extendedPublicKeyResp == null) {
    throw new Error('LedgerUtils::validateHWResponse: extended public key is undefined')
  }
  if (serial == null) {
    throw new Error('LedgerUtils::validateHWResponse: device serial number is undefined')
  }
  return true
}

const normalizeHWResponse = (resp: LedgerConnectionResponse): HWDeviceInfo => {
  validateHWResponse(resp)
  const {extendedPublicKeyResp, deviceId, deviceObj, serial} = resp
  return {
    bip44AccountPublic: extendedPublicKeyResp.publicKeyHex + extendedPublicKeyResp.chainCodeHex,
    hwFeatures: {
      vendor: VENDOR,
      model: MODEL,
      deviceId,
      deviceObj,
      serial,
    },
  }
}

export const checkDeviceVersion = (versionResponse: GetVersionResponse): void => {
  if (
    versionResponse.version.major == null ||
    versionResponse.version.minor == null ||
    versionResponse.version.patch == null
  ) {
    Logger.warn('ledgerUtils::checkDeviceVersion: incomplete version data from device')
    return
  }
  const deviceVersionArray = [
    versionResponse.version.major,
    versionResponse.version.minor,
    versionResponse.version.patch,
  ]
  const minVersionArray = CONFIG.HARDWARE_WALLETS.LEDGER_NANO.MIN_ADA_APP_VERSION.split('.')
  if (minVersionArray.length !== deviceVersionArray.length) {
    Logger.warn('ledgerUtils::checkDeviceVersion: version formats mismatch')
    return
  }
  for (let i = 0; i < minVersionArray.length; i++) {
    if (deviceVersionArray[i] < parseInt(minVersionArray[i], 10)) {
      throw new DeprecatedAdaAppError()
    }
  }
}

const connectionHandler = async (
  deviceId: ?DeviceId,
  deviceObj: ?DeviceObj,
  useUSB?: boolean = false,
): Promise<AppAda> => {
  let transport
  if (useUSB) {
    if (deviceObj == null) {
      throw new Error('ledgerUtils::connectionHandler deviceObj is null')
    }
    // $FlowFixMe not sure why flow fails to get the return type
    transport = await TransportHID.open(deviceObj)
  } else {
    if (deviceId == null) {
      throw new Error('ledgerUtils::connectionHandler deviceId is null')
    }
    // check for permissions just in case
    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
    }
    transport = await TransportBLE.open(deviceId)
  }
  const appAda = new AppAda(transport)
  const versionResp: GetVersionResponse = await appAda.getVersion()
  Logger.debug('ledgerUtils::connectionHandler: AppAda version', versionResp)
  checkDeviceVersion(versionResp)
  return appAda
}

export const getHWDeviceInfo = async (
  walletImplementationId: WalletImplementationId,
  deviceId: ?DeviceId,
  deviceObj: ?DeviceObj,
  useUSB?: boolean = false,
): Promise<HWDeviceInfo> => {
  try {
    Logger.debug('ledgerUtils::getHWDeviceInfo called')

    const appAda = await connectionHandler(deviceId, deviceObj, useUSB)

    // assume single account in Yoroi
    const accountPath = makeCardanoAccountBIP44Path(getWalletType(walletImplementationId), CONFIG.NUMBERS.ACCOUNT_INDEX)
    Logger.debug('bip44 account path', accountPath)

    // get Cardano's first account
    // i.e hdPath = [2147483692, 2147485463, 2147483648]
    const extendedPublicKeyResp: GetExtendedPublicKeyResponse = await appAda.getExtendedPublicKey(accountPath)
    Logger.debug('extended public key', extendedPublicKeyResp)

    const serial: GetSerialResponse = await appAda.getSerial()

    const hwDeviceInfo = normalizeHWResponse({
      extendedPublicKeyResp,
      deviceId,
      deviceObj,
      ...serial,
    })
    Logger.info('ledgerUtils::getHWDeviceInfo: Ledger device OK')
    Logger.info('hwDeviceInfo', hwDeviceInfo)
    await appAda.transport.close()
    return hwDeviceInfo
  } catch (e) {
    throw mapLedgerError(e)
  }
}

export const verifyAddress = async (
  walletImplementationId: WalletImplementationId,
  networkId: NetworkId,
  byronNetworkMagic: number,
  address: string,
  addressing: $PropertyType<Addressing, 'addressing'>,
  hwDeviceInfo: HWDeviceInfo,
  useUSB?: boolean = false,
): Promise<void> => {
  try {
    Logger.debug('ledgerUtils::verifyAddress called')
    Logger.debug('hwDeviceInfo', hwDeviceInfo)
    Logger.debug('path', addressing.path)
    Logger.debug('useUSB', useUSB)

    if (hwDeviceInfo == null) {
      throw new Error('ledgerUtils::verifyAddress: hwDeviceInfo is null')
    }

    verifyFromBip44Root(addressing)

    const addressPtr = await normalizeToAddress(address)

    let chainNetworkId = CONFIG.NETWORKS.HASKELL_SHELLEY.CHAIN_NETWORK_ID
    const networkConfig = getNetworkConfigById(networkId)
    if (networkConfig.CHAIN_NETWORK_ID != null) {
      chainNetworkId = networkConfig.CHAIN_NETWORK_ID
    }

    const stakingKeyAddressing = {}
    if (isHaskellShelley(walletImplementationId)) {
      const baseAddr = await BaseAddress.from_address(addressPtr)
      if (baseAddr) {
        const rewardAddr = await RewardAddress.new(Number.parseInt(chainNetworkId, 10), await baseAddr.stake_cred())
        const addressPayload = Buffer.from(await (await rewardAddr.to_address()).to_bytes()).toString('hex')
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
      networkId: Number.parseInt(chainNetworkId, 10),
      address: await normalizeToAddress(address),
      path: addressing.path,
      addressingMap,
    })

    const appAda = await connectionHandler(hwDeviceInfo.hwFeatures.deviceId, hwDeviceInfo.hwFeatures.deviceObj, useUSB)

    await appAda.showAddress({
      network: {
        protocolMagic: byronNetworkMagic,
        networkId: Number.parseInt(chainNetworkId, 10),
      },
      address: addressParams,
    })
    await appAda.transport.close()
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
  chainNetworkId: number,
  addressingMap: (string) => void | $PropertyType<Addressing, 'addressing'>,
|}): Promise<SignTransactionRequest> => {
  Logger.debug('ledgerUtils::createLedgerSignTxPayload called')
  Logger.debug('signRequest', JSON.stringify(request.signRequest))

  const network = {
    protocolMagic: request.byronNetworkMagic,
    networkId: request.chainNetworkId,
  }

  const txBody = await request.signRequest.self().build()

  // Inputs
  const ledgerInputs = _transformToLedgerInputs(request.signRequest.senderUtxos)

  // Outputs
  const ledgerOutputs = await _transformToLedgerOutputs({
    networkId: request.chainNetworkId,
    txOutputs: await txBody.outputs(),
    changeAddrs: request.signRequest.changeAddr,
    addressingMap: request.addressingMap,
  })

  // withdrawals
  const withdrawals = await txBody.withdrawals()

  const certificates = await txBody.certs()

  const ledgerWithdrawal = []
  if (withdrawals != null && (await withdrawals.len()) > 0) {
    ledgerWithdrawal.push(...(await formatLedgerWithdrawals(withdrawals, request.addressingMap)))
  }

  const ledgerCertificates = []
  if (certificates != null && (await certificates.len()) > 0) {
    ledgerCertificates.push(
      ...(await formatLedgerCertificates(request.chainNetworkId, certificates, request.addressingMap)),
    )
  }

  const ttl = await txBody.ttl()

  let auxiliaryData
  if (request.signRequest.ledgerNanoCatalystRegistrationTxSignData) {
    const {votingPublicKey, stakingKeyPath, nonce} = request.signRequest.ledgerNanoCatalystRegistrationTxSignData

    auxiliaryData = {
      type: TxAuxiliaryDataType.CATALYST_REGISTRATION,
      params: {
        votingPublicKeyHex: votingPublicKey,
        stakingPath: stakingKeyPath,
        rewardsDestination: {
          type: AddressType.REWARD,
          params: {
            stakingPath: stakingKeyPath,
          },
        },
        nonce,
      },
    }
  }

  return {
    signingMode: TransactionSigningMode.ORDINARY_TRANSACTION,
    tx: {
      network,
      inputs: ledgerInputs,
      outputs: ledgerOutputs,
      fee: await (await txBody.fee()).to_str(),
      ttl: ttl === undefined ? ttl : ttl.toString(),
      certificates: ledgerCertificates,
      withdrawals: ledgerWithdrawal,
      auxiliaryData,
      validityIntervalStart: undefined,
    },
  }
}

function _transformToLedgerInputs(inputs: Array<AddressedUtxo>): Array<TxInput> {
  for (const input of inputs) {
    verifyFromBip44Root(input.addressing)
  }
  return inputs.map((input) => ({
    txHashHex: input.tx_hash,
    outputIndex: input.tx_index,
    path: input.addressing.path,
  }))
}

async function toLedgerTokenBundle(assets: ?MultiAsset): Promise<Array<AssetGroup>> {
  const assetGroup: Array<AssetGroup> = []
  if (assets == null) return assetGroup

  const policyHashes = await assets.keys()
  for (let i = 0; i < (await policyHashes.len()); i++) {
    const policyId = await policyHashes.get(i)
    const assetsForPolicy = await assets.get(policyId)
    if (assetsForPolicy == null) continue

    const tokens: Array<LedgerToken> = []
    const assetNames = await assetsForPolicy.keys()
    for (let j = 0; j < (await assetNames.len()); j++) {
      const assetName = await assetNames.get(j)
      const amount = await assetsForPolicy.get(assetName)
      if (amount == null) continue

      tokens.push({
        amount: await amount.to_str(),
        assetNameHex: Buffer.from(await assetName.name()).toString('hex'),
      })
    }
    assetGroup.push({
      policyIdHex: Buffer.from(await policyId.to_bytes()).toString('hex'),
      tokens,
    })
  }
  return assetGroup
}

async function _transformToLedgerOutputs(request: {|
  networkId: number,
  txOutputs: TransactionOutputs,
  changeAddrs: Array<{|...JsAddress, ...Value, ...Addressing|}>,
  addressingMap: (string) => void | $PropertyType<Addressing, 'addressing'>,
|}): Promise<Array<TxOutput>> {
  const result = []
  for (let i = 0; i < (await request.txOutputs.len()); i++) {
    const output = await request.txOutputs.get(i)
    const address = await output.address()
    const jsAddr = await toHexOrBase58(address)

    const changeAddr = request.changeAddrs.find((change) => jsAddr === change.address)
    if (changeAddr != null) {
      // in this case the address belongs to us
      verifyFromBip44Root(changeAddr.addressing)
      const addressParams = await toLedgerAddressParameters({
        networkId: request.networkId,
        address,
        path: changeAddr.addressing.path,
        addressingMap: request.addressingMap,
      })
      result.push({
        amount: await (await (await output.amount()).coin()).to_str(),
        tokenBundle: await toLedgerTokenBundle(await (await output.amount()).multiasset()),
        destination: {
          type: TxOutputDestinationType.DEVICE_OWNED,
          params: addressParams,
        },
      })
    } else {
      result.push({
        amount: await (await (await output.amount()).coin()).to_str(),
        tokenBundle: await toLedgerTokenBundle(await (await output.amount()).multiasset()),
        destination: {
          type: TxOutputDestinationType.THIRD_PARTY,
          params: {
            addressHex: Buffer.from(await address.to_bytes()).toString('hex'),
          },
        },
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
      throw new Error('formatLedgerWithdrawals: null withdrawal amount, should never happen')
    }

    const rewardAddressPayload = Buffer.from(await (await rewardAddress.to_address()).to_bytes()).toString('hex')
    const addressing = addressingMap(rewardAddressPayload)
    if (addressing == null) {
      throw new Error(`formatLedgerWithdrawals Ledger can only withdraw from own address ${rewardAddressPayload}`)
    }
    result.push({
      amount: await withdrawalAmount.to_str(),
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
  const getPath = async (stakeCredential: StakeCredential): Promise<BIP32Path> => {
    const rewardAddr = await RewardAddress.new(networkId, stakeCredential)
    const addressPayload = Buffer.from(await (await rewardAddr.to_address()).to_bytes()).toString('hex')
    const addressing = addressingMap(addressPayload)
    if (addressing == null) {
      throw new Error(`getPath: Ledger only supports certificates from own address ${addressPayload}`)
    }
    return addressing.path
  }

  const result = []
  for (let i = 0; i < (await certificates.len()); i++) {
    const cert = await certificates.get(i)

    const registrationCert = await cert.as_stake_registration()
    if (registrationCert != null) {
      result.push({
        type: CertificateType.STAKE_REGISTRATION,
        params: {
          path: await getPath(await registrationCert.stake_credential()),
        },
      })
      continue
    }
    const deregistrationCert = await cert.as_stake_deregistration()
    if (deregistrationCert != null) {
      result.push({
        type: CertificateType.STAKE_DEREGISTRATION,
        params: {
          path: await getPath(await registrationCert.stake_credential()),
        },
      })
      continue
    }
    const delegationCert = await cert.as_stake_delegation()
    if (delegationCert != null) {
      result.push({
        type: CertificateType.STAKE_DELEGATION,
        params: {
          path: await getPath(await registrationCert.stake_credential()),
          poolKeyHashHex: Buffer.from(await (await delegationCert.pool_keyhash()).to_bytes()).toString('hex'),
        },
      })
      continue
    }
    throw new Error("formatLedgerCertificates: Ledger doesn't support this certificate type")
  }
  return result
}

export async function toLedgerAddressParameters(request: {|
  networkId: number,
  address: Address,
  path: Array<number>,
  addressingMap: (string) => void | $PropertyType<Addressing, 'addressing'>,
|}): Promise<DeviceOwnedAddress> {
  {
    const byronAddr = await ByronAddress.from_address(request.address)
    if (byronAddr) {
      return {
        type: AddressType.BYRON,
        params: {
          spendingPath: request.path,
        },
      }
    }
  }
  {
    const baseAddr = await BaseAddress.from_address(request.address)
    if (baseAddr) {
      const rewardAddr = await RewardAddress.new(request.networkId, await baseAddr.stake_cred())
      const addressPayload = Buffer.from(await (await rewardAddr.to_address()).to_bytes()).toString('hex')
      const addressing = request.addressingMap(addressPayload)

      if (addressing == null) {
        const stakeCred = await baseAddr.stake_cred()
        const wasmHash = (await stakeCred.to_keyhash()) ?? (await stakeCred.to_scripthash())
        if (wasmHash == null) {
          throw new Error('toLedgerAddressParameters unknown hash type')
        }
        const hashInAddress = Buffer.from(await wasmHash.to_bytes()).toString('hex')
        return {
          type: AddressType.BASE,
          params: {
            spendingPath: request.path,
            // can't always know staking key path since address may not belong to the wallet
            // (mangled address)
            stakingKeyHashHex: hashInAddress,
          },
        }
      } else {
        return {
          type: AddressType.BASE,
          params: {
            spendingPath: request.path,
            // can't always know staking key path since address may not belong to the wallet
            // (mangled address)
            stakingPath: addressing.path,
          },
        }
      }
    }
  }
  // TODO(v-almonacid): PointerAddress not yet implemented (bindings missing)

  // TODO(v-almonacid): EnterpriseAddress not yet implemented (bindings missing)

  {
    const rewardAddr = await RewardAddress.from_address(request.address)
    if (rewardAddr) {
      return {
        type: AddressType.REWARD,
        params: {
          stakingPath: request.path,
        },
      }
    }
  }
  throw new Error('toLedgerAddressParameters: unknown address type')
}

export const signTxWithLedger = async (
  signRequest: SignTransactionRequest,
  hwDeviceInfo: HWDeviceInfo,
  useUSB: boolean,
): Promise<SignTransactionResponse> => {
  try {
    Logger.debug('ledgerUtils::signTxWithLedger called')

    if (hwDeviceInfo == null) {
      throw new Error('ledgerUtils::signTxWithLedger: hwDeviceInfo is null')
    }

    const appAda = await connectionHandler(hwDeviceInfo.hwFeatures.deviceId, hwDeviceInfo.hwFeatures.deviceObj, useUSB)

    Logger.debug('ledgerUtils::signTxWithLedger inputs', signRequest.tx.inputs)
    Logger.debug('ledgerUtils::signTxWithLedger outputs', signRequest.tx.outputs)

    const ledgerSignature: SignTransactionResponse = await appAda.signTransaction(signRequest)

    await appAda.transport.close()

    Logger.debug('ledgerUtils::ledgerSignature', JSON.stringify(ledgerSignature))
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
    array1.length === array2.length && array1.every((value, index) => value === array2[index])
  const findWitness = (path: Array<number>) => {
    for (const witness of witnesses) {
      if (isSameArray(witness.path, path)) {
        return witness.witnessSignatureHex
      }
    }
    throw new Error(`buildSignedTransaction no witness for ${JSON.stringify(path)}`)
  }

  const keyLevel = publicKey.addressing.startLevel + publicKey.addressing.path.length - 1

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
      const asString = Buffer.from(await bootstrapWit.to_bytes()).toString('hex')
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
    if (witness.path[NUMBERS.BIP44_DERIVATION_LEVELS.CHAIN - 1] === NUMBERS.CHAIN_DERIVATIONS.CHIMERIC_ACCOUNT) {
      const stakingKey = await derivePublicByAddressing({
        addressing,
        startingFrom: {
          level: keyLevel,
          key: publicKey.key,
        },
      })
      const vkeyWit = await Vkeywitness.new(
        await Vkey.new(await stakingKey.to_raw_key()),
        await Ed25519Signature.from_bytes(Buffer.from(witness.witnessSignatureHex, 'hex')),
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
