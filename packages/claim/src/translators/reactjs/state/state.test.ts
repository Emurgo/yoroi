import {Scan} from '@yoroi/types'
import {claimApiMockResponses} from '../../../manager.mocks'
import {
  claimReducer,
  defaultClaimState,
  ClaimActionType,
  ClaimActionInfoChanged,
  ClaimActionScanActionClaimChanged,
  ClaimActionReset,
} from './state'

describe('claimReducer', () => {
  it('should return default state when no action matches', () => {
    const initialState = defaultClaimState
    const action = {type: 'unknown'} as any
    const newState = claimReducer(initialState, action)

    expect(newState).toBe(initialState)
  })

  it('should handle ClaimInfoChanged action', () => {
    const initialState = defaultClaimState
    const action: ClaimActionInfoChanged = {
      type: ClaimActionType.ClaimInfoChanged,
      claimInfo: claimApiMockResponses.claimTokens.accepted,
    }

    const newState = claimReducer(initialState, action)

    expect(newState.claimInfo).toEqual(
      claimApiMockResponses.claimTokens.accepted,
    )
  })

  it('should handle ScanActionClaimChanged action', () => {
    const initialState = defaultClaimState
    const scanAction: Scan.ActionClaim = {
      action: 'claim',
      code: 'code',
      params: {},
      url: 'https://example.com',
    }
    const action: ClaimActionScanActionClaimChanged = {
      type: ClaimActionType.ScanActionClaimChanged,
      scanActionClaim: scanAction,
    }

    const newState = claimReducer(initialState, action)

    expect(newState.scanActionClaim).toEqual(scanAction)
  })

  it('should handle Reset action', () => {
    const scanAction: Scan.ActionClaim = {
      action: 'claim',
      code: 'code',
      params: {},
      url: 'https://example.com',
    }
    const populatedState = {
      claimInfo: claimApiMockResponses.claimTokens.accepted,
      scanActionClaim: scanAction,
    }
    const action: ClaimActionReset = {
      type: ClaimActionType.Reset,
    }

    const newState = claimReducer(populatedState, action)

    expect(newState.claimInfo).toBeUndefined()
    expect(newState.scanActionClaim).toBeUndefined()
  })
})
