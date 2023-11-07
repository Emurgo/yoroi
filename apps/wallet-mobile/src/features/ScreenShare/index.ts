import {isBoolean, useStorage} from '@yoroi/common'
import {useMutationWithInvalidations} from '../../yoroi-wallets/hooks'
import {NativeModules, Platform} from 'react-native'
import {useQuery} from 'react-query'
import {useEffect, useState} from 'react'

const {FlagSecure} = NativeModules

export const useChangeScreenShareSettings = () => {
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

export const useScreenShareEnabled = () => {
  const storage = useStorage()

  return useQuery('screenShareEnabled', async () => {
    if (Platform.OS === 'android') {
      return (await storage.join('appSettings/').getItem<boolean>('screenShareEnabled')) ?? false
    }
    return true
  })
}

export const useInitScreenShare = () => {
  const {data: screenShareEnabled} = useScreenShareEnabled()
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

const changeScreenShareNativeSettingOnAndroid = (enabled: boolean) => {
  if (enabled) {
    FlagSecure.activate()
  } else {
    FlagSecure.deactivate()
  }
}
