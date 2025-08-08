import * as AuthHost from 'expo-local-authentication'
import {freeze} from 'immer'
import * as React from 'react'

import {useAppState} from '~/hooks/useAppState'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'

import {AuthWithHostConfig} from '../common/types'

export const useAuthWithHost = () => {
  const [authWithHostConfig, setAuthWithHostConfig] =
    React.useState<AuthWithHostConfig>(initial)
  const strings = useStrings()

  React.useEffect(() => {
    getAuthHostConfig().then(setAuthWithHostConfig)
  }, [])

  // TODO: REVISIT needs to happen after the navigation is ready
  // useFocusEffect(
  //   React.useCallback(() => {
  //     logger.debug('focus - update auth with host config', {
  //       origin: 'useAuthWithHost',
  //       type: 'ui',
  //     })
  //     getAuthHostConfig().then(setAuthWithHostConfig)
  //   }, []),
  // )

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
          promptMessage: strings.auth.authorize,
          cancelLabel: strings.global.cancel,
          fallbackLabel: noFallback ? undefined : strings.auth.usePasscode,
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
    [strings.auth.authorize, strings.global.cancel, strings.auth.usePasscode],
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
