import {Exchange} from '@yoroi/types'
import {createReferralUrl} from './createReferralUrl'

describe('createReferralUrl', () => {
  test('should generate a correct referral link with all parameters', () => {
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

    const url = createReferralUrl(baseUrl, {
      orderType: 'sell',
      fiatType: 'USD',
      fiatAmount: 500,
      coinType: 'ADA',
      coinAmount: 800,
      blockchain: 'ADA',
      walletAddress:
        'addr1q9v8dvht2mv847gwarl7r4p49yzys8r7zlep7c8t2hqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquvupf',
    })

    expect(url.toString()).toBe(fullUrl)
  })

  test('should generate a correct referral link with mandatory parameters only', () => {
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

    const url = createReferralUrl(baseUrl, {
      orderType: 'sell',
      fiatType: 'USD',
      coinType: 'ADA',
      walletAddress:
        'addr1q9v8dvht2mv847gwarl7r4p49yzys8r7zlep7c8t2hqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquvupf',
    })

    expect(url.toString()).toBe(fullUrl)
  })

  test('should not include undefined optional parameters in the referral link', () => {
    const baseUrl = 'https://checkout.banxa.com/?'
    const url = createReferralUrl(baseUrl, {
      orderType: 'sell',
      fiatType: 'USD',
      coinType: 'ADA',
      walletAddress:
        'addr1q9v8dvht2mv847gwarl7r4p49yzys8r7zlep7c8t2hqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquvupf',
    })
    const urlString = url.toString()
    expect(urlString).not.toContain('sellMode')
    expect(urlString).not.toContain('fiatAmount')
    expect(urlString).not.toContain('coinAmount')
    expect(urlString).not.toContain('blockchain')
    expect(urlString).not.toContain('walletAddressTag')
  })

  test('should throw an BanxaValidationError when schema is invalid', () => {
    const baseUrl = 'https://checkout.banxa.com/?'

    const invalidQueries = {
      fiatType: 'ABC', // Invalid fiatType
      coinType: 'ADA',
      walletAddress:
        'addr1q9v8dvht2mv847gwarl7r4p49yzys8r7zlep7c8t2hqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquvupf',
    }

    expect(() => {
      createReferralUrl(baseUrl, invalidQueries as any)
    }).toThrow(Exchange.Errors.Validation)
  })

  test('should throw an error when ADA walletAddress is not a possible Cardano address', () => {
    const baseUrl = 'https://checkout.banxa.com/?'

    const invalidQueries = {
      fiatType: 'USD',
      coinType: 'ADA',
      walletAddress: 'invalid-cardano-address',
    }

    expect(() => {
      createReferralUrl(baseUrl, invalidQueries as any)
    }).toThrow(Exchange.Errors.Validation)
  })
})
