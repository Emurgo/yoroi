import {Claim, Scan} from '@yoroi/types'
import * as React from 'react'

import {claimManagerMockInstances} from '../../../manager.mocks'
import {
  ClaimActionType,
  ClaimActions,
  ClaimState,
  claimReducer,
  defaultClaimActions,
  defaultClaimState,
} from '../state/state'

export type ClaimProviderContext = React.PropsWithChildren<
  Claim.Manager & ClaimState & ClaimActions
>

const initialClaimProvider: ClaimProviderContext = {
  ...defaultClaimState,
  ...defaultClaimActions,
  ...claimManagerMockInstances.error,
}
export const ClaimContext =
  React.createContext<ClaimProviderContext>(initialClaimProvider)

type ClaimProviderProps = React.PropsWithChildren<{
  manager: Claim.Manager
  initialState?: ClaimState
}>
export const ClaimProvider = ({
  children,
  manager,
  initialState,
}: ClaimProviderProps) => {
  const [state, dispatch] = React.useReducer(claimReducer, {
    ...defaultClaimState,
    ...initialState,
  })

  const actions = React.useRef<ClaimActions>({
    claimInfoChanged: (claimInfo: Claim.Info) => {
      dispatch({type: ClaimActionType.ClaimInfoChanged, claimInfo})
    },
    scanActionClaimChanged: (scanActionClaim: Scan.ActionClaim) => {
      dispatch({type: ClaimActionType.ScanActionClaimChanged, scanActionClaim})
    },
    reset: () => {
      dispatch({type: ClaimActionType.Reset})
    },
  }).current

  const context = React.useMemo<ClaimProviderContext>(
    () => ({
      ...state,
      ...manager,
      ...actions,
    }),
    [state, manager, actions],
  )

  return (
    <ClaimContext.Provider value={context}>{children}</ClaimContext.Provider>
  )
}
