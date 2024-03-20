import {Exchange} from '@yoroi/types'
import {freeze} from 'immer'
import {exchangeManagerMaker} from './manager'

describe('referralLink', () => {
  test('should generate a correct referral link with all parameters with access token and pathname', async () => {
    const origin = 'https://checkout.banxa.com'
    const pathname = '/pw'
    const baseUrl = `${origin}${pathname}/?&access_token=FAKE_TOKEN`
    const fullUrl =
      `${origin}` +
      `${pathname}/?` +
      'orderType=sell' +
      '&' +
      'fiatType=USD' +
      '&' +
      'fiatAmount=500' +
      '&' +
      'coinType=ADA' +
      '&' +
      'coinAmount=800' +
      '&' +
      'blockchain=ADA' +
      '&' +
      'walletAddress=addr1q9v8dvht2mv847gwarl7r4p49yzys8r7zlep7c8t2hqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquvupf' +
      '&' +
      'access_token=FAKE_TOKEN'

    const api = {
      getBaseUrl: jest.fn(() => Promise.resolve(baseUrl)),
    } as unknown as Exchange.Api

    const manager = exchangeManagerMaker({api})

    const url = await manager.referralLink.create({
      providerId: 'banxa',
      queries: {
        orderType: 'sell',
        fiatType: 'USD',
        fiatAmount: 500,
        coinType: 'ADA',
        coinAmount: 800,
        blockchain: 'ADA',
        walletAddress:
          'addr1q9v8dvht2mv847gwarl7r4p49yzys8r7zlep7c8t2hqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquvupf',
      },
    })

    expect(url.toString()).toBe(fullUrl)
  })

  test('should generate a correct referral link with all parameters with access token without pathname', async () => {
    const origin = 'https://checkout.banxa.com'
    const baseUrl = `${origin}/?&access_token=FAKE_TOKEN`
    const fullUrl =
      `${origin}/?` +
      'orderType=sell' +
      '&' +
      'fiatType=USD' +
      '&' +
      'fiatAmount=500' +
      '&' +
      'coinType=ADA' +
      '&' +
      'coinAmount=800' +
      '&' +
      'blockchain=ADA' +
      '&' +
      'walletAddress=addr1q9v8dvht2mv847gwarl7r4p49yzys8r7zlep7c8t2hqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquvupf' +
      '&' +
      'access_token=FAKE_TOKEN'

    const api = {
      getBaseUrl: jest.fn(() => Promise.resolve(baseUrl)),
    } as unknown as Exchange.Api

    const manager = exchangeManagerMaker({api})

    const url = await manager.referralLink.create({
      providerId: 'banxa',
      queries: {
        orderType: 'sell',
        fiatType: 'USD',
        fiatAmount: 500,
        coinType: 'ADA',
        coinAmount: 800,
        blockchain: 'ADA',
        walletAddress:
          'addr1q9v8dvht2mv847gwarl7r4p49yzys8r7zlep7c8t2hqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquvupf',
      },
    })

    expect(url.toString()).toBe(fullUrl)
  })

  test('should generate a correct referral link with all parameters without access token and without pathname', async () => {
    const baseUrl = 'https://checkout.banxa.com/?'
    const fullUrl =
      baseUrl +
      'orderType=sell' +
      '&' +
      'fiatType=USD' +
      '&' +
      'fiatAmount=500' +
      '&' +
      'coinType=ADA' +
      '&' +
      'coinAmount=800' +
      '&' +
      'blockchain=ADA' +
      '&' +
      'walletAddress=addr1q9v8dvht2mv847gwarl7r4p49yzys8r7zlep7c8t2hqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquvupf'

    const api = {
      getBaseUrl: jest.fn(() => Promise.resolve(baseUrl)),
    } as unknown as Exchange.Api

    const manager = exchangeManagerMaker({api})

    const url = await manager.referralLink.create({
      providerId: 'banxa',
      queries: {
        orderType: 'sell',
        fiatType: 'USD',
        fiatAmount: 500,
        coinType: 'ADA',
        coinAmount: 800,
        blockchain: 'ADA',
        walletAddress:
          'addr1q9v8dvht2mv847gwarl7r4p49yzys8r7zlep7c8t2hqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquvupf',
      },
    })

    expect(url.toString()).toBe(fullUrl)
  })

  test('should generate a correct referral link with mandatory parameters only', async () => {
    const baseUrl = 'https://checkout.banxa.com/?'
    const fullUrl =
      baseUrl +
      'orderType=sell' +
      '&' +
      'fiatType=USD' +
      '&' +
      'coinType=ADA' +
      '&' +
      'walletAddress=addr1q9v8dvht2mv847gwarl7r4p49yzys8r7zlep7c8t2hqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquvupf'

    const api = {
      getBaseUrl: jest.fn(() => Promise.resolve(baseUrl)),
    } as unknown as Exchange.Api

    const manager = exchangeManagerMaker({api})

    const url = await manager.referralLink.create({
      providerId: 'banxa',
      queries: {
        orderType: 'sell',
        fiatType: 'USD',
        coinType: 'ADA',
        walletAddress:
          'addr1q9v8dvht2mv847gwarl7r4p49yzys8r7zlep7c8t2hqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquvupf',
      },
    })

    expect(url.toString()).toBe(fullUrl)
  })

  test('should not include undefined optional parameters in the referral link', async () => {
    const baseUrl = 'https://checkout.banxa.com/?'

    const api = {
      getBaseUrl: jest.fn(() => Promise.resolve(baseUrl)),
    } as unknown as Exchange.Api

    const manager = exchangeManagerMaker({api})

    const url = await manager.referralLink.create({
      providerId: 'banxa',
      queries: {
        orderType: 'sell',
        fiatType: 'USD',
        coinType: 'ADA',
        walletAddress:
          'addr1q9v8dvht2mv847gwarl7r4p49yzys8r7zlep7c8t2hqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquvupf',
      },
    })

    const urlString = url.toString()
    expect(urlString).not.toContain('sellMode')
    expect(urlString).not.toContain('fiatAmount')
    expect(urlString).not.toContain('coinAmount')
    expect(urlString).not.toContain('blockchain')
    expect(urlString).not.toContain('walletAddressTag')
  })

  test('should throw an BanxaValidationError when schema is invalid', async () => {
    const baseUrl = 'https://checkout.banxa.com/?'

    const api = {
      getBaseUrl: jest.fn(() => Promise.resolve(baseUrl)),
    } as unknown as Exchange.Api

    const manager = exchangeManagerMaker({api})

    try {
      await manager.referralLink.create({
        providerId: 'banxa',
        queries: {
          // @ts-ignore
          fiatType: 'ABC', // Invalid fiatType
          coinType: 'ADA',
          walletAddress:
            'addr1q9v8dvht2mv847gwarl7r4p49yzys8r7zlep7c8t2hqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquvupf',
        },
      })

      fail('it should crash before')
    } catch (e) {
      expect(e).toBeInstanceOf(Exchange.Errors.Validation)
    }
  })

  test('should throw an error when ADA walletAddress is not a possible Cardano address', async () => {
    const baseUrl = 'https://checkout.banxa.com/?'

    const api = {
      getBaseUrl: jest.fn(() => Promise.resolve(baseUrl)),
    } as unknown as Exchange.Api

    const manager = exchangeManagerMaker({api})

    try {
      await manager.referralLink.create({
        providerId: 'banxa',
        // @ts-ignore
        queries: {
          fiatType: 'USD',
          coinType: 'ADA',
          walletAddress: 'invalid-cardano-address',
        },
      })

      fail('it should crash before')
    } catch (e) {
      expect(e).toBeInstanceOf(Exchange.Errors.Validation)
    }
  })
})

