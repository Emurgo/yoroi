import {invalid} from '@yoroi/common'

import {freeze} from 'immer'
import * as React from 'react'

// Types
type AuthContextState = {
  status: 'logged-in' | 'logged-out'
  isLoggedIn: boolean
  isLoggedOut: boolean
}

type AuthContextActions = {
  login: () => void
  logout: () => void
}

type AuthContextType = AuthContextState & AuthContextActions

// Constants
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

const initialState: AuthContextState = loggedOutState

// Context
const AuthContext = React.createContext<AuthContextType>({
  ...loggedOutState,
  login: () => {},
  logout: () => {},
})

// Provider Component
export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [state, setState] = React.useState(initialState)

  const value = React.useMemo(
    () => ({
      ...state,
      login: () => setState(loggedInState),
      logout: () => setState(loggedOutState),
    }),
    [state],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook
export const useAuth = () =>
  React.useContext(AuthContext) ||
  invalid('useAuth must be used within an AuthProvider')
