import {Exchange} from '@yoroi/types'
import {isCoinType} from './coin-types'

describe('isCoinType', () => {
  it('should return true for valid coin types', () => {
    const validCoinTypes: Exchange.Coin[] = ['ADA']

    validCoinTypes.forEach((coinType) => {
      expect(isCoinType(coinType)).toBe(true)
    })
  })

  it('should return false for invalid coin types', () => {
    const invalidCoinTypes = ['XRP', 'DOGE', '', undefined, null, 123]

    invalidCoinTypes.forEach((coinType) => {
      expect(isCoinType(coinType)).toBe(false)
    })
  })
})
