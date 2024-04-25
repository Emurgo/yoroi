import {balanceFormatter} from './balance-formatter'
import {tokenBalanceMocks} from '../adapters/token-balance.mocks'

describe('balanceFormatter', () => {
  it('it works', () => {
    let formattedBalance = balanceFormatter({
      template: '{{symbol}} {{value}} {{ticker}}',
    })(tokenBalanceMocks.primaryETH)

    expect(formattedBalance).toBe('Ξ 0.000000000001000000 ETH')

    formattedBalance = balanceFormatter({
      template: '{{ticker}} {{value}} {{symbol}}',
    })(tokenBalanceMocks.primaryETH)

    expect(formattedBalance).toBe('ETH 0.000000000001000000 Ξ')

    formattedBalance = balanceFormatter()(tokenBalanceMocks.primaryETH)

    expect(formattedBalance).toBe('0.000000000001000000')

    formattedBalance = balanceFormatter({dropTraillingZeros: true})({
      info: {
        ...tokenBalanceMocks.primaryETH.info,
        decimals: 10,
      },
      balance: 123_456_000_000n,
    })

    expect(formattedBalance).toBe('12.3456')

    formattedBalance = balanceFormatter({dropTraillingZeros: true})({
      info: {
        ...tokenBalanceMocks.primaryETH.info,
        decimals: 10,
      },
      balance: 123_456_000_100n,
    })

    expect(formattedBalance).toBe('12.34560001')

    formattedBalance = balanceFormatter()({
      info: {
        ...tokenBalanceMocks.primaryETH.info,
        decimals: 10,
      },
      balance: 123_456_000_000n,
    })

    expect(formattedBalance).toBe('12.3456000000')

    formattedBalance = balanceFormatter()({
      info: {
        ...tokenBalanceMocks.primaryETH.info,
        decimals: 10,
      },
      balance: 123_456_789_123_456n,
    })

    expect(formattedBalance).toBe('12,345.6789123456')

    formattedBalance = balanceFormatter({dropTraillingZeros: true})({
      info: {
        ...tokenBalanceMocks.primaryETH.info,
        decimals: 0,
      },
      balance: 10n,
    })

    expect(formattedBalance).toBe('10')

    formattedBalance = balanceFormatter({dropTraillingZeros: true})({
      info: {
        ...tokenBalanceMocks.primaryETH.info,
        decimals: 1,
      },
      balance: 0n,
    })

    expect(formattedBalance).toBe('0.0')
  })
})
