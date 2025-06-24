import {Claim, Scan} from '@yoroi/types'

import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {act, renderHook, waitFor} from '@testing-library/react'
import * as React from 'react'

import {
  claimApiMockResponses,
  claimManagerMockInstances,
} from '../../../manager.mocks'
import {queryClientFixture} from '../../../fixtures/query-client'
import {ClaimProvider} from '../provider/ClaimProvider'
import {useClaimTokens} from './useClaimTokens'

describe('useClaimTokens', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  const scanClaimAction: Scan.ActionClaim = {
    action: 'claim',
    code: 'code',
    params: {},
    url: 'url',
  }

  it('success', async () => {
    const claimManagerMock: Claim.Manager = {
      ...claimManagerMockInstances.processing,
      claimTokens: jest
        .fn()
        .mockResolvedValue(claimApiMockResponses.claimTokens.processing),
    }

    const wrapper = ({children}: React.PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>
        <ClaimProvider manager={claimManagerMock}>{children}</ClaimProvider>
      </QueryClientProvider>
    )

    const {result} = renderHook(() => useClaimTokens(), {wrapper})

    // Initial state
    expect(result.current.isError).toBe(false)

    // Trigger the claim action
    await act(async () => {
      result.current.claimTokens(scanClaimAction)
    })

    // Wait for the mutation to complete
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(claimManagerMock.claimTokens).toHaveBeenCalledTimes(1)
    expect(claimManagerMock.claimTokens).toHaveBeenCalledWith(scanClaimAction)
    expect(result.current.isError).toBe(false)
  })
})
