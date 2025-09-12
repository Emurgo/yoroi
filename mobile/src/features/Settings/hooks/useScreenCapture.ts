import {useSyncStorageToState} from '@yoroi/common'

import * as ScreenCapture from 'expo-screen-capture'
import * as React from 'react'

import {isAndroid, isDev} from '~/kernel/constants'
import {screenShareStorageKeyManager} from '~/kernel/storage/storages'

export const useScreenCapture = () => {
  const [
    isScreenSharingEnabled,
    setIsScreenSharingEnabled,
    resetIsScreenSharingEnabled,
  ] = useSyncStorageToState(screenShareStorageKeyManager)

  return React.useMemo(() => {
    const canSwitchScreenSharing = isAndroid && isDev

    return {
      canSwitchScreenSharing,
      isScreenSharingEnabled,
      setIsScreenSharingEnabled: (value: boolean) => {
        if (!canSwitchScreenSharing) return false

        if (value) {
          ScreenCapture.allowScreenCaptureAsync()
        } else {
          ScreenCapture.preventScreenCaptureAsync()
        }

        setIsScreenSharingEnabled(value)
      },
      resetIsScreenSharingEnabled,
      init: () => {
        // shouldn't happen
        if (isScreenSharingEnabled && canSwitchScreenSharing) {
          ScreenCapture.allowScreenCaptureAsync()
        } else {
          ScreenCapture.preventScreenCaptureAsync()
        }
      },
      toggleIsScreenSharingEnabled: () =>
        setIsScreenSharingEnabled(!isScreenSharingEnabled),
    }
  }, [
    isScreenSharingEnabled,
    setIsScreenSharingEnabled,
    resetIsScreenSharingEnabled,
  ])
}
