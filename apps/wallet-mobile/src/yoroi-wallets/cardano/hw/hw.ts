/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  GetExtendedPublicKeyRequest,
  GetExtendedPublicKeyResponse,
  GetSerialResponse,
  GetVersionResponse,
  SignTransactionRequest,
  SignTransactionResponse,
} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import AppAda, {DeviceStatusCodes} from '@cardano-foundation/ledgerjs-hw-app-cardano'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import TransportHID from '@emurgo/react-native-hid'
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble'
import {HW, Wallet} from '@yoroi/types'
import {BleError} from 'react-native-ble-plx'

import {ledgerMessages} from '../../../kernel/i18n/global-messages'
import LocalizableError from '../../../kernel/i18n/LocalizableError'
import {logger} from '../../../kernel/logger/logger'
import {
  AdaAppClosedError,
  GeneralConnectionError,
  HARDWARE_WALLETS,
  LedgerUserError,
  RejectedByUserError,
} from '../../hw'
import {NUMBERS} from '../numbers'
import {isByron, isShelley} from '../utils'

const MIN_ADA_APP_VERSION = '2.2.1'
const MIN_ADA_APP_VERSION_SUPPORTING_CIP36 = 6

export type WalletType = 'BIP44' | 'CIP1852'

// these are defined in LedgerConnectStore.js in yoroi-frontend
export type LedgerConnectionResponse = {
  extendedPublicKeyResp: GetExtendedPublicKeyResponse
  deviceId: string | null | undefined
  deviceObj: HW.DeviceObj | null | undefined
  serialHex: string
}

export class DeprecatedAdaAppError extends LocalizableError {
  constructor() {
    super({
      id: ledgerMessages.deprecatedAdaAppError.id,
      defaultMessage: ledgerMessages.deprecatedAdaAppError.defaultMessage,
      values: {
        version: `${MIN_ADA_APP_VERSION}`,
      },
    })
  }
}

