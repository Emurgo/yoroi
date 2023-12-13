import {Resolver} from '@yoroi/types'

import {resolverApiMaker} from './api'

const mockApiConfig = {
  apiConfig: {
    [Resolver.NameServer.Unstoppable]: {
      apiKey: 'mock-api-key',
    },
  },
}
const mockError = new Error('Test Error')

describe('resolverApiMaker', () => {
  const domain = 'example.domain'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCardanoAddresses', () => {
    describe('strategy "all"', () => {
      it('all resolved', async () => {
        const deps = {
          unstoppableApi: {
            getCryptoAddress: jest
              .fn()
              .mockReturnValue(
                jest.fn().mockResolvedValue('unstoppableAddress'),
              ),
          },
          handleApi: {
            getCryptoAddress: jest
              .fn()
              .mockReturnValue(jest.fn().mockResolvedValue('handleAddress')),
          },
          cnsApi: {
            getCryptoAddress: jest.fn().mockResolvedValue('cnsAddress'),
          },
        }

        const api = resolverApiMaker(mockApiConfig, deps)
        const results = await api.getCardanoAddresses({resolve: domain})

        expect(results).toEqual([
          {address: 'handleAddress', error: null, nameServer: 'handle'},
          {
            address: 'unstoppableAddress',
            error: null,
            nameServer: 'unstoppable',
          },
          {address: 'cnsAddress', error: null, nameServer: 'cns'},
        ])
      })

      it('some resolved', async () => {
        const deps = {
          unstoppableApi: {
            getCryptoAddress: jest
              .fn()
              .mockReturnValue(jest.fn().mockRejectedValue(mockError)),
          },
          handleApi: {
            getCryptoAddress: jest
              .fn()
              .mockReturnValue(jest.fn().mockResolvedValue('handleAddress')),
          },
          cnsApi: {
            getCryptoAddress: jest.fn().mockRejectedValue(mockError),
          },
        }

        const api = resolverApiMaker(mockApiConfig, deps)
        const results = await api.getCardanoAddresses({resolve: domain})

        expect(results).toEqual([
          {address: 'handleAddress', error: null, nameServer: 'handle'},
          {address: null, error: mockError.message, nameServer: 'unstoppable'},
          {address: null, error: mockError.message, nameServer: 'cns'},
        ])
      })
    })

    describe('strategy "first"', () => {
      it('any resolved', async () => {
        const deps = {
          unstoppableApi: {
            getCryptoAddress: jest
              .fn()
              .mockReturnValue(jest.fn().mockRejectedValue(mockError)),
          },
          handleApi: {
            getCryptoAddress: jest
              .fn()
              .mockReturnValue(jest.fn().mockResolvedValue('handleAddress')),
          },
          cnsApi: {
            getCryptoAddress: jest.fn().mockRejectedValue(mockError),
          },
        }

        const api = resolverApiMaker(mockApiConfig, deps)
        const results = await api.getCardanoAddresses({
          resolve: domain,
          strategy: 'first',
        })

        expect(results).toEqual([
          {address: 'handleAddress', error: null, nameServer: 'handle'},
        ])
      })

      it('none resolved', async () => {
        const deps = {
          unstoppableApi: {
            getCryptoAddress: jest
              .fn()
              .mockReturnValue(jest.fn().mockRejectedValue(mockError)),
          },
          handleApi: {
            getCryptoAddress: jest
              .fn()
              .mockReturnValue(jest.fn().mockRejectedValue(mockError)),
          },
          cnsApi: {
            getCryptoAddress: jest.fn().mockRejectedValue(mockError),
          },
        }

        const api = resolverApiMaker(mockApiConfig, deps)
        const results = await api.getCardanoAddresses({
          resolve: domain,
          strategy: 'first',
        })

        expect(results).toEqual([
          {address: null, error: 'Not resolved', nameServer: null},
        ])
      })
    })

    it('instantiate - coverage only', async () => {
      const api = resolverApiMaker(mockApiConfig)
      expect(api).toBeDefined()
    })
  })
})
