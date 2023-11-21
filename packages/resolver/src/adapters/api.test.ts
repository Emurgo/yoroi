import {resolverApiMaker} from './api'
import {getHandleCryptoAddress} from './handle-api'
import {getUnstoppableCryptoAddress} from './unstoppable-api'

jest.mock('./handle-api', () => ({
  getHandleCryptoAddress: jest.fn(),
}))
jest.mock('./unstoppable-api', () => ({
  getUnstoppableCryptoAddress: jest.fn(),
}))

describe('resolverApiMaker', () => {
  const mockDomain = 'example.domain'

  it('resolves all addresses with strategy "all"', async () => {
    // @ts-ignore
    getHandleCryptoAddress.mockResolvedValue('handleAddress')
    // @ts-ignore
    getUnstoppableCryptoAddress.mockResolvedValue('unstoppableAddress')

    const api = resolverApiMaker('all')
    const results = await api.getCryptoAddress(mockDomain)

    expect(results).toEqual([
      {address: 'handleAddress', error: null},
      {address: 'unstoppableAddress', error: null},
    ])
  })

  it('handles errors with strategy "all"', async () => {
    const mockError = new Error('Test Error')
    // @ts-ignore
    getHandleCryptoAddress.mockResolvedValue('handleAddress')
    // @ts-ignore
    getUnstoppableCryptoAddress.mockRejectedValue(mockError)

    const api = resolverApiMaker('all')
    const results = await api.getCryptoAddress(mockDomain)

    expect(results).toEqual([
      {address: 'handleAddress', error: null},
      {address: null, error: mockError},
    ])
  })

  it('resolves first successful address with strategy "first"', async () => {
    // @ts-ignore
    getHandleCryptoAddress.mockRejectedValue(new Error('Test Error'))
    // @ts-ignore
    getUnstoppableCryptoAddress.mockResolvedValue('unstoppableAddress')

    const api = resolverApiMaker('first')
    const results = await api.getCryptoAddress(mockDomain)

    expect(results).toEqual([{address: 'unstoppableAddress', error: null}])
  })

  it('handles all errors with strategy "first"', async () => {
    const mockError = new Error('Test Error')
    // @ts-ignore
    getHandleCryptoAddress.mockRejectedValue(mockError)
    // @ts-ignore
    getUnstoppableCryptoAddress.mockRejectedValue(mockError)

    const api = resolverApiMaker('first')
    try {
      await api.getCryptoAddress(mockDomain)
    } catch (error) {
      expect(error).toEqual(mockError)
    }
  })
})
