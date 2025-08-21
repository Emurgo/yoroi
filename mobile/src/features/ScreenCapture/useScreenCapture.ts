import {useSyncStorageToState} from '@yoroi/common'

import * as ScreenCapture from 'expo-screen-capture'
import * as React from 'react'

import {screenShareStorageKeyManager} from '~/kernel/storage/storages'

export const useScreenCapture = () => {
  const [isActive] = useSyncStorageToState(screenShareStorageKeyManager)

  React.useEffect(() => {
    if (isActive) {
      ScreenCapture.allowScreenCaptureAsync()
    } else {
      ScreenCapture.preventScreenCaptureAsync()
    }
  }, [isActive])
}
