import {invalid} from '@yoroi/common'
import * as React from 'react'

import {ScanActionClaim} from '../../Scan/common/types'
import {claimApiMockInstances} from './api.mocks'
import {ClaimActions, ClaimActionType, claimReducer, defaultClaimActions, defaultClaimState} from './state'
import {ClaimApi, ClaimInfo, ClaimState} from './types'

export type ClaimProviderContext = React.PropsWithChildren<ClaimApi & ClaimState & ClaimActions>

const initialClaimProvider: ClaimProviderContext = {
  ...defaultClaimState,
  ...defaultClaimActions,
  ...claimApiMockInstances.error,
}
const ClaimContext = React.createContext<ClaimProviderContext>(initialClaimProvider)

type ClaimProviderProps = React.PropsWithChildren<{
  claimApi: ClaimApi
  initialState?: ClaimState
}>
export const ClaimProvider = ({children, claimApi, initialState}: ClaimProviderProps) => {
  const [state, dispatch] = React.useReducer(claimReducer, {
    ...defaultClaimState,
    ...initialState,
  })

  const actions = React.useRef<ClaimActions>({
    claimInfoChanged: (claimInfo: ClaimInfo) => {
      dispatch({type: ClaimActionType.ClaimInfoChanged, claimInfo})
    },
    scanActionClaimChanged: (scanActionClaim: ScanActionClaim) => {
      dispatch({type: ClaimActionType.ScanActionClaimChanged, scanActionClaim})
    },
    reset: () => {
      dispatch({type: ClaimActionType.Reset})
    },
  }).current

  const context = React.useMemo<ClaimProviderContext>(
    () => ({
      ...state,
      ...claimApi,
      ...actions,
    }),
    [state, claimApi, actions],
  )

  return <ClaimContext.Provider value={context}>{children}</ClaimContext.Provider>
}
export const useClaim = () =>
  React.useContext(ClaimContext) ?? invalid('useClaim: needs to be wrapped in a ClaimManagerProvider')
