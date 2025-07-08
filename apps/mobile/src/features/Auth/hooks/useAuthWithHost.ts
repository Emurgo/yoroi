import {useFocusEffect} from '@react-navigation/native'
import * as AuthHost from 'expo-local-authentication'
import {freeze} from 'immer'
import * as React from 'react'

import {useAppState} from '../../../hooks/useAppState'
import {logger} from '../../../kernel/logger/logger'
import {AuthWithHostConfig} from '../common/types'
import {useStrings} from './useStrings'

export const useAuthWithHost = () => {
  const [authWithHostConfig, setAuthWithHostConfig] =
    React.useState<AuthWithHostConfig>(initial)
  const strings = useStrings()

  React.useEffect(() => {
    getAuthHostConfig().then(setAuthWithHostConfig)
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      logger.debug('focus - update auth with host config', {
        origin: 'useAuthWithHost',
        type: 'ui',
      })
      getAuthHostConfig().then(setAuthWithHostConfig)
    }, []),
  )

  useAppState({
    on: 'active',
    execute: () => {
      logger.debug('AppState resumed, active, getting auth with host config', {
        origin: 'useAuthWithHost',
        type: 'ui',
      })
      getAuthHostConfig().then(setAuthWithHostConfig)
    },
  })

  const authWithHost = React.useCallback(
    async ({noFallback = false}: {noFallback?: boolean} = {}) => {
      try {
        const result = await AuthHost.authenticateAsync({
          promptMessage: strings.authorize,
          cancelLabel: strings.cancel,
          fallbackLabel: noFallback ? undefined : strings.usePasscode,
          disableDeviceFallback: noFallback,
        })

        return result.success
      } catch (error) {
        logger.error(error as Error, {
          origin: 'authWithHost',
          type: 'user',
          noFallback,
        })
        return false
      }
    },
    [strings.authorize, strings.cancel, strings.usePasscode],
  )

  return React.useMemo(
    () =>
      freeze(
        {
          authWithHostConfig,
          authWithHost,
        },
        true,
      ),
    [authWithHostConfig, authWithHost],
  )
}

const initial: AuthWithHostConfig = {
  isReady: false,
  isSupported: false,
  isEnrolled: false,
  canAuthWithHost: false,
  methods: [],
}

export const getAuthHostConfig = async (): Promise<
  Readonly<AuthWithHostConfig>
> => {
  const [hasHardware, isEnrolled, methods] = await Promise.all([
    AuthHost.hasHardwareAsync(),
    AuthHost.isEnrolledAsync(),
    AuthHost.supportedAuthenticationTypesAsync(),
  ])

  return freeze(
    {
      isReady: true,
      isSupported: hasHardware,
      isEnrolled,
      canAuthWithHost: hasHardware && isEnrolled,
      methods,
    },
    true,
  )
}