const isConnectionError = (e: Error | any): boolean => {
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
const isUserError = (e: Error | any): boolean => {
  if (e && e.code != null && e.code === DeviceStatusCodes.ERR_CLA_NOT_SUPPORTED) {
    return true
  }

  return false
}

const isRejectedError = (e: Error | any): boolean => {
  if (e && e.code != null && e.code === DeviceStatusCodes.ERR_REJECTED_BY_USER) {
    return true
  }

  return false
}

const isAdaAppClosedError = (e: Error | unknown): boolean => {
  return e instanceof Error && e.message.includes('0x6e01')
}

const mapLedgerError = (e: Error | any): Error | LocalizableError => {
  if (isAdaAppClosedError(e)) {
    return new AdaAppClosedError()
  } else if (isUserError(e)) {
    return new LedgerUserError()
  } else if (isRejectedError(e)) {
    return new RejectedByUserError()
  } else if (isConnectionError(e)) {
    return new GeneralConnectionError()
  } else if (e instanceof DeprecatedAdaAppError) {
    return e
  } else {
    logger.error('mapLedgerError: Unexpected error', {e})
    return e
  }
}

//
// ============== General util ==================
//

const HARDENED = NUMBERS.HARD_DERIVATION_START
const WALLET_TYPE_PURPOSE = NUMBERS.WALLET_TYPE_PURPOSE
const COIN_TYPE = NUMBERS.COIN_TYPES.CARDANO

const getWalletType = (implementation: Wallet.Implementation): WalletType => {
  if (isByron(implementation)) {
    return 'BIP44'
  } else if (isShelley(implementation)) {
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

export const checkDeviceVersion = (versionResponse: GetVersionResponse): void => {
  if (
    versionResponse.version.major == null ||
    versionResponse.version.minor == null ||
    versionResponse.version.patch == null
  ) {
    logger.warn('checkDeviceVersion: incomplete version data from device', {versionResponse})
    return
  }

  const deviceVersionArray = [
    versionResponse.version.major,
    versionResponse.version.minor,
    versionResponse.version.patch,
  ]
  const minVersionArray = MIN_ADA_APP_VERSION.split('.')

  if (minVersionArray.length !== deviceVersionArray.length) {
    logger.warn('checkDeviceVersion: version formats mismatch', {minVersionArray, deviceVersionArray})
    return
  }

  for (let i = 0; i < minVersionArray.length; i++) {
    const minRequired = parseInt(minVersionArray[i], 10)

    if (deviceVersionArray[i] < minRequired) {
      throw new DeprecatedAdaAppError()
    }

    if (deviceVersionArray[i] > minRequired) {
      // This part of the version is greater than the min required
      // which means next parts don't need to be checked
      // E.g. [3, 0, 0] is greater than [2, 9, 9] just because the 3 is greater than 2
      break
    }
  }
}

const connectionHandler = async (
  deviceId: string | null | undefined,
  deviceObj: HW.DeviceObj | null | undefined,
  useUSB = false,
): Promise<AppAda> => {
  let transport

  try {
    if (useUSB) {
      if (deviceObj == null) {
        throw new Error('ledgerUtils::connectionHandler deviceObj is null')
      }

      transport = await TransportHID.open(deviceObj)
    } else {
      if (deviceId == null) {
        throw new Error('ledgerUtils::connectionHandler deviceId is null')
      }

      transport = await TransportBLE.open(deviceId)
    }

    const appAda = new AppAda(transport)
    const versionResp: GetVersionResponse = await appAda.getVersion()
    logger.debug('connectionHandler: AppAda version', {versionResp})
    checkDeviceVersion(versionResp)
    return appAda
  } catch (e) {
    throw mapLedgerError(e)
  }
}

export const getHWDeviceInfo = async (
  implementation: Wallet.Implementation,
  deviceId: string | null | undefined,
  deviceObj: HW.DeviceObj | null | undefined,
  useUSB = false,
): Promise<HW.DeviceInfo> => {
  try {
    const appAda = await connectionHandler(deviceId, deviceObj, useUSB)
    // assume single account in Yoroi
    const accountPath = makeCardanoAccountBIP44Path(getWalletType(implementation), NUMBERS.ACCOUNT_INDEX)
    // get Cardano's first account
    // i.e hdPath = [2147483692, 2147485463, 2147483648]
    const extendedPublicKeyResp: GetExtendedPublicKeyResponse = await appAda.getExtendedPublicKey(accountPath)
    const serial: GetSerialResponse = await appAda.getSerial()
    const hwDeviceInfo = normalizeHWResponse({
      extendedPublicKeyResp,
      deviceId,
      deviceObj,
      ...serial,
    })
    await appAda.transport.close()
    return hwDeviceInfo
  } catch (e) {
    throw mapLedgerError(e)
  }
}

const validateHWResponse = (resp: LedgerConnectionResponse): boolean => {
  const {extendedPublicKeyResp, deviceId, deviceObj, serialHex} = resp

  if (deviceId == null && deviceObj == null) {
    throw new Error('LedgerUtils::validateHWResponse: a non-null descriptor is required')
  }

  if (extendedPublicKeyResp == null) {
    throw new Error('LedgerUtils::validateHWResponse: extended public key is undefined')
  }

  if (serialHex == null) {
    throw new Error('LedgerUtils::validateHWResponse: device serial number is undefined')
  }

  return true
}

export const normalizeHWResponse = (resp: LedgerConnectionResponse): HW.DeviceInfo => {
  validateHWResponse(resp)
  const {extendedPublicKeyResp, deviceId, deviceObj, serialHex} = resp
  return {
    bip44AccountPublic: extendedPublicKeyResp.publicKeyHex + extendedPublicKeyResp.chainCodeHex,
    hwFeatures: {
      vendor: HARDWARE_WALLETS.LEDGER_NANO.VENDOR,
      model: HARDWARE_WALLETS.LEDGER_NANO.MODEL,
      deviceId,
      deviceObj,
      serialHex,
    },
  }
}

export const doesCardanoAppVersionSupportCIP36 = (majorVersion: number) => {
  return majorVersion >= MIN_ADA_APP_VERSION_SUPPORTING_CIP36
}

//
// ============== transaction logic ==================
//

export const getCardanoAppMajorVersion = async (hwDeviceInfo: HW.DeviceInfo, useUSB: boolean) => {
  const appAda = await connectionHandler(hwDeviceInfo.hwFeatures.deviceId, hwDeviceInfo.hwFeatures.deviceObj, useUSB)
  const {version} = await appAda.getVersion()
  logger.debug('getCardanoAppMajorVersion: version', {version})
  return version.major
}

export const signTxWithLedger = async (
  signRequest: SignTransactionRequest,
  hwDeviceInfo: HW.DeviceInfo,
  useUSB: boolean,
) => {
  try {
    const appAda = await connectionHandler(hwDeviceInfo.hwFeatures.deviceId, hwDeviceInfo.hwFeatures.deviceObj, useUSB)
    const ledgerSignature: SignTransactionResponse = await appAda.signTransaction(signRequest)
    await appAda.transport.close()
    return ledgerSignature
  } catch (e) {
    throw mapLedgerError(e)
  }
}
