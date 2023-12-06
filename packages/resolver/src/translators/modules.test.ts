/* istanbul ignore file */
import {mockResolverApi} from '../adapters/api.mocks'
import {mockStorageMaker} from '../adapters/storage.mocks'
import {resolverModuleMaker} from './module'

describe('resolverModuleMaker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates a module with getCryptoAddress function', () => {
    const module = resolverModuleMaker(
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
