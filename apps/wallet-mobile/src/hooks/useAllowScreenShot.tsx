import {useFocusEffect} from '@react-navigation/native'
import {isBoolean} from '@yoroi/common'
import * as React from 'react'
import {Platform} from 'react-native'

import {
  changeScreenShareNativeSettingOnAndroid,
  useScreenShareSettingEnabled,
} from '../features/Settings/ScreenShare/ScreenShare'

export const useAllowScreenshot = () => {
  const {data: screenShareSettingEnabled} = useScreenShareSettingEnabled()
  const callback = React.useCallback(() => {
    if (Platform.OS !== 'android') return
    if (!isBoolean(screenShareSettingEnabled) || screenShareSettingEnabled) return

    changeScreenShareNativeSettingOnAndroid(true)
    return () => {
      changeScreenShareNativeSettingOnAndroid(false)
    }
  }, [screenShareSettingEnabled])
  useFocusEffect(callback)
}
