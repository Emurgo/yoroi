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
      mockResolverApi.success,
    )

    expect(module).toHaveProperty('address.getCryptoAddresses')
    expect(module).toHaveProperty('notice.read')
    expect(module).toHaveProperty('notice.remove')
    expect(module).toHaveProperty('notice.save')
    expect(module).toHaveProperty('notice.key')
  })
})
