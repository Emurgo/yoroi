import {useSyncStorageToState} from '@yoroi/common'

import * as ScreenCapture from 'expo-screen-capture'
import * as React from 'react'

import {isAndroid, isDev} from '~/kernel/constants'
import {screenCaptureStorageKeyManager} from '~/kernel/storage/storages'

export const useScreenCapture = () => {
  const [
    isScreenCaptureEnabled,
    setIsScreenCaptureEnabled,
    resetIsScreenCaptureEnabled,
  ] = useSyncStorageToState(screenCaptureStorageKeyManager)

  return React.useMemo(() => {
    const canSwitchScreenCapture = isAndroid && isDev

    return {
      canSwitchScreenCapture,
      isScreenCaptureEnabled,
      setIsScreenCaptureEnabled: (value: boolean) => {
        if (!canSwitchScreenCapture) return false

        if (value) {
          ScreenCapture.allowScreenCaptureAsync()
        } else {
          ScreenCapture.preventScreenCaptureAsync()
        }

        setIsScreenCaptureEnabled(value)
      },
      resetIsScreenCaptureEnabled,
      init: () => {
        // shouldn't happen
        if (isScreenCaptureEnabled && canSwitchScreenCapture) {
          ScreenCapture.allowScreenCaptureAsync()
        } else {
          ScreenCapture.preventScreenCaptureAsync()
        }
      },
      toggleIsScreenCaptureEnabled: () =>
        setIsScreenCaptureEnabled(!isScreenCaptureEnabled),
    }
  }, [
    isScreenCaptureEnabled,
    setIsScreenCaptureEnabled,
    resetIsScreenCaptureEnabled,
  ])
}
