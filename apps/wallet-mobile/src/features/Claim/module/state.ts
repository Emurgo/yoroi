import {invalid} from '@yoroi/common'
import {produce} from 'immer'

import {ScanActionClaim} from '../../Scan/common/types'
import {ClaimState, ClaimToken} from './types'
export type ClaimActions = Readonly<{
  claimTokenChanged: (claimToken: ClaimToken) => void
  scanActionClaimChanged: (scanActionClaim: ScanActionClaim) => void
  reset: () => void
}>

export enum ClaimActionType {
  ClaimTokenChanged = 'claimTokenChanged',
  ScanActionClaimChanged = 'scanActionClaimChanged',
  Reset = 'reset',
}

export type ClaimAction =
  | {
      type: ClaimActionType.ClaimTokenChanged
      claimToken: ClaimToken
    }
  | {
      type: ClaimActionType.ScanActionClaimChanged
      scanActionClaim: ScanActionClaim
    }
  | {
      type: ClaimActionType.Reset
    }

export const defaultClaimState: ClaimState = {
  claimToken: undefined,
  scanActionClaim: undefined,
} as const

export const defaultClaimActions: ClaimActions = {
  claimTokenChanged: () => invalid('missing init'),
  scanActionClaimChanged: () => invalid('missing init'),
  reset: () => invalid('missing init'),
} as const

export const claimReducer = (state: ClaimState, action: ClaimAction): ClaimState => {
  return produce(state, (draft) => {
    switch (action.type) {
      case ClaimActionType.ClaimTokenChanged:
        draft.claimToken = action.claimToken
        break
      case ClaimActionType.ScanActionClaimChanged:
        draft.scanActionClaim = action.scanActionClaim
        break
      case ClaimActionType.Reset:
        draft.claimToken = undefined
        draft.scanActionClaim = undefined
        break
    }
  })
}
