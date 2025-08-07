import {
  isBoolean,
  useAsyncStorage,
} from '@yoroi/common'
import {useEffect, useState} from 'react'
import {NativeModules, Platform} from 'react-native'

const {FlagSecure} = NativeModules

export const useChangeScreenShareSetting = () => {
  const storage = useAsyncStorage()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const changeScreenShareSettings = async (screenShareEnabled: boolean) => {
    try {
      setIsLoading(true)
      setError(null)
      
      await storage
        .join('appSettings/')
        .setItem('screenShareEnabled', screenShareEnabled)
      
      if (Platform.OS === 'android') {
        changeScreenShareNativeSettingOnAndroid(screenShareEnabled)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to change screen share settings')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    isError: error !== null,
    changeScreenShareSettings,
  }
}

export const useScreenShareSettingEnabled = () => {
  const storage = useAsyncStorage()
  const [data, setData] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchScreenShareSetting = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      if (Platform.OS === 'android') {
        const result = await storage
          .join('appSettings/')
          .getItem<boolean>('screenShareEnabled')
        setData(result ?? false)
      } else {
        setData(true)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch screen share setting')
      setError(error)
      setData(false) // fallback to false on error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchScreenShareSetting()
  }, [])

  return {
    data,
    error,
    isLoading,
    isError: error !== null,
    refetch: fetchScreenShareSetting,
  }
}

export const useInitScreenShare = () => {
  const {data: screenShareEnabled, isLoading} = useScreenShareSettingEnabled()
  const [initialised, setInitialised] = useState(false)

  useEffect(() => {
    if (isLoading || !isBoolean(screenShareEnabled) || initialised) return

    if (Platform.OS === 'android') {
      changeScreenShareNativeSettingOnAndroid(screenShareEnabled)
    }

    setInitialised(true)
  }, [screenShareEnabled, initialised, isLoading])

  return {initialised}
}

export const changeScreenShareNativeSettingOnAndroid = (
  screenShareEnabled: boolean,
) => {
  if (screenShareEnabled) {
    FlagSecure.deactivate()
  } else {
    FlagSecure.activate()
  }
}
