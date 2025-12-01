import {cardanoConfig, derivationConfig} from '@yoroi/blockchains'
import {isRecord} from '@yoroi/common'
import {
  AdaAppClosedError,
  DeprecatedAdaAppError,
  GeneralConnectionError,
  HW,
  LedgerUserError,
  LocalizableError,
  RejectedByUserError,
  Wallet,
} from '@yoroi/types'

import type {
  GetExtendedPublicKeyRequest,
  GetExtendedPublicKeyResponse,
  GetSerialResponse,
  GetVersionResponse,
  MessageData,
  SignMessageResponse,
  SignTransactionRequest,
  SignTransactionResponse,
} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import AppAda, {
  DeviceStatusCodes,
} from '@cardano-foundation/ledgerjs-hw-app-cardano'
import TransportHID from '@ledgerhq/react-native-hid'
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble'
import {BleError} from 'react-native-ble-plx'

import {logger} from '~/kernel/logger/logger'
import {HARDWARE_WALLETS} from '~/wallets/hw/hw'

// Re-export for tests
export {DeprecatedAdaAppError}

const MIN_ADA_APP_VERSION = '2.2.1'
const MIN_ADA_APP_VERSION_SUPPORTING_CIP36 = 6
const MIN_ADA_APP_VERSION_SUPPORTING_CIP1694 = 7

// these are defined in LedgerConnectStore.js in yoroi-frontend
type LedgerConnectionResponse = {
  extendedPublicKeyResp: GetExtendedPublicKeyResponse
  deviceId: string | null | undefined
  deviceObj: HW.DeviceObj | null | undefined
  serialHex: string
}

const isConnectionError = (e: unknown): e is Error => {
  if (
    !(
      e instanceof Error ||
      (isRecord(e) &&
        typeof e.message === 'string' &&
        typeof e.name === 'string')
    )
  )
    return false
  const error = e as {message: string; name: string}
  if (
    e instanceof BleError ||
    error.message.includes('was disconnected') ||
    error.message.includes('DisconnectedDevice') ||
    error.name.includes('DisconnectedDevice') ||
    error.message.includes('not found')
  ) {
    return true
  }

  return false
}

// note: e.statusCode === DeviceErrorCodes.ERR_CLA_NOT_SUPPORTED is more probably due
// to user not having ADA app opened instead of having the wrong app opened
const isUserError = (e: unknown): boolean => {
  if (
    isRecord(e) &&
    e.code != null &&
    e.code === DeviceStatusCodes.ERR_CLA_NOT_SUPPORTED
  ) {
    return true
  }

  return false
}

const isRejectedError = (e: unknown): boolean => {
  if (
    isRecord(e) &&
    e.code != null &&
    e.code === DeviceStatusCodes.ERR_REJECTED_BY_USER
  ) {
    return true
  }

  return false
}

const isAdaAppClosedError = (e: unknown): boolean => {
  return e instanceof Error && e.message.includes('0x6e01')
}

const mapLedgerError = (e: unknown): Error | LocalizableError => {
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
    return e instanceof Error ? e : new Error(String(e))
  }
}

//
// ============== General util ==================
const getXPubPathRequest = (
  implementation: Wallet.Implementation,
  accountVisual: number,
): GetExtendedPublicKeyRequest => {
  const implementationConfig = cardanoConfig.implementations[implementation]
  const {purpose, coinType} = implementationConfig.derivations.base.harden
  return {
    path: [purpose, coinType, derivationConfig.hardStart + accountVisual],
  }
}

