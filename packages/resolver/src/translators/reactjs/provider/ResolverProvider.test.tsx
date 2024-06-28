import {Resolver} from '@yoroi/types'
import {QueryClient} from 'react-query'
import {renderHook, act} from '@testing-library/react-hooks'

import {queryClientFixture} from '../../../fixtures/query-client'
import {useResolver} from './ResolverProvider'
import {wrapperManagerFixture} from '../../../fixtures/manager-wrapper'

const resolverManagerMock: Resolver.Manager = {
  crypto: {
    getCardanoAddresses: jest.fn(),
  },
  showNotice: {
    read: jest.fn(),
    remove: jest.fn(),
    save: jest.fn(),
    key: 'show-notice-key',
  },
}

describe('ResolverProvider', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = queryClientFixture()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('works', () => {
    const wrapper = wrapperManagerFixture({
      queryClient,
      resolverManager: resolverManagerMock,
    })
    const {result} = renderHook(() => useResolver(), {
      wrapper,
    })

    act(() => {
      result.current.showNotice.read()
      result.current.showNotice.save(true)
      result.current.showNotice.remove()
      result.current.crypto.getCardanoAddresses({resolve: 'domain'})
    })

    expect(resolverManagerMock.showNotice.read).toHaveBeenCalled()
    expect(resolverManagerMock.showNotice.save).toHaveBeenCalledWith(true)
    expect(resolverManagerMock.showNotice.remove).toHaveBeenCalled()
    expect(resolverManagerMock.crypto.getCardanoAddresses).toHaveBeenCalledWith(
      {resolve: 'domain'},
    )
    expect(result.current.showNotice.key).toBe('show-notice-key')
  })
})
