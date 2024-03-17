import {exchangeApiMaker, providers} from './api'

describe('exchangeApiMaker', () => {
  describe('getBaseUrl', () => {
    describe('Banxa', () => {
      beforeEach(() => {
        jest.clearAllMocks()
      })

      it('resolves', async () => {
        const isProduction = true
        const partner = 'yoroi'
        const providerId = 'banxa'
        const deps = {
          banxaApi: {
            getBaseUrl: jest
              .fn()
              .mockReturnValue(jest.fn().mockResolvedValue('banxa-url')),
          },
          encryptusApi: {
            getBaseUrl: jest
              .fn()
              .mockReturnValue(jest.fn().mockResolvedValue('encryptus-url')),
          },
        }

        const api = exchangeApiMaker({isProduction, partner}, deps)
        const result = await api.getBaseUrl(providerId)
        expect(result).toBe('banxa-url')
      })
    })

    describe('Encryptus', () => {
      beforeEach(() => {
        jest.clearAllMocks()
      })

      it('resolves', async () => {
        const isProduction = true
        const partner = 'yoroi'
        const providerId = 'encryptus'
        const deps = {
          banxaApi: {
            getBaseUrl: jest
              .fn()
              .mockReturnValue(jest.fn().mockResolvedValue('banxa-url')),
          },
          encryptusApi: {
            getBaseUrl: jest
              .fn()
              .mockReturnValue(jest.fn().mockResolvedValue('encryptus-url')),
          },
        }

        const api = exchangeApiMaker({isProduction, partner}, deps)
        const result = await api.getBaseUrl(providerId)
        expect(result).toBe('encryptus-url')
      })
    })

    it('does not resolve', async () => {
      const isProduction = true
      const partner = 'yoroi'
      const providerId = 'none'
      const deps = {
        banxaApi: {
          getBaseUrl: jest
            .fn()
            .mockReturnValue(jest.fn().mockResolvedValue('banxa-url')),
        },
        encryptusApi: {
          getBaseUrl: jest
            .fn()
            .mockReturnValue(jest.fn().mockResolvedValue('encryptus-url')),
        },
      }

      const api = exchangeApiMaker({isProduction, partner}, deps)

      try {
        await api.getBaseUrl(providerId)
      } catch (e: any) {
        expect(e.message).toBe('Unknown provider: none')
      }
    })
  })

  it('getProviders', async () => {
    const isProduction = true
    const partner = 'yoroi'
    const deps = {
      banxaApi: {
        getBaseUrl: jest
          .fn()
          .mockReturnValue(jest.fn().mockResolvedValue('banxa-url')),
      },
      encryptusApi: {
        getBaseUrl: jest
          .fn()
          .mockReturnValue(jest.fn().mockResolvedValue('encryptus-url')),
      },
    }

    const api = exchangeApiMaker({isProduction, partner}, deps)
    const result = await api.getProviders()
    expect(result).toEqual(providers)
  })

  it('should build without dependencies (coverage only)', () => {
    const isProduction = true
    const partner = 'yoroi'
    const api = exchangeApiMaker({isProduction, partner})
    expect(api).toBeDefined()
  })
})