describe('provider', () => {
  it('should get the suggested providers', () => {
    const baseUrl = 'https://checkout.banxa.com/?'

    const api = {
      getBaseUrl: jest.fn(() => Promise.resolve(baseUrl)),
    } as unknown as Exchange.Api

    const manager = exchangeManagerMaker({api})

    const suggested = manager.provider.suggested.byOrderType()

    expect(suggested.sell).toBe('encryptus')
    expect(suggested.buy).toBe('banxa')
  })

  it('should list the buy providers', async () => {
    const api = {
      getProviders: jest.fn(() => Promise.resolve(providers)),
    } as unknown as Exchange.Api

    const manager = exchangeManagerMaker({api})

    const list = await manager.provider.list.byOrderType('buy')

    expect(list).toEqual([[providers.banxa?.id, providers.banxa]])
  })

  it('should list the sell providers', async () => {
    const api = {
      getProviders: jest.fn(() => Promise.resolve(providers)),
    } as unknown as Exchange.Api

    const manager = exchangeManagerMaker({api})

    const list = await manager.provider.list.byOrderType('sell')

    expect(list).toEqual([[providers.encryptus?.id, providers.encryptus]])
  })
})

export const providers: Readonly<Record<string, Exchange.Provider>> = freeze(
  {
    banxa: {
      id: 'banxa',
      name: 'Banxa',
      logo: 'RFU',
      supportedOrders: {
        buy: {
          fee: 2,
          min: 100000000,
        },
      },
      supportUrl: 'https://support.banxa.com/',
    },
    encryptus: {
      id: 'encryptus',
      name: 'Encryptus',
      logo: 'RFU',
      supportedOrders: {
        sell: {
          fee: 2.5,
          min: 1000000,
        },
      },
      supportUrl: 'https://support.encryptus.com/',
    },
  },
  true,
)
