import {invalid} from '@yoroi/common'
import {Claim, Scan} from '@yoroi/types'
import {castDraft, produce} from 'immer'

export type ClaimActions = Readonly<{
  claimInfoChanged: (claimInfo: Claim.Info) => void
  scanActionClaimChanged: (scanActionClaim: Scan.ActionClaim) => void
  reset: () => void
}>

export enum ClaimActionType {
  ClaimInfoChanged = 'claimInfoChanged',
  ScanActionClaimChanged = 'scanActionClaimChanged',
  Reset = 'reset',
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

export const claimReducer = (
  state: ClaimState,
  action: ClaimAction,
): ClaimState => {
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

export type ClaimState = Readonly<{
  claimInfo: Claim.Info | undefined
  scanActionClaim: Scan.ActionClaim | undefined
}>

export type ClaimAction =
  | {
      type: ClaimActionType.ClaimInfoChanged
      claimInfo: Claim.Info
    }
  | {
      type: ClaimActionType.ScanActionClaimChanged
      scanActionClaim: Scan.ActionClaim
    }
  | {
      type: ClaimActionType.Reset
    }
