import {Resolver} from '@yoroi/types'

import {renderHook, act} from '@testing-library/react'

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
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('works', () => {
    const wrapper = wrapperManagerFixture({
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
