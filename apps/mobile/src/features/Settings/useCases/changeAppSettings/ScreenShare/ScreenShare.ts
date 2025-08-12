import {useSyncStorageToState} from '@yoroi/common'
import * as React from 'react'
import {NativeModules} from 'react-native'
import {isAndroid} from '~/kernel/constants'
import {screenShareStorageKeyManager} from '~/kernel/storage/storages'

const {FlagSecure} = NativeModules

export const useChangeScreenShareSetting = () => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  const changeScreenShareSettings = async (screenShareEnabled: boolean) => {
    try {
      setIsLoading(true)
      setError(null)

      screenShareStorageKeyManager.save(screenShareEnabled)

      if (isAndroid) {
        changeScreenShareNativeSettingOnAndroid(screenShareEnabled)
      }
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error('Failed to change screen share settings')
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
  const [screenShareEnabled] = useSyncStorageToState(
    screenShareStorageKeyManager,
  )

  const data = isAndroid ? screenShareEnabled : true

  return {
    data,
    error: null,
    isLoading: false,
    isError: false,
  }
}

export const useInitScreenShare = () => {
  const [screenShareEnabled] = useSyncStorageToState(
    screenShareStorageKeyManager,
  )
  const [initialised, setInitialised] = React.useState(false)

  React.useEffect(() => {
    if (!isAndroid || initialised) return

    changeScreenShareNativeSettingOnAndroid(screenShareEnabled)
    setInitialised(true)
  }, [screenShareEnabled, initialised])

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
