import {Exchange} from '@yoroi/types'
import {exchangeModuleMaker} from './module'

describe('exchangeModuleMaker', () => {
  test('should generate a correct referral link with all parameters', () => {
    const module = exchangeModuleMaker({
      partner: 'checkout',
      isProduction: true,
    })
    const fullUrl =
      'https://checkout.banxa.com/?' +
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

    const url = module.createReferralUrl('banxa', {
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
    const module = exchangeModuleMaker({
      partner: 'checkout',
      isProduction: true,
    })
    const fullUrl =
      'https://checkout.banxa.com/?' +
      'fiatType=USD' +
      '&' +
      'coinType=ADA' +
      '&' +
      'walletAddress=addr1q9v8dvht2mv847gwarl7r4p49yzys8r7zlep7c8t2hqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquvupf'

    const url = module.createReferralUrl('banxa', {
      fiatType: 'USD',
      coinType: 'ADA',
      walletAddress:
        'addr1q9v8dvht2mv847gwarl7r4p49yzys8r7zlep7c8t2hqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquvupf',
    })

    expect(url.toString()).toBe(fullUrl)
  })

  test('should generate a correct sandbox referral link', () => {
    const module = exchangeModuleMaker({
      partner: 'checkout',
      isProduction: false,
    })
    const fullUrl =
      'https://checkout.banxa-sandbox.com/?' +
      'fiatType=USD' +
      '&' +
      'coinType=ADA' +
      '&' +
      'walletAddress=addr1q9v8dvht2mv847gwarl7r4p49yzys8r7zlep7c8t2hqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquvupf'

    const url = module.createReferralUrl('banxa', {
      fiatType: 'USD',
      coinType: 'ADA',
      walletAddress:
        'addr1q9v8dvht2mv847gwarl7r4p49yzys8r7zlep7c8t2hqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquvupf',
    })

    expect(url.toString()).toBe(fullUrl)
  })

  test('should not include undefined optional parameters in the referral link', () => {
    const module = exchangeModuleMaker({
      partner: 'checkout',
      isProduction: true,
    })
    const url = module.createReferralUrl('banxa', {
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
    const module = exchangeModuleMaker({
      partner: 'checkout',
      isProduction: true,
    })

    const invalidQueries = {
      fiatType: 'ABC', // Invalid fiatType
      coinType: 'ADA',
      walletAddress:
        'addr1q9v8dvht2mv847gwarl7r4p49yzys8r7zlep7c8t2hqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqquvupf',
    }

    expect(() => {
      module.createReferralUrl('banxa', invalidQueries as any)
    }).toThrow(Exchange.Errors.ValidationError)
  })

  test('should throw an error when ADA walletAddress is not a possible Cardano address', () => {
    const module = exchangeModuleMaker({
      partner: 'checkout',
      isProduction: true,
    })

    const invalidQueries = {
      fiatType: 'USD',
      coinType: 'ADA',
      walletAddress: 'invalid-cardano-address',
    }

    expect(() => {
      module.createReferralUrl('banxa', invalidQueries as any)
    }).toThrow(Exchange.Errors.ValidationError)
  })

  test('should throw BanxaUnknownError if is not a BanxaValidationError', () => {
    const module = exchangeModuleMaker(
      {
        partner: 'checkout',
        isProduction: true,
      },
      {zodErrorTranslator: () => {}},
    )

    const invalidQueries = {
      fiatType: 'XXX',
      coinType: 'XXX',
      walletAddress: 'XXX',
    }

    expect(() => {
      module.createReferralUrl('banxa', invalidQueries as any)
    }).toThrow(Exchange.Errors.UnknownError)
  })
})
