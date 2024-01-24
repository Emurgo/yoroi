import React, {createContext, ReactNode, useCallback, useContext, useState} from 'react'

const AuthContext = createContext<undefined | (AuthContextState & AuthContextActions)>(undefined)
export const AuthProvider = ({children}: {children: ReactNode}) => {
  const [state, setState] = useState<AuthContextState>(initialState)

  const actions = {
    login: useCallback(() => setState(loggedInState), []),
    logout: useCallback(() => setState(loggedOutState), []),
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        ...actions,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) || missingProvider()

const missingProvider = () => {
  throw new Error('AuthProvider is missing')
}

const loggedInState = {
  status: 'logged-in',
  isLoggedIn: true,
  isLoggedOut: false,
} as const

const loggedOutState = {
  status: 'logged-out',
  isLoggedIn: false,
  isLoggedOut: true,
} as const

const initialState: AuthContextState = loggedOutState

type AuthContextState = typeof loggedInState | typeof loggedOutState

type AuthContextActions = {
  login: () => void
  logout: () => void
}
