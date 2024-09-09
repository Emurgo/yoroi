import {act, renderHook} from '@testing-library/react-hooks'
import {queryClientFixture} from '@yoroi/common'
import {QueryClient} from 'react-query'

import {wrapperMaker} from '../../../fixtures/wrapperMaker'
import {claimManagerMockInstances} from '../../../manager.mocks'
import {defaultClaimState} from '../state/state'
import {useClaim} from '../hooks/useClaim'

describe('ClaimProvider', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  test('state changes', () => {
    const {result} = renderHook(() => useClaim(), {
      wrapper: wrapperMaker({
        claimManager: claimManagerMockInstances.processing,
        queryClient,
      }),
    })

    act(() => {
      result.current.scanActionClaimChanged({
        action: 'claim',
        code: 'code',
        params: {},
        url: 'https://example.com',
      })
    })

    expect(result.current.scanActionClaim).toEqual({
      action: 'claim',
      code: 'code',
      params: {},
      url: 'https://example.com',
    })

    act(() => {
      result.current.claimInfoChanged({
        txHash: 'txHash',
        status: 'processing',
        amounts: [],
      })
    })

    expect(result.current.claimInfo).toEqual({
      txHash: 'txHash',
      status: 'processing',
      amounts: [],
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.scanActionClaim).toEqual(
      defaultClaimState.scanActionClaim,
    )
    expect(result.current.claimInfo).toEqual(defaultClaimState.claimInfo)
  })
})
