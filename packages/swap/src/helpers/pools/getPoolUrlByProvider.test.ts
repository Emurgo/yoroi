import {getPoolUrlByProvider} from './getPoolUrlByProvider'

describe('getPoolUrlByProvider', () => {
  it('should return the pool when it exists', () => {
    expect(getPoolUrlByProvider('minswap')).toBe('https://minswap.org')
    expect(getPoolUrlByProvider('sundaeswap')).toBe('https://sundae.fi')
    expect(getPoolUrlByProvider('wingriders')).toBe(
      'https://www.wingriders.com',
    )
  })

  it('should return the default URL for an unknown provider', () => {
    expect(getPoolUrlByProvider('unknownProvider' as any)).toBe(
      'https://muesliswap.com',
    )
  })
})
