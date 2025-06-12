import {invalid, time, useSyncStorageToState} from '@yoroi/common'
import {App} from '@yoroi/types'

import {freeze} from 'immer'
import * as React from 'react'

import {useBackgroundTimer} from '../../../hooks/useBackgroundTimer'
import {logger} from '../../../kernel/logger/logger'
import {useAuthWithHost} from '../hooks/useAuthWithHost'
import {AuthSetting, AuthWithHostConfig} from './types'

export const AuthProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  authStorageKeyManager,
  pinHashStorageKeyManager,
}) => {
  const [loggedState, setLoggedState] = React.useState(initialState)
  const [authSetting, changeAuthSetting] = useSyncStorageToState(
    authStorageKeyManager,
  )
  const [pinHash, changePinHash, removePinHash] = useSyncStorageToState(
    pinHashStorageKeyManager,
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

  const value = React.useMemo(
    () => ({
      ...loggedState,
      authWithHostConfig,
      authWithHost,
      login: () => {
        logger.debug('login', {
          origin: 'AuthProvider',
          type: 'user',
        })
        setLoggedState(loggedInState)
      },
      logout: () => {
        logger.debug('logout', {origin: 'AuthProvider', type: 'user'})
        setLoggedState(loggedOutState)
      },
      changeAuthSetting,
      changePinHash,
      removePinHash,
      authSetting,
      pinHash,
      hasPin: !!pinHash,
    }),
    [
      authWithHostConfig,
      authWithHost,
      loggedState,
      authSetting,
      pinHash,
      changeAuthSetting,
      changePinHash,
      removePinHash,
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
  pinHashStorageKeyManager: Readonly<App.StorageKeyManager<string | undefined>>
}>

type AuthLoggedState = {
  status: 'logged-in' | 'logged-out'
  isLoggedIn: boolean
  isLoggedOut: boolean
}

type AuthSettingsState = {
  authSetting: AuthSetting | undefined | null
  pinHash: string | undefined
  hasPin: boolean
}

type AuthContextActions = {
  login(): void
  logout(): void
  changeAuthSetting(authSetting: AuthSetting): void
  changePinHash(pinHash: string): void
  removePinHash(): void
}

type AuthContext = AuthLoggedState &
  AuthSettingsState &
  AuthContextActions & {
    authWithHostConfig: AuthWithHostConfig
    authWithHost(): Promise<boolean>
  }
