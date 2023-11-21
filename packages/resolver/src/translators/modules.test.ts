/* istanbul ignore file */
import {resolverApiMaker} from '../adapters/api'
import {resolverModuleMaker} from './module'

jest.mock('../adapters/api', () => ({
  resolverApiMaker: jest.fn(),
}))

describe('resolverModuleMaker', () => {
  const mockStrategy = 'all'
  const mockApiConfig = {someKey: 'someValue'}
  const mockGetCryptoAddress = jest.fn()

  beforeEach(() => {
    // @ts-ignore
    resolverApiMaker.mockImplementation(() => ({
      getCryptoAddress: mockGetCryptoAddress,
    }))
  })

  it('creates a module with getCryptoAddress function', () => {
    const module = resolverModuleMaker(mockStrategy, mockApiConfig)

    expect(module).toHaveProperty('address.getCryptoAddress')
  })

  it('calls getCryptoAddress from the created API', () => {
    const module = resolverModuleMaker(mockStrategy, mockApiConfig)
    const mockDomain = 'example.domain'

    module.address.getCryptoAddress(mockDomain)

    expect(mockGetCryptoAddress).toHaveBeenCalledWith(mockDomain)
  })
})
