import {Exchange} from '@yoroi/types'
import {isFiatType} from './fiat-types'

describe('isFiatType', () => {
  it('should return true for valid fiat types', () => {
    const validFiatTypes: Exchange.Fiat[] = ['USD', 'EUR']

    validFiatTypes.forEach((fiatType) => {
      expect(isFiatType(fiatType)).toBe(true)
    })
  })

  it('should return false for invalid fiat types', () => {
    const invalidFiatTypes = ['GBP', 'JPY', 'AUD', '', undefined, null, 123]

    invalidFiatTypes.forEach((fiatType) => {
      expect(isFiatType(fiatType)).toBe(false)
    })
  })
})
