import {Permission, PermissionsAndroid, Platform} from 'react-native'
import {useMutation, UseMutationOptions} from '@tanstack/react-query'

import {ledgerMessages} from '../../kernel/i18n/global-messages'
import LocalizableError from '../../kernel/i18n/LocalizableError'

// this type is used by @ledgerhq/react-native-hid and it's not exposed
// so we redefine it here
export type DeviceObj = {
  vendorId: number
  productId: number
}

// for bluetooth, we just save a string id
export type DeviceId = string

// Hardware wallet device Features object
// borrowed from HWConnectStoreTypes.js in yoroi-frontend
type HWFeatures = {
  vendor: string
  model: string
  deviceId: DeviceId | null | undefined
  // for establishing a connection through BLE
  deviceObj: DeviceObj | null | undefined
  // for establishing a connection through USB
  serialHex?: string
}

export type HWDeviceInfo = {
  bip44AccountPublic: string
  hwFeatures: HWFeatures
}

export const requestLedgerPermissions = async () => {
  if (Platform.OS !== 'android') return Promise.resolve()

  const permissions = getLedgerPermissions()
  const statuses = await PermissionsAndroid.requestMultiple(permissions)
  const denied = Object.values(statuses).some((value) => value === 'denied')

  return denied ? Promise.reject() : Promise.resolve()
}

export const useLedgerPermissions = (options?: UseMutationOptions<void, Error>) => {
  const mutation = useMutation({
    ...options,
    mutationFn: requestLedgerPermissions,
  })

  return {
    request: mutation.mutate,
    ...mutation,
  }
}

// not bumping react-native right now (couple to ledger)
const BLUETOOTH_SCAN = 'android.permission.BLUETOOTH_SCAN'
const BLUETOOTH_CONNECT = 'android.permission.BLUETOOTH_CONNECT'
export const getLedgerPermissions = () => {
  const permissions: Array<Permission> = [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]
  if (Number(Platform.Version) >= 31) {
    permissions.push(BLUETOOTH_CONNECT as Permission)
    permissions.push(BLUETOOTH_SCAN as Permission)
  }

  return permissions
}

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

export class AdaAppClosedError extends LocalizableError {
  constructor() {
    super({
      id: ledgerMessages.appOpened.id,
      defaultMessage: ledgerMessages.appOpened.defaultMessage,
    })
  }
}

export const HARDWARE_WALLETS = {
  LEDGER_NANO: {
    ENABLED: true,
    VENDOR: 'ledger.com',
    MODEL: 'Nano',
    ENABLE_USB_TRANSPORT: true,
    USB_MIN_SDK: 24, // USB transport officially supported for Android SDK >= 24
  },
}
