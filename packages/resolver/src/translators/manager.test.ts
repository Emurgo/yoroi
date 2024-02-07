/* istanbul ignore file */
import {mockResolverApi} from '../adapters/api.mocks'
import {mockStorageMaker} from '../adapters/storage.mocks'
import {resolverManagerMaker} from './manager'

describe('resolverManagerMaker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates a module with getCryptoAddress function', () => {
    const module = resolverManagerMaker(
      mockStorageMaker.success,
      mockResolverApi,
    )

    expect(module).toHaveProperty('crypto.getCardanoAddresses')
    expect(module).toHaveProperty('showNotice.read')
    expect(module).toHaveProperty('showNotice.remove')
    expect(module).toHaveProperty('showNotice.save')
    expect(module).toHaveProperty('showNotice.key')
  })
})
