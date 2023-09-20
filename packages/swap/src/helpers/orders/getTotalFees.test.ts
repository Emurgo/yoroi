import {mockNumberLocale} from '../../adapters/intl/number-locale.mocks'
import {asQuantity} from '../../utils/asQuantity'
import {getTotalFees} from './getTotalFees'

describe('getTotalFees', () => {
  it('should calculate the total fees correctly', () => {
    const batcherFee = '2000000'
    const providerFee = '1000'
    const decimals = 6

    const result = getTotalFees(
      batcherFee,
      providerFee,
      decimals,
      mockNumberLocale,
    )
    expect(result).toBe('2.001')
  })

  it('should handle zero fees', () => {
    const batcherFee = '0'
    const providerFee = '0'
    const decimals = 6

    const result = getTotalFees(
      batcherFee,
      providerFee,
      decimals,
      mockNumberLocale,
    )
    expect(result).toBe('0')
  })

  it('should handle different decimal separators', () => {
    const batcherFee = '2500000'
    const providerFee = '23222'
    const decimals = 6

    const result = getTotalFees(
      asQuantity(batcherFee),
      asQuantity(providerFee),
      decimals,
      mockNumberLocale,
    )
    expect(result).toBe('2.523222')
  })
})
