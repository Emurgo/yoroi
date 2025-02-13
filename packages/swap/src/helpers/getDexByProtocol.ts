import {Swap} from '@yoroi/types'

export function getDexByProtocol(protocol: Swap.Protocol): Swap.Dex {
  switch (protocol) {
    case Swap.Protocol.Minswap_v1:
    case Swap.Protocol.Minswap_v2:
    case Swap.Protocol.Minswap_stable:
      return Swap.Dex.Minswap

    case Swap.Protocol.Muesliswap_v2:
    case Swap.Protocol.Muesliswap_clp:
      return Swap.Dex.Muesliswap

    case Swap.Protocol.Spectrum_v1:
      return Swap.Dex.Spectrum

    case Swap.Protocol.Sundaeswap_v1:
    case Swap.Protocol.Sundaeswap_v3:
      return Swap.Dex.Sundaeswap

    case Swap.Protocol.Teddy_v1:
      return Swap.Dex.Teddy

    case Swap.Protocol.Vyfi_v1:
      return Swap.Dex.Vyfi

    case Swap.Protocol.Wingriders_v1:
    case Swap.Protocol.Wingriders_v2:
      return Swap.Dex.Wingriders

    case Swap.Protocol.Splash_v1:
      return Swap.Dex.Splash

    case Swap.Protocol.Unsupported:
      return Swap.Dex.Unsupported
  }
}
