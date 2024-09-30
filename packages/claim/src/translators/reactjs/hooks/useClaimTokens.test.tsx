import {QueryClient} from '@tanstack/react-query'
import {renderHook, act} from '@testing-library/react-hooks'
import {queryClientFixture} from '@yoroi/common'
import {Claim, Scan} from '@yoroi/types'

import {
  claimApiMockResponses,
  claimManagerMockInstances,
} from '../../../manager.mocks'
import {wrapperMaker} from '../../../fixtures/wrapperMaker'
import {useClaimTokens} from './useClaimTokens'

jest.useFakeTimers()

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

    const wrapper = wrapperMaker({
      claimManager: claimManagerMock,
      queryClient,
    })

    const {result, waitFor: waitForHook} = renderHook(() => useClaimTokens(), {
      wrapper,
    })

    await act(async () => result.current.claimTokens(scanClaimAction))

    await waitForHook(() => expect(result.current.isLoading).toBe(false))

    expect(claimManagerMock.claimTokens).toHaveBeenCalledTimes(1)
    expect(claimManagerMock.claimTokens).toHaveBeenCalledWith(scanClaimAction)
    expect(result.current.isError).toBe(false)
  })
})
