import * as React from 'react'
import {DappConnectorManager} from '../../dapp-connector'

const Context = React.createContext<{manager: DappConnectorManager} | null>(null)

type Props = {
  children: React.ReactNode
  manager: DappConnectorManager
}

export const DappConnectorProvider = ({children, manager}: Props) => {
  const value = React.useMemo(() => ({manager}), [manager])
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useDappConnector = () => {
  const context = React.useContext(Context)
  if (!context) {
    throw new Error('useDappConnector must be used within a DappConnectorProvider')
  }
  return context
}
