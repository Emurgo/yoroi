import * as React from 'react'

import {GovernanceManager} from '../../manager'

type ContextType = {
  manager: GovernanceManager
}

const Context = React.createContext<ContextType | null>(null)

export const useGovernance = () => {
  const context = React.useContext(Context)
  if (!context) {
    throw new Error('useGovernance must be used within a GovernanceProvider')
  }
  return context
}

type ProviderProps = React.PropsWithChildren<{
  manager: GovernanceManager
}>

export const GovernanceProvider = ({manager, children}: ProviderProps) => {
  return <Context.Provider value={{manager}}>{children}</Context.Provider>
}
