import {invalid} from '@yoroi/common'
import {Claim, Links} from '@yoroi/types'

export type ClaimActions = Readonly<{
  claimInfoChanged: (claimInfo: Claim.Info) => void
  scanActionClaimChanged: (scanActionClaim: Links.CardanoActionClaim) => void
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

export const claimReducer = (
  state: ClaimState,
  action: ClaimAction,
): ClaimState => {
  switch (action.type) {
    case ClaimActionType.ClaimInfoChanged:
      return {
        ...state,
        claimInfo: action.claimInfo,
      }
    case ClaimActionType.ScanActionClaimChanged:
      return {
        ...state,
        scanActionClaim: action.scanActionClaim,
      }
    case ClaimActionType.Reset:
      return {
        ...state,
        claimInfo: undefined,
        scanActionClaim: undefined,
      }
    default:
      return state
  }
}

export type ClaimState = Readonly<{
  claimInfo: Claim.Info | undefined
  scanActionClaim: Links.CardanoActionClaim | undefined
}>

export type ClaimActionInfoChanged = {
  type: ClaimActionType.ClaimInfoChanged
  claimInfo: Claim.Info
}

export type ClaimActionScanActionClaimChanged = {
  type: ClaimActionType.ScanActionClaimChanged
  scanActionClaim: Links.CardanoActionClaim
}

export type ClaimActionReset = {
  type: ClaimActionType.Reset
}

export type ClaimAction =
  | ClaimActionInfoChanged
  | ClaimActionScanActionClaimChanged
  | ClaimActionReset

/* istanbul ignore next */
export const defaultClaimActions: ClaimActions = {
  claimInfoChanged: () => invalid('missing init'),
  scanActionClaimChanged: () => invalid('missing init'),
  reset: () => invalid('missing init'),
} as const
