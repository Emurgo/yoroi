import {Exchange} from '@yoroi/types'
import {isOrderType} from './order-types'

describe('isOrderType', () => {
  it('should return true for valid order types', () => {
    const validOrderTypes: Exchange.OrderType[] = ['buy', 'sell']

    validOrderTypes.forEach((orderType) => {
      expect(isOrderType(orderType)).toBe(true)
    })
  })

  it('should return false for invalid order types', () => {
    const invalidOrderTypes = [
      'deposit',
      'withdraw',
      'exchange',
      '',
      undefined,
      null,
      123,
    ]

    invalidOrderTypes.forEach((orderType) => {
      expect(isOrderType(orderType)).toBe(false)
    })
  })
})
