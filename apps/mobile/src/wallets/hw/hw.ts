import {useMutation, UseMutationOptions} from '@tanstack/react-query'
import {Permission, PermissionsAndroid, Platform} from 'react-native'


import {LocalizableError} from '~/kernel/i18n/LocalizableError'

const requestLedgerPermissions = async () => {
  if (Platform.OS !== 'android') return Promise.resolve()

  const permissions = getLedgerPermissions()
  const statuses = await PermissionsAndroid.requestMultiple(permissions)
  const denied = Object.values(statuses).some((value) => value === 'denied')

  return denied ? Promise.reject() : Promise.resolve()
}

export const useLedgerPermissions = (
  options?: UseMutationOptions<void, Error>,
) => {
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
const getLedgerPermissions = () => {
  const permissions: Array<Permission> = [
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  ]
  if (Number(Platform.Version) >= 31) {
    permissions.push(BLUETOOTH_CONNECT as Permission)
    permissions.push(BLUETOOTH_SCAN as Permission)
  }

  return permissions
}

export class BaseLedgerError extends LocalizableError {}

export class BluetoothDisabledError extends BaseLedgerError {
  constructor() {
    super({
      id: 'ledger.bluetoothDisabledError',
      defaultMessage: 'Bluetooth is disabled. Please enable Bluetooth to connect to your Ledger device.',
    })
  }
}
export class GeneralConnectionError extends BaseLedgerError {
  constructor() {
    super({
      id: 'ledger.connectionError',
      defaultMessage: 'Failed to connect to Ledger device. Please check your connection and try again.',
    })
  }
}
// note: uses same message as above.
export class LedgerUserError extends BaseLedgerError {
  constructor() {
    super({
      id: 'ledger.connectionError',
      defaultMessage: 'Failed to connect to Ledger device. Please check your connection and try again.',
    })
  }
}
export class RejectedByUserError extends BaseLedgerError {
  constructor() {
    super({
      id: 'ledger.rejectedByUserError',
      defaultMessage: 'Operation was rejected by the user on the Ledger device.',
    })
  }
}

export class AdaAppClosedError extends BaseLedgerError {
  constructor() {
    super({
      id: 'ledger.appOpened',
      defaultMessage: 'Please open the Cardano app on your Ledger device.',
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
