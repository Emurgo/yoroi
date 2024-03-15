import {Exchange} from '@yoroi/types'
import {exchangeApiMaker} from './api'

describe('exchangeApiMaker', () => {
  describe('getBaseUrl', () => {
    describe('Banxa', () => {
      beforeEach(() => {
        jest.clearAllMocks()
      })

      it('resolves', async () => {
        const provider = Exchange.Provider.Banxa
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

        const api = exchangeApiMaker({provider}, deps)
        const result = await api.getBaseUrl({isProduction: true})
        expect(result).toBe('banxa-url')
      })
    })

    describe('Encryptus', () => {
      beforeEach(() => {
        jest.clearAllMocks()
      })

      it('resolves', async () => {
        const provider = Exchange.Provider.Encryptus
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

        const api = exchangeApiMaker({provider}, deps)
        const result = await api.getBaseUrl({isProduction: true})
        expect(result).toBe('encryptus-url')
      })
    })
  })

  it('should build without dependencies (coverage only)', () => {
    const provider = Exchange.Provider.Encryptus
    const api = exchangeApiMaker({provider})
    expect(api).toBeDefined()
  })
})
