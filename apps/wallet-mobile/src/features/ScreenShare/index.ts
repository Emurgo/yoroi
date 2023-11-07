import {useFocusEffect} from '@react-navigation/native'
import {isBoolean, useStorage} from '@yoroi/common'
import React, {useEffect, useState} from 'react'
import {NativeModules, Platform} from 'react-native'
import {useQuery} from 'react-query'

import {useMutationWithInvalidations} from '../../yoroi-wallets/hooks'

const {FlagSecure} = NativeModules

export const useChangeScreenShareSetting = () => {
  const storage = useStorage()

  const mutation = useMutationWithInvalidations({
    mutationFn: async (screenShareEnabled: boolean) => {
      await storage.join('appSettings/').setItem('screenShareEnabled', screenShareEnabled)
      if (Platform.OS === 'android') {
        changeScreenShareNativeSettingOnAndroid(screenShareEnabled)
      }
    },
    invalidateQueries: [['screenShareEnabled']],
  })

  return {
    ...mutation,
    changeScreenShareSettings: mutation.mutate,
  }
}

export const useScreenShareSettingEnabled = () => {
  const storage = useStorage()

  return useQuery('screenShareEnabled', async () => {
    if (Platform.OS === 'android') {
      return (await storage.join('appSettings/').getItem<boolean>('screenShareEnabled')) ?? false
    }
    return true
  })
}

export const useAllowScreenshots = () => {
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

export const useInitScreenShare = () => {
  const {data: screenShareEnabled} = useScreenShareSettingEnabled()
  const [initialised, setInitialised] = useState(false)

  useEffect(() => {
    if (!isBoolean(screenShareEnabled)) return

    if (Platform.OS === 'android') {
      changeScreenShareNativeSettingOnAndroid(screenShareEnabled)
    }

    setInitialised(true)
  }, [screenShareEnabled])

  return {initialised}
}

const changeScreenShareNativeSettingOnAndroid = (screenShareEnabled: boolean) => {
  if (screenShareEnabled) {
    FlagSecure.deactivate()
  } else {
    FlagSecure.activate()
  }
}