export const checkDeviceVersion = (
  versionResponse: GetVersionResponse,
): void => {
  if (
    versionResponse.version.major == null ||
    versionResponse.version.minor == null ||
    versionResponse.version.patch == null
  ) {
    logger.warn('checkDeviceVersion: incomplete version data from device', {
      versionResponse,
    })
    return
  }

  const deviceVersionArray = [
    versionResponse.version.major,
    versionResponse.version.minor,
    versionResponse.version.patch,
  ]
  const minVersionArray = MIN_ADA_APP_VERSION.split('.')

  if (minVersionArray.length !== deviceVersionArray.length) {
    logger.warn('checkDeviceVersion: version formats mismatch', {
      minVersionArray,
      deviceVersionArray,
    })
    return
  }

  for (let i = 0; i < minVersionArray.length; i++) {
    const minRequired = parseInt(minVersionArray[i]!, 10)

    if (deviceVersionArray[i]! < minRequired) {
      throw new DeprecatedAdaAppError(MIN_ADA_APP_VERSION)
    }

    if (deviceVersionArray[i]! > minRequired) {
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
    // Ensure transport is settled before first APDU
    await new Promise((resolve) => setTimeout(resolve, 50))
    const versionResp: GetVersionResponse = await appAda.getVersion()

    logger.debug('connectionHandler: AppAda version', {versionResp})
    checkDeviceVersion(versionResp)

    return appAda
  } catch (e) {
    logger.error('connectionHandler error', {error: e, useUSB, deviceId})
    throw mapLedgerError(e)
  }
}

export const getHWDeviceInfo = async (
  implementation: Wallet.Implementation,
  deviceId: string | null | undefined,
  deviceObj: HW.DeviceObj | null | undefined,
  useUSB = false,
  accountVisual = 0, // default to first account
): Promise<HW.DeviceInfo> => {
  try {
    const appAda = await connectionHandler(deviceId, deviceObj, useUSB)
    // assume single account in Yoroi
    const accountPath = getXPubPathRequest(implementation, accountVisual)
    // i.e hdPath = [2147483692, 2147485463, 2147483648]
    const extendedPublicKeyResp: GetExtendedPublicKeyResponse =
      await appAda.getExtendedPublicKey(accountPath)
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
    logger.error('getHWDeviceInfo error', {
      error: e,
      implementation,
      deviceId,
      deviceObj,
      useUSB,
    })
    throw mapLedgerError(e)
  }
}

const validateHWResponse = (resp: LedgerConnectionResponse): boolean => {
  const {extendedPublicKeyResp, deviceId, deviceObj, serialHex} = resp

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

  if (serialHex == null) {
    throw new Error(
      'LedgerUtils::validateHWResponse: device serial number is undefined',
    )
  }

  return true
}

const normalizeHWResponse = (resp: LedgerConnectionResponse): HW.DeviceInfo => {
  validateHWResponse(resp)
  const {extendedPublicKeyResp, deviceId, deviceObj, serialHex} = resp
  return {
    bip44AccountPublic:
      extendedPublicKeyResp.publicKeyHex + extendedPublicKeyResp.chainCodeHex,
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
export const doesCardanoAppVersionSupportCIP1694 = (majorVersion: number) => {
  return majorVersion >= MIN_ADA_APP_VERSION_SUPPORTING_CIP1694
}

//
// ============== transaction logic ==================
//

export const getCardanoAppMajorVersion = async (
  hwDeviceInfo: HW.DeviceInfo,
  useUSB: boolean,
) => {
  const appAda = await connectionHandler(
    hwDeviceInfo.hwFeatures.deviceId,
    hwDeviceInfo.hwFeatures.deviceObj,
    useUSB,
  )
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
    const appAda = await connectionHandler(
      hwDeviceInfo.hwFeatures.deviceId,
      hwDeviceInfo.hwFeatures.deviceObj,
      useUSB,
    )
    const ledgerSignature: SignTransactionResponse =
      await appAda.signTransaction(signRequest)
    await appAda.transport.close()
    return ledgerSignature
  } catch (e) {
    throw mapLedgerError(e)
  }
}

export const signMessageWithLedger = async (
  signRequest: MessageData,
  hwDeviceInfo: HW.DeviceInfo,
  useUSB: boolean,
): Promise<SignMessageResponse> => {
  try {
    const appAda = await connectionHandler(
      hwDeviceInfo.hwFeatures.deviceId,
      hwDeviceInfo.hwFeatures.deviceObj,
      useUSB,
    )
    const ledgerSignature = await appAda.signMessage(signRequest)
    await appAda.transport.close()
    return ledgerSignature
  } catch (e) {
    throw mapLedgerError(e)
  }
}
