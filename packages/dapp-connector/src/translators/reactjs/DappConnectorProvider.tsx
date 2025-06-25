import {invalid} from '@yoroi/common'

import * as React from 'react'
import {DappConnectorManager} from '../../dapp-connector'

const Context = React.createContext<{
  manager: DappConnectorManager
  sessionId: string
} | null>(null)

type Props = {
  manager: DappConnectorManager
}

export const DappConnectorProvider = ({
  children,
  manager,
}: React.PropsWithChildren<Props>) => {
  const [sessionId] = React.useState(() => generateSessionId())
  const value = React.useMemo(
    () => ({manager, sessionId}),
    [manager, sessionId],
  )
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useDappConnector = () =>
  React.useContext(Context) ||
  invalid('useDappConnector must be used within a DappConnectorProvider')

const generateSessionId = () => Math.random().toString(36).substring(7)
