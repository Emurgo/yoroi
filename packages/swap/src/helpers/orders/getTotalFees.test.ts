import {asQuantity} from '../../utils/asQuantity'
import {getTotalFees} from './getTotalFees'

const mocknumberLocale = {
  decimalSeparator: '.',
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0,
  groupSeparator: ',',
  groupSize: 3,
  prefix: '',
  secondaryGroupSize: 0,
  suffix: '',
}

describe('getTotalFees', () => {
  it('should calculate the total fees correctly', () => {
    const batcherFee = '100.123'
    const providerFee = '50.456'
    const decimals = 2

    const result = getTotalFees(
      batcherFee,
      providerFee,
      decimals,
      mocknumberLocale,
    )
    expect(result).toBe('150.58')
  })

  it('should handle zero fees', () => {
    const batcherFee = '0'
    const providerFee = '0'
    const decimals = 2

    const result = getTotalFees(
      batcherFee,
      providerFee,
      decimals,
      mocknumberLocale,
    )
    expect(result).toBe('0.00')
  })

  it('should handle different decimal separators', () => {
    const batcherFee = '100,123'
    const providerFee = '50,456'
    const decimals = 2

    const result = getTotalFees(
      asQuantity(batcherFee),
      asQuantity(providerFee),
      decimals,
      mocknumberLocale,
    )
    expect(result).toBe('150.58')
  })

  it('should handle different decimal places', () => {
    const batcherFee = '100.12345'
    const providerFee = '50.456789'
    const decimals = 4

    const result = getTotalFees(
      batcherFee,
      providerFee,
      decimals,
      mocknumberLocale,
    )
    expect(result).toBe('150.5802')
  })
})
