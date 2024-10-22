import * as React from 'react'

import {Catalyst} from '../../types'
import {catalystConfig} from '../config'
import {invalid} from '@yoroi/common'
import {
  catalystReducer,
  catalystDefaultState,
  CatalystState,
  CatalystActions,
  CatalystActionType,
  initialCatalystContext,
} from './state'

const uninitializedMessage = 'Catalyst manager not yet initialized'
const initialCatalystManager: Catalyst.Manager = {
  config: catalystConfig,
  getFundInfo: () => Promise.reject(new Error(uninitializedMessage)),
  fundStatus: () => invalid(uninitializedMessage),
}

const CatalystContext = React.createContext<ContextValue>({
  ...initialCatalystManager,
  ...initialCatalystContext,
})

export function useCatalyst() {
  const context = React.useContext(CatalystContext)

  if (!context)
    throw new Error('useCatalyst must be used within a CatalystProvider')

  return context
}

export function CatalystProvider({
  manager,
  initialState,
  children,
}: CatalystProviderProps) {
  const [state, dispatch] = React.useReducer(catalystReducer, {
    ...catalystDefaultState,
    ...initialState,
  })

  const actions = React.useRef<CatalystActions>({
    pinChanged: (pin: CatalystState['pin']) =>
      dispatch({type: CatalystActionType.PinChanged, pin}),
    votingKeyEncryptedChanged: (
      votingKeyEncrypted: CatalystState['votingKeyEncrypted'],
    ) =>
      dispatch({
        type: CatalystActionType.VotingKeyEncryptedChanged,
        votingKeyEncrypted,
      }),
    reset: () =>
      dispatch({
        type: CatalystActionType.Reset,
      }),
  }).current
  return (
    <CatalystContext.Provider value={{...state, ...actions, ...manager}}>
      {children}
    </CatalystContext.Provider>
  )
}

type ContextValue = Catalyst.Manager & CatalystState & CatalystActions

type CatalystProviderProps = React.PropsWithChildren<{
  manager: Catalyst.Manager
  initialState?: Partial<CatalystState>
}>
