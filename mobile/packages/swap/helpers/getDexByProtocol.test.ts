import {Swap} from '@yoroi/types'

import {getDexByProtocol} from './getDexByProtocol'

describe('getDexByProtocol', () => {
  it('should return Minswap for Minswap protocols', () => {
    expect(getDexByProtocol(Swap.Protocol.Minswap_v1)).toBe(Swap.Dex.Minswap)
    expect(getDexByProtocol(Swap.Protocol.Minswap_v2)).toBe(Swap.Dex.Minswap)
    expect(getDexByProtocol(Swap.Protocol.Minswap_stable)).toBe(
      Swap.Dex.Minswap,
    )
  })

  it('should return Muesliswap for Muesliswap protocols', () => {
    expect(getDexByProtocol(Swap.Protocol.Muesliswap_v2)).toBe(
      Swap.Dex.Muesliswap,
    )
    expect(getDexByProtocol(Swap.Protocol.Muesliswap_clp)).toBe(
      Swap.Dex.Muesliswap,
    )
  })

  it('should return Spectrum for Spectrum protocol', () => {
    expect(getDexByProtocol(Swap.Protocol.Spectrum_v1)).toBe(Swap.Dex.Spectrum)
  })

  it('should return Sundaeswap for Sundaeswap protocols', () => {
    expect(getDexByProtocol(Swap.Protocol.Sundaeswap_v1)).toBe(
      Swap.Dex.Sundaeswap,
    )
    expect(getDexByProtocol(Swap.Protocol.Sundaeswap_v3)).toBe(
      Swap.Dex.Sundaeswap,
    )
  })

  it('should return Teddy for Teddy protocol', () => {
    expect(getDexByProtocol(Swap.Protocol.Teddy_v1)).toBe(Swap.Dex.Teddy)
  })

  it('should return Vyfi for Vyfi protocol', () => {
    expect(getDexByProtocol(Swap.Protocol.Vyfi_v1)).toBe(Swap.Dex.Vyfi)
  })

  it('should return Wingriders for Wingriders protocols', () => {
    expect(getDexByProtocol(Swap.Protocol.Wingriders_v1)).toBe(
      Swap.Dex.Wingriders,
    )
    expect(getDexByProtocol(Swap.Protocol.Wingriders_v2)).toBe(
      Swap.Dex.Wingriders,
    )
  })

  it('should return Splash for Splash protocol', () => {
    expect(getDexByProtocol(Swap.Protocol.Splash_v1)).toBe(Swap.Dex.Splash)
  })

  it('should return Cswap for Cswap protocol', () => {
    expect(getDexByProtocol(Swap.Protocol.Cswap)).toBe(Swap.Dex.Cswap)
  })

  it('should return Unsupported for Unsupported protocol', () => {
    expect(getDexByProtocol(Swap.Protocol.Unsupported)).toBe(
      Swap.Dex.Unsupported,
    )
  })
})
