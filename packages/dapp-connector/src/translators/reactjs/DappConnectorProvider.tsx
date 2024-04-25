import * as React from 'react'
import {DappConnectorManager} from '../../dapp-connector'

const Context = React.createContext<{manager: DappConnectorManager; sessionId: string} | null>(null)

type Props = {
  children: React.ReactNode
  manager: DappConnectorManager
}

export const DappConnectorProvider = ({children, manager}: Props) => {
  const [sessionId] = React.useState(() => generateSessionId())
  const value = React.useMemo(() => ({manager, sessionId}), [manager, sessionId])
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useDappConnector = () => {
  const context = React.useContext(Context)
  if (!context) {
    throw new Error('useDappConnector must be used within a DappConnectorProvider')
  }
  return context
}

const generateSessionId = () => Math.random().toString(36).substring(7)
