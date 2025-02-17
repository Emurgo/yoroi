import {api} from '../adapters/api/dexhunter/api.mocks'
import {getBestSwap} from './getBestSwap'

describe('getBestSwap', () => {
  it('should return the best if no better', () => {
    const best = api.results.estimate
    const estimate = api.results.estimate
    expect(getBestSwap(best, estimate)).toBe(estimate)
  })

  it('should return the estimate when better', () => {
    const best = api.results.estimate
    const estimate = {
      ...api.results.estimate,
      totalOutput: api.results.estimate.totalOutput + 1,
    }
    expect(getBestSwap(best, estimate)).toBe(estimate)
  })
})
