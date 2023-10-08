import {mocks} from '../mocks'
import {getBestPoolCalculation} from './getBestPoolCalculation'

describe('getBestPoolCalculation', () => {
  it('should return the best pool calculation', () => {
    const bestCalculation = getBestPoolCalculation(
      mocks.mockedOrderCalculations1,
    )

    expect(bestCalculation?.pool.poolId).toBe('3')
  })
})
