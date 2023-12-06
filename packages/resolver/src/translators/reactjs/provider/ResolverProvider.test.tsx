import {Resolver} from '@yoroi/types'
import {QueryClient} from 'react-query'
import {renderHook, act} from '@testing-library/react-hooks'

import {queryClientFixture} from '../../../fixtures/query-client'
import {useResolver} from './ResolverProvider'
import {wrapperManagerFixture} from '../../../fixtures/manager-wrapper'

const resolverModuleMock: Resolver.Module = {
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
      resolverModule: resolverModuleMock,
    })
    const {result} = renderHook(() => useResolver(), {
      wrapper,
    })

    act(() => {
      result.current.showNotice.read()
      result.current.showNotice.save(true)
      result.current.showNotice.remove()
      result.current.crypto.getCardanoAddresses('domain')
    })

    expect(resolverModuleMock.showNotice.read).toHaveBeenCalled()
    expect(resolverModuleMock.showNotice.save).toHaveBeenCalledWith(true)
    expect(resolverModuleMock.showNotice.remove).toHaveBeenCalled()
    expect(resolverModuleMock.crypto.getCardanoAddresses).toHaveBeenCalledWith(
      'domain',
    )
    expect(result.current.showNotice.key).toBe('show-notice-key')
  })
})
