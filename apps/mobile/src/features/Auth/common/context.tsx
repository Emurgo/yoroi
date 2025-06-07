import {invalid, time, useSyncStorageToState} from '@yoroi/common'
import {App} from '@yoroi/types'

import {freeze} from 'immer'
import * as React from 'react'

import {useBackgroundTimer} from '../../../hooks/useBackgroundTimer'
import {logger} from '../../../kernel/logger/logger'
import {AuthSetting} from './types'

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

const AuthContext = React.createContext<AuthContextType>({
  ...loggedOutState,
  authSetting: undefined,
  pinHash: undefined,
  login: () => invalid('login'),
  logout: () => invalid('logout'),
  changeAuthSetting: () => invalid('changeAuthSetting'),
  changePinHash: () => invalid('changePinHash'),
  removePinHash: () => invalid('removePinHash'),
})

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

  useBackgroundTimer({
    execute: () => {
      if (loggedState.status === 'logged-in') {
        logger.debug(`Auto Logged out`, {origin: 'AuthProvider', type: 'user'})
        setLoggedState(loggedOutState)
      }
    },
    after: time.seconds(30),
  })

  const value = React.useMemo(
    () => ({
      ...loggedState,
      login: () => {
        logger.debug(`Logged in with OS`, {
          origin: 'AuthProvider',
          type: 'user',
        })
        setLoggedState(loggedInState)
      },
      logout: () => {
        logger.debug(`Logged out`, {origin: 'AuthProvider', type: 'user'})
        setLoggedState(loggedOutState)
      },
      changeAuthSetting,
      changePinHash,
      removePinHash,
      authSetting,
      pinHash,
    }),
    [
      loggedState,
      authSetting,
      pinHash,
      changeAuthSetting,
      changePinHash,
      removePinHash,
    ],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () =>
  React.useContext(AuthContext) ||
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
}

type AuthContextActions = {
  login(): void
  logout(): void
  changeAuthSetting(authSetting: AuthSetting): void
  changePinHash(pinHash: string): void
  removePinHash(): void
}

type AuthContextType = AuthLoggedState & AuthSettingsState & AuthContextActions
