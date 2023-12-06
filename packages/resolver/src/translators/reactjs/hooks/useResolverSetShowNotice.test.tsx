import {QueryClient} from 'react-query'
import {renderHook, act} from '@testing-library/react-hooks'

import {queryClientFixture} from '../../../fixtures/query-client'
import {wrapperManagerFixture} from '../../../fixtures/manager-wrapper'
import {resolverModuleMocks} from '../../module.mocks'
import {useResolverSetShowNotice} from './useResolverSetShowNotice'

describe('useResolverSetShowNotice', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  const mockResolverModule = {...resolverModuleMocks.success}

  it('success', async () => {
    mockResolverModule.showNotice.save = jest.fn().mockResolvedValue(undefined)
    const wrapper = wrapperManagerFixture({
      queryClient,
      resolverModule: mockResolverModule,
    })

    const {result, waitFor: waitForHook} = renderHook(
      () => useResolverSetShowNotice(),
      {wrapper},
    )

    await act(async () => result.current.setShowNotice(true))

    await waitForHook(() => expect(result.current.isLoading).toBe(false))

    expect(mockResolverModule.showNotice.save).toHaveBeenCalledTimes(1)
    expect(mockResolverModule.showNotice.save).toHaveBeenCalledWith(true)
    expect(result.current.isError).toBe(false)
  })
})
