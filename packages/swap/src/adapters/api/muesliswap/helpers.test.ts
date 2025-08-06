import {getAllowedDexes} from './helpers'
import {Dex} from './types'

const allDexes: Array<Dex> = [
  Dex.Muesliswap_v2,
  Dex.Muesliswap_clp,
  Dex.Minswap_v1,
  Dex.Minswap_v2,
  Dex.Minswap_stable,
  Dex.Spectrum_v1,
  Dex.Teddy_v1,
  Dex.Wingriders_v1,
  Dex.Wingriders_v2,
  Dex.Vyfi_v1,
  Dex.Sundaeswap_v1,
  Dex.Sundaeswap_v3,
]

describe('getAllowedDexes', () => {
  it('should return all DEXes except blocked ones/unsupported', () => {
    const result = getAllowedDexes({blocked: [Dex.Minswap_stable]})
    const expected = allDexes.filter((dex) => dex !== Dex.Minswap_stable)
    expect(result).toEqual(expected)
  })

  it('should return all DEXes if none are blocked', () => {
    const result = getAllowedDexes({blocked: []})
    expect(result).toEqual(allDexes)
  })

  it('should return all DEXes if no arg is passed', () => {
    const result = getAllowedDexes()
    expect(result).toEqual(allDexes)
  })

  it('should return an empty array if all DEXes are blocked', () => {
    const result = getAllowedDexes({blocked: allDexes})
    expect(result).toEqual([])
  })
})
