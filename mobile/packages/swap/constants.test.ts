import {Swap} from '@yoroi/types'

import {dexUrls} from './constants'

describe('swap constants', () => {
  it('should have correct dexUrls for all DEX types', () => {
    expect(dexUrls[Swap.Dex.Minswap]).toBe('https://minswap.org')
    expect(dexUrls[Swap.Dex.Muesliswap]).toBe('https://muesliswap.com')
    expect(dexUrls[Swap.Dex.Spectrum]).toBe('https://app.spectrum.fi/cardano')
    expect(dexUrls[Swap.Dex.Sundaeswap]).toBe('https://sundae.fi')
    expect(dexUrls[Swap.Dex.Teddy]).toBe('http://app.teddyswap.org')
    expect(dexUrls[Swap.Dex.Vyfi]).toBe('https://app.vyfi.io')
    expect(dexUrls[Swap.Dex.Wingriders]).toBe('https://www.wingriders.com')
    expect(dexUrls[Swap.Dex.Splash]).toBe('https://www.splash.trade')
    expect(dexUrls[Swap.Dex.Cswap]).toBe('https://www.cswap.info')
    expect(dexUrls[Swap.Dex.Unsupported]).toBe('')
  })

  it('should be frozen', () => {
    expect(Object.isFrozen(dexUrls)).toBe(true)
  })
})
