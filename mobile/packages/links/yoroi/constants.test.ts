import {
  configYoroiBrowserLaunchDappUrl,
  configYoroiExchangeOrderShowCreateResult,
  configYoroiTransferRequestAda,
  configYoroiTransferRequestAdaWithLink,
  supportedPrefixes,
} from './constants'

describe('yoroi constants', () => {
  it('should have correct configYoroiTransferRequestAda', () => {
    expect(configYoroiTransferRequestAda.authority).toBe('yoroi-wallet.com')
    expect(configYoroiTransferRequestAda.version).toBe('w1')
    expect(configYoroiTransferRequestAda.path).toBe('transfer/request/ada')
  })

  it('should have correct configYoroiTransferRequestAdaWithLink', () => {
    expect(configYoroiTransferRequestAdaWithLink.authority).toBe(
      'yoroi-wallet.com',
    )
    expect(configYoroiTransferRequestAdaWithLink.version).toBe('w1')
    expect(configYoroiTransferRequestAdaWithLink.path).toBe(
      'transfer/request/ada-with-link',
    )
  })

  it('should have correct configYoroiExchangeOrderShowCreateResult', () => {
    expect(configYoroiExchangeOrderShowCreateResult.authority).toBe(
      'yoroi-wallet.com',
    )
    expect(configYoroiExchangeOrderShowCreateResult.version).toBe('w1')
    expect(configYoroiExchangeOrderShowCreateResult.path).toBe(
      'exchange/order/show-create-result',
    )
  })

  it('should have correct configYoroiBrowserLaunchDappUrl', () => {
    expect(configYoroiBrowserLaunchDappUrl.authority).toBe('yoroi-wallet.com')
    expect(configYoroiBrowserLaunchDappUrl.version).toBe('w1')
    expect(configYoroiBrowserLaunchDappUrl.path).toBe('browser/launch')
  })

  it('should have correct supportedPrefixes', () => {
    expect(supportedPrefixes).toEqual([
      'yoroi://',
      'https://yoroi-wallet.com/w1',
    ])
  })
})
