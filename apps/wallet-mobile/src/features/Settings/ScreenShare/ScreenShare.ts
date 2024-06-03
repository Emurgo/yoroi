import {useQuery} from '@tanstack/react-query'
import {isBoolean, useAsyncStorage, useMutationWithInvalidations} from '@yoroi/common'
import {useEffect, useState} from 'react'
import {NativeModules, Platform} from 'react-native'

const {FlagSecure} = NativeModules

export const useChangeScreenShareSetting = () => {
  const storage = useAsyncStorage()

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
  const storage = useAsyncStorage()

  return useQuery('screenShareEnabled', async () => {
    if (Platform.OS === 'android') {
      return (await storage.join('appSettings/').getItem<boolean>('screenShareEnabled')) ?? false
    }
    return true
  })
}

export const useInitScreenShare = () => {
  const {data: screenShareEnabled} = useScreenShareSettingEnabled()
  const [initialised, setInitialised] = useState(false)

  useEffect(() => {
    if (!isBoolean(screenShareEnabled) || initialised) return

    if (Platform.OS === 'android') {
      changeScreenShareNativeSettingOnAndroid(screenShareEnabled)
    }

    setInitialised(true)
  }, [screenShareEnabled, initialised])

  return {initialised}
}

export const changeScreenShareNativeSettingOnAndroid = (screenShareEnabled: boolean) => {
  if (screenShareEnabled) {
    FlagSecure.deactivate()
  } else {
    FlagSecure.activate()
  }
}
