import {amountFormatter} from './amount-formatter'
import {tokenBalanceMocks} from '../adapters/token-balance.mocks'

describe('amountFormatter', () => {
  it('it works', () => {
    let formattedBalance = amountFormatter({
      template: '{{symbol}} {{value}} {{ticker}}',
    })(tokenBalanceMocks.primaryETH)

    expect(formattedBalance).toBe('Ξ 0.000000000001000000 ETH')

    formattedBalance = amountFormatter({
      template: '{{ticker}} {{value}} {{symbol}}',
    })(tokenBalanceMocks.primaryETH)

    expect(formattedBalance).toBe('ETH 0.000000000001000000 Ξ')

    formattedBalance = amountFormatter()(tokenBalanceMocks.primaryETH)

    expect(formattedBalance).toBe('0.000000000001000000')

    formattedBalance = amountFormatter({dropTraillingZeros: true})({
      info: {
        ...tokenBalanceMocks.primaryETH.info,
        decimals: 10,
      },
      quantity: 123_456_000_000n,
    })

    expect(formattedBalance).toBe('12.3456')

    formattedBalance = amountFormatter({dropTraillingZeros: true})({
      info: {
        ...tokenBalanceMocks.primaryETH.info,
        decimals: 10,
      },
      quantity: 123_456_000_100n,
    })

    expect(formattedBalance).toBe('12.34560001')

    formattedBalance = amountFormatter()({
      info: {
        ...tokenBalanceMocks.primaryETH.info,
        decimals: 10,
      },
      quantity: 123_456_000_000n,
    })

    expect(formattedBalance).toBe('12.3456000000')

    formattedBalance = amountFormatter()({
      info: {
        ...tokenBalanceMocks.primaryETH.info,
        decimals: 10,
      },
      quantity: 123_456_789_123_456n,
    })

    expect(formattedBalance).toBe('12,345.6789123456')

    formattedBalance = amountFormatter({dropTraillingZeros: true})({
      info: {
        ...tokenBalanceMocks.primaryETH.info,
        decimals: 0,
      },
      quantity: 10n,
    })

    expect(formattedBalance).toBe('10')

    formattedBalance = amountFormatter({dropTraillingZeros: true})({
      info: {
        ...tokenBalanceMocks.primaryETH.info,
        decimals: 1,
      },
      quantity: 0n,
    })

    expect(formattedBalance).toBe('0.0')
  })
})
