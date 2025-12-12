import {UseMutationOptions, useMutation} from '@tanstack/react-query'
import * as React from 'react'
import {Permission, PermissionsAndroid, Platform} from 'react-native'

// @ts-expect-error - App-specific import, not available in package context
import {useBackgroundTimerControl} from '~/common/providers/BackgroundTimerContext'

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
  const {disable, enable} = useBackgroundTimerControl()

  const mutationFn = React.useCallback(async () => {
    // Disable background timer before requesting permissions (Android-specific)
    // On Android, permission dialogs send the app to background, which could trigger auto-logout
    disable()
    try {
      await requestLedgerPermissions()
    } finally {
      // Re-enable background timer after permission dialog is dismissed
      enable()
    }
  }, [disable, enable])

  const mutation = useMutation({
    ...options,
    mutationFn,
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

// Re-export from centralized error location
export {
  BaseLedgerError,
  BluetoothDisabledError,
  GeneralConnectionError,
  LedgerUserError,
  RejectedByUserError,
  AdaAppClosedError,
  DeprecatedAdaAppError,
} from '@yoroi/types'

export const HARDWARE_WALLETS = {
  LEDGER_NANO: {
    ENABLED: true,
    VENDOR: 'ledger.com',
    MODEL: 'Ledger',
    ENABLE_USB_TRANSPORT: true,
    USB_MIN_SDK: 24, // USB transport officially supported for Android SDK >= 24
  },
}
