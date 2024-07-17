import {amountFormatter} from './amount-formatter'
import {tokenBalanceMocks} from '../adapters/token-balance.mocks'
import {Numbers} from '@yoroi/types'

describe('amountFormatter', () => {
  const format: Partial<Numbers.Locale> = {
    decimalSeparator: `'`,
    groupSeparator: ' ',
    fractionGroupSeparator: ' ',
    groupSize: 3,
    fractionGroupSize: 3,
  }
  it.each`
    options                                          | input                                                                                       | expected
    ${{template: '{{symbol}} {{value}} {{ticker}}'}} | ${tokenBalanceMocks.primaryETH}                                                             | ${'Ξ 0.000000000001000000 ETH'}
    ${{template: '{{ticker}} {{value}} {{symbol}}'}} | ${tokenBalanceMocks.primaryETH}                                                             | ${'ETH 0.000000000001000000 Ξ'}
    ${undefined}                                     | ${tokenBalanceMocks.primaryETH}                                                             | ${'0.000000000001000000'}
    ${{dropTraillingZeros: true}}                    | ${{info: {...tokenBalanceMocks.primaryETH.info, decimals: 10}, quantity: 123456000000n}}    | ${'12.3456'}
    ${{dropTraillingZeros: true}}                    | ${{info: {...tokenBalanceMocks.primaryETH.info, decimals: 10}, quantity: 123456000100n}}    | ${'12.34560001'}
    ${{}}                                            | ${{info: {...tokenBalanceMocks.primaryETH.info, decimals: 10}, quantity: 123456000000n}}    | ${'12.3456000000'}
    ${{}}                                            | ${{info: {...tokenBalanceMocks.primaryETH.info, decimals: 10}, quantity: 123456789123456n}} | ${'12,345.6789123456'}
    ${{format}}                                      | ${{info: {...tokenBalanceMocks.primaryETH.info, decimals: 2}, quantity: 123456789n}}        | ${`1 234 567'89`}
    ${{dropTraillingZeros: true}}                    | ${{info: {...tokenBalanceMocks.primaryETH.info, decimals: 0}, quantity: 10n}}               | ${'10'}
    ${{dropTraillingZeros: true}}                    | ${{info: {...tokenBalanceMocks.primaryETH.info, decimals: 6}, quantity: 1_000_000n}}        | ${'1'}
    ${{}}                                            | ${{info: {...tokenBalanceMocks.primaryETH.info, decimals: 6}, quantity: 1_000_000n}}        | ${'1.000000'}
    ${{dropTraillingZeros: true}}                    | ${{info: {...tokenBalanceMocks.primaryETH.info, decimals: 1}, quantity: 0n}}                | ${'0'}
  `('formats correctly with options $options', ({options, input, expected}) => {
    const formattedBalance = amountFormatter(options)(input)
    expect(formattedBalance).toBe(expected)
  })
})
