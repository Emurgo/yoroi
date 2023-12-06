import {resolverApiMaker} from './api'

const mockApiConfig = {
  apiConfig: {
    unstoppable: {
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

  describe('getCryptoAddresses', () => {
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
        const results = await api.getCryptoAddresses(domain)

        expect(results).toEqual([
          {address: 'handleAddress', error: null, service: 'handle'},
          {address: 'unstoppableAddress', error: null, service: 'unstoppable'},
          {address: 'cnsAddress', error: null, service: 'cns'},
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
        const results = await api.getCryptoAddresses(domain)

        expect(results).toEqual([
          {address: 'handleAddress', error: null, service: 'handle'},
          {address: null, error: mockError.message, service: 'unstoppable'},
          {address: null, error: mockError.message, service: 'cns'},
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
        const results = await api.getCryptoAddresses(domain, 'first')

        expect(results).toEqual([
          {address: 'handleAddress', error: null, service: 'handle'},
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
        const results = await api.getCryptoAddresses(domain, 'first')

        expect(results).toEqual([
          {address: null, error: 'Not resolved', service: null},
        ])
      })
    })

    it('instantiate - coverage only', async () => {
      const api = resolverApiMaker(mockApiConfig)
      expect(api).toBeDefined()
    })
  })
})
