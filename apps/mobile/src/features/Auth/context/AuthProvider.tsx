import {Hex, hex, invalid, time, useSyncStorageToState} from '@yoroi/common'
import {App} from '@yoroi/types'

import {freeze} from 'immer'
import * as React from 'react'

import {useBackgroundTimer} from '~/hooks/useBackgroundTimer'
import {decryptData} from '~/kernel/crypto/decrypt-data'
import {encryptData} from '~/kernel/crypto/encrypt-data'
import {logger} from '~/kernel/logger/logger'
import {AuthSetting, AuthWithHostConfig} from '../common/types'
import {useAuthWithHost} from '../hooks/useAuthWithHost'

export const AuthProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  authStorageKeyManager,
  pinStorageKeyManager,
  installationIdKeyManager,
}) => {
  const [loggedState, setLoggedState] = React.useState(initialState)
  const [authSetting, changeAuthSetting] = useSyncStorageToState(
    authStorageKeyManager,
  )
  const {authWithHostConfig, authWithHost} = useAuthWithHost()

  // NOTE: This should be configurable
  useBackgroundTimer({
    after: time.seconds(1),
    execute: () => {
      if (loggedState.status === 'logged-in') {
        logger.debug('logout (auto)', {origin: 'AuthProvider', type: 'user'})
        setLoggedState(loggedOutState)
      }
    },
  })

  const checkPin = React.useCallback(
    (pin: string) => {
      const storedPin = pinStorageKeyManager.read()
      if (!storedPin) {
        logger.info('no PIN stored', {origin: 'AuthProvider', type: 'user'})
        return false
      }
      try {
        decryptData({
          encryptedData: storedPin,
          secretKey: hex.fromUtf8(pin),
        })
        return true
      } catch (error) {
        logger.error('error checking PIN', {
          origin: 'AuthProvider',
          type: 'user',
          error,
        })
        return false
      }
    },
    [pinStorageKeyManager],
  )

  const createPin = React.useCallback(
    (pin: string) => {
      const encryptedPin = encryptData({
        plainData: hex.fromUtf8(installationIdKeyManager.read() ?? ''),
        secretKey: hex.fromUtf8(pin),
      })
      pinStorageKeyManager.save(encryptedPin.value)
    },
    [installationIdKeyManager, pinStorageKeyManager],
  )

  const loginWithPin = React.useCallback(
    (pin: string) => {
      checkPin(pin)
      setLoggedState(loggedInState)
    },
    [checkPin],
  )

  const loginWithHost = React.useCallback(async () => {
    const ok = await authWithHost()
    if (ok) {
      setLoggedState(loggedInState)
    }
  }, [authWithHost])

  const value = React.useMemo(
    () => ({
      ...loggedState,
      authWithHostConfig,
      authWithHost,
      checkPin,
      createPin,
      loginWithPin,
      loginWithHost,
      loggedIn: () => {
        logger.debug('login', {
          origin: 'AuthProvider',
          type: 'user',
        })
        setLoggedState(loggedInState)
      },
      loggedOut: () => {
        logger.debug('logout', {origin: 'AuthProvider', type: 'user'})
        setLoggedState(loggedOutState)
      },
      changeAuthSetting,
      authSetting,
    }),
    [
      authWithHostConfig,
      authWithHost,
      checkPin,
      createPin,
      loginWithPin,
      loginWithHost,
      loggedState,
      authSetting,
      changeAuthSetting,
    ],
  )
  return <Context.Provider value={value}>{children}</Context.Provider>
}

const loggedInState = freeze({
  status: 'logged-in',
  isLoggedIn: true,
  isLoggedOut: false,
} as const)

const loggedOutState = freeze({
  status: 'logged-out',
  isLoggedIn: false,
  isLoggedOut: true,
} as const)

const initialState: AuthLoggedState = loggedOutState

const Context = React.createContext<AuthContext | undefined>(undefined)

export const useAuth = () =>
  React.useContext(Context) ||
  invalid('useAuth must be used within an AuthProvider')

type Props = React.PropsWithChildren<{
  authStorageKeyManager: Readonly<
    App.StorageKeyManager<AuthSetting | undefined | null>
  >
  pinStorageKeyManager: Readonly<App.StorageKeyManager<Hex | undefined, string>>
  installationIdKeyManager: Readonly<App.StorageKeyManager<string | undefined>>
}>

type AuthLoggedState = {
  status: 'logged-in' | 'logged-out'
  isLoggedIn: boolean
  isLoggedOut: boolean
}

type AuthSettingsState = {
  authSetting: AuthSetting | undefined | null
}

type AuthContextActions = {
  loggedIn(): void
  loggedOut(): void
  changeAuthSetting(authSetting: AuthSetting): void
  authWithHost(): Promise<boolean>
  loginWithPin(pin: string): void
  loginWithHost(): Promise<void>
  checkPin(pin: string): boolean
  createPin(pin: string): void
}

type AuthContext = AuthLoggedState &
  AuthSettingsState &
  AuthContextActions & {
    authWithHostConfig: AuthWithHostConfig
  }
