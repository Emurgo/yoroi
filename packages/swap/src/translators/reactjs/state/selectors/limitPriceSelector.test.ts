import {limitPriceSelector} from './limitPriceSelector' // adjust the import path
import {SwapState} from '../state' // adjust the import path if needed
import {mockSwapStateDefault} from '../state.mocks'

describe('limitPriceSelector', () => {
  it('should return the limit price when type is limit', () => {
    const orderData: SwapState['orderData'] = {
      ...mockSwapStateDefault.orderData,
      type: 'limit',
      limitPrice: '100',
    }

    const selected = limitPriceSelector(orderData)
    expect(selected).toEqual(orderData.limitPrice)
  })

  it('should return undefined when type is not limit', () => {
    const orderData: SwapState['orderData'] = {
      ...mockSwapStateDefault.orderData,
      type: 'market',
      limitPrice: '100',
    }

    const selected = limitPriceSelector(orderData)
    expect(selected).toBeUndefined()
  })
})
