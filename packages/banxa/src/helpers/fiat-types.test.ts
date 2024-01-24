import {banxaIsFiatType, BanxaFiatType} from './fiat-types'

describe('banxaIsFiatType', () => {
  it('should return true for valid fiat types', () => {
    const validFiatTypes: BanxaFiatType[] = ['USD', 'EUR']

    validFiatTypes.forEach((fiatType) => {
      expect(banxaIsFiatType(fiatType)).toBe(true)
    })
  })

  it('should return false for invalid fiat types', () => {
    const invalidFiatTypes = ['GBP', 'JPY', 'AUD', '', undefined, null, 123]

    invalidFiatTypes.forEach((fiatType) => {
      expect(banxaIsFiatType(fiatType)).toBe(false)
    })
  })
})
