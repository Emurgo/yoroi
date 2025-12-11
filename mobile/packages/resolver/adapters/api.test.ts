import {Resolver} from '@yoroi/types'

import {init} from '@emurgo/cross-csl-nodejs'

import {resolverApiMaker} from './api'

const mockApiConfig = {
  apiConfig: {
    [Resolver.NameServer.Unstoppable]: {
      apiKey: 'mock-api-key',
    },
  },
  cslFactory: init,
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
            getCryptoAddress: jest
              .fn()
              .mockReturnValue(jest.fn().mockResolvedValue('cnsAddress')),
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
            getCryptoAddress: jest
              .fn()
              .mockReturnValue(jest.fn().mockRejectedValue(mockError)),
          },
        }

        const api = resolverApiMaker(mockApiConfig, deps)
        const results = await api.getCardanoAddresses({resolve: domain})

        expect(results).toEqual([
          {address: 'handleAddress', error: null, nameServer: 'handle'},
          {address: null, error: mockError, nameServer: 'unstoppable'},
          {address: null, error: mockError, nameServer: 'cns'},
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
            getCryptoAddress: jest
              .fn()
              .mockReturnValue(jest.fn().mockRejectedValue(mockError)),
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
            getCryptoAddress: jest
              .fn()
              .mockReturnValue(jest.fn().mockRejectedValue(mockError)),
          },
        }

        const api = resolverApiMaker(mockApiConfig, deps)
        const results = await api.getCardanoAddresses({
          resolve: domain,
          strategy: 'first',
        })

        expect(results).toEqual([
          {
            address: null,
            error: new Resolver.Errors.NotFound(),
            nameServer: null,
          },
        ])
      })
    })

    it('instantiate - coverage only', async () => {
      const api = resolverApiMaker(mockApiConfig)
      expect(api).toBeDefined()
    })

    it('should work with isMainnet = false', async () => {
      const deps = {
        unstoppableApi: {
          getCryptoAddress: jest
            .fn()
            .mockReturnValue(jest.fn().mockResolvedValue('unstoppableAddress')),
        },
        handleApi: {
          getCryptoAddress: jest
            .fn()
            .mockReturnValue(jest.fn().mockResolvedValue('handleAddress')),
        },
        cnsApi: {
          getCryptoAddress: jest
            .fn()
            .mockReturnValue(jest.fn().mockResolvedValue('cnsAddress')),
        },
      }

      const api = resolverApiMaker({...mockApiConfig, isMainnet: false}, deps)
      const results = await api.getCardanoAddresses({resolve: domain})

      expect(results).toHaveLength(3)
      expect(deps.handleApi.getCryptoAddress).toHaveBeenCalledWith({
        request: expect.any(Function),
        isMainnet: false,
      })
      expect(deps.cnsApi.getCryptoAddress).toHaveBeenCalledWith(
        expect.any(Function),
        false,
      )
    })

    it('should pass fetcherConfig to operations', async () => {
      const handleFn = jest.fn().mockResolvedValue('handleAddress')
      const cnsFn = jest.fn().mockResolvedValue('cnsAddress')
      const unstoppableFn = jest.fn().mockResolvedValue('unstoppableAddress')

      const deps = {
        unstoppableApi: {
          getCryptoAddress: jest.fn().mockReturnValue(unstoppableFn),
        },
        handleApi: {
          getCryptoAddress: jest.fn().mockReturnValue(handleFn),
        },
        cnsApi: {
          getCryptoAddress: jest.fn().mockReturnValue(cnsFn),
        },
      }

      const api = resolverApiMaker(mockApiConfig, deps)
      const fetcherConfig = {timeout: 5000}

      await api.getCardanoAddresses({resolve: domain}, fetcherConfig)

      expect(handleFn).toHaveBeenCalledWith(domain, fetcherConfig)
      expect(cnsFn).toHaveBeenCalledWith(domain, fetcherConfig)
      expect(unstoppableFn).toHaveBeenCalledWith(domain, fetcherConfig)
    })
  })
})
