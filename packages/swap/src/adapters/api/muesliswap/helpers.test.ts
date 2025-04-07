import {getAllowedDexes, resolveDexes} from './helpers'
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

describe('resolveDexes', () => {
  it('should return the protocol if provided', () => {
    const result = resolveDexes({protocol: Dex.Minswap_v1})
    expect(result).toEqual([Dex.Minswap_v1])
  })

  it('should return allowed DEXes if protocol is not provided', () => {
    const result = resolveDexes({blockedProtocols: [Dex.Minswap_stable]})
    const expected = allDexes.filter((dex) => dex !== Dex.Minswap_stable)
    expect(result).toEqual(expected)
  })

  it('should return all DEXes if no protocol and no blocked protocols are provided', () => {
    const result = resolveDexes({})
    expect(result).toEqual(allDexes)
  })

  it('should return an empty array if all DEXes are blocked and no protocol is provided', () => {
    const result = resolveDexes({blockedProtocols: allDexes})
    expect(result).toEqual([])
  })
})
