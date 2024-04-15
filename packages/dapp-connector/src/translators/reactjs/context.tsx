import * as React from 'react'
import {DappConnector} from '../../dapp-connector'

const Context = React.createContext<{manager: DappConnector}>(null)

type Props = {
  children: React.ReactNode
  manager: DappConnector
}

export const DappConnectorProvider = ({children, manager}: Props) => {
  return <Context.Provider value={manager}>{children}</Context.Provider>
}
