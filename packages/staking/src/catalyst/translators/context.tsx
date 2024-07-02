import * as React from 'react'

import {Catalyst} from '../../types'
import {catalystConfig} from '../config'
import {invalid} from '@yoroi/common'

const uninitializedMessage = 'Catalyst manager not yet initialized'
const initialCatalystManager: Catalyst.Manager = {
  config: catalystConfig,
  getFundInfo: () => Promise.reject(new Error(uninitializedMessage)),
  fundStatus: () => invalid(uninitializedMessage),
}

const CatalystContext = React.createContext<ContextValue>({
  ...initialCatalystManager,
})

export function useCatalyst() {
  const context = React.useContext(CatalystContext)

  if (!context)
    throw new Error('useCatalyst must be used within a CatalystProvider')

  return context
}

export function CatalystProvider({manager, children}: CatalystProviderProps) {
  return (
    <CatalystContext.Provider value={{...manager}}>
      {children}
    </CatalystContext.Provider>
  )
}

type ContextValue = Catalyst.Manager

type CatalystProviderProps = React.PropsWithChildren<{
  manager: Catalyst.Manager
}>
