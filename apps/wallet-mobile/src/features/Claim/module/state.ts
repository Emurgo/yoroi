import {invalid} from '@yoroi/common'
import {castDraft, produce} from 'immer'

import {ScanActionClaim} from '../../Scan/common/types'
import {ClaimInfo, ClaimState} from './types'

export type ClaimActions = Readonly<{
  claimInfoChanged: (claimInfo: ClaimInfo) => void
  scanActionClaimChanged: (scanActionClaim: ScanActionClaim) => void
  reset: () => void
}>

export enum ClaimActionType {
  ClaimInfoChanged = 'claimInfoChanged',
  ScanActionClaimChanged = 'scanActionClaimChanged',
  Reset = 'reset',
}

export type ClaimAction =
  | {
      type: ClaimActionType.ClaimInfoChanged
      claimInfo: ClaimInfo
    }
  | {
      type: ClaimActionType.ScanActionClaimChanged
      scanActionClaim: ScanActionClaim
    }
  | {
      type: ClaimActionType.Reset
    }

export const defaultClaimState: ClaimState = {
  claimInfo: undefined,
  scanActionClaim: undefined,
} as const

export const defaultClaimActions: ClaimActions = {
  claimInfoChanged: () => invalid('missing init'),
  scanActionClaimChanged: () => invalid('missing init'),
  reset: () => invalid('missing init'),
} as const

export const claimReducer = (state: ClaimState, action: ClaimAction): ClaimState => {
  return produce(state, (draft) => {
    switch (action.type) {
      case ClaimActionType.ClaimInfoChanged:
        draft.claimInfo = castDraft(action.claimInfo)
        break
      case ClaimActionType.ScanActionClaimChanged:
        draft.scanActionClaim = action.scanActionClaim
        break
      case ClaimActionType.Reset:
        draft.claimInfo = undefined
        draft.scanActionClaim = undefined
        break
    }
  })
}
