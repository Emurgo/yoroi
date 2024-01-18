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

  describe('getCardanoAddresses', () => {
    describe('strategy "all"', () => {
      beforeEach(jest.clearAllMocks)

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
        expect(deps.cnsApi.getCryptoAddress).toHaveBeenCalledTimes(1)
        expect(deps.handleApi.getCryptoAddress).toHaveBeenCalledTimes(1)
        expect(deps.cnsApi.getCryptoAddress).toHaveBeenCalledTimes(1)
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
        expect(deps.cnsApi.getCryptoAddress).toHaveBeenCalledTimes(1)
        expect(deps.handleApi.getCryptoAddress).toHaveBeenCalledTimes(1)
        expect(deps.cnsApi.getCryptoAddress).toHaveBeenCalledTimes(1)
      })
    })

    describe('strategy "first"', () => {
      beforeEach(jest.clearAllMocks)

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
        expect(deps.cnsApi.getCryptoAddress).toHaveBeenCalledTimes(1)
        expect(deps.handleApi.getCryptoAddress).toHaveBeenCalledTimes(1)
        expect(deps.cnsApi.getCryptoAddress).toHaveBeenCalledTimes(1)
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
        expect(deps.cnsApi.getCryptoAddress).toHaveBeenCalledTimes(1)
        expect(deps.handleApi.getCryptoAddress).toHaveBeenCalledTimes(1)
        expect(deps.cnsApi.getCryptoAddress).toHaveBeenCalledTimes(1)
      })
    })

    it('instantiate - coverage only', async () => {
      const api = resolverApiMaker(mockApiConfig)
      expect(api).toBeDefined()
    })
  })
})
