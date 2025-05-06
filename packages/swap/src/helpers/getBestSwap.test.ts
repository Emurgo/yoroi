import {api} from '../adapters/api/dexhunter/api.mocks'
import {getBestSwap} from './getBestSwap'

describe('getBestSwap', () => {
  it('should return the best if no better, price = 0', () => {
    const best = api.results.estimate
    const estimate = api.results.estimate
    expect(getBestSwap(0)(best, estimate)).toBe(estimate)
  })

  it('should return the estimate when better, price = 0', () => {
    const best = api.results.estimate
    const estimate = {
      ...api.results.estimate,
      totalOutput: api.results.estimate.totalOutput + 1,
    }
    expect(getBestSwap(0)(best, estimate)).toBe(estimate)
  })

  it('should return the best if no better, price = 1', () => {
    const best = api.results.estimate
    const estimate = api.results.estimate
    expect(getBestSwap(1)(best, estimate)).toBe(estimate)
  })

  it('should return the estimate when better, price = 1', () => {
    const best = api.results.estimate
    const estimate = {
      ...api.results.estimate,
      totalOutput: api.results.estimate.totalOutput + 1,
    }
    expect(getBestSwap(1)(best, estimate)).toBe(estimate)
  })
})
