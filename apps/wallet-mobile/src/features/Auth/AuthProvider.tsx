import * as React from 'react'

const AuthContext = React.createContext<undefined | (AuthContextState & AuthContextActions)>(undefined)
export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [state, setState] = React.useState<AuthContextState>(initialState)

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

export const useAuth = () => React.useContext(AuthContext) || missingProvider()

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
