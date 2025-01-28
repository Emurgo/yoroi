import {Swap} from '@yoroi/types'
import * as React from 'react'

import {Icon} from '../../../../components/Icon'

type Props = {
  provider: Swap.Provider
  size: number
}

export const ProviderIcon = ({provider, size}: Props) => {
  const IconVariant = icons[provider] ?? Icon.Swap
  return <IconVariant size={size} />
}

const icons: Record<Swap.Provider, React.FunctionComponent<{size?: number}>> = {
  [Swap.Provider.Muesliswap_v2]: Icon.MuesliSwap,
  [Swap.Provider.Muesliswap_clp]: Icon.MuesliSwap,
  [Swap.Provider.Minswap_v1]: Icon.MinSwap,
  [Swap.Provider.Minswap_v2]: Icon.MinSwap,
  [Swap.Provider.Minswap_stable]: Icon.MinSwap,
  [Swap.Provider.Spectrum_v1]: Icon.SpectrumSwap,
  [Swap.Provider.Teddy_v1]: Icon.Swap,
  [Swap.Provider.Wingriders_v1]: Icon.WingRiders,
  [Swap.Provider.Wingriders_v2]: Icon.WingRiders,
  [Swap.Provider.Vyfi_v1]: Icon.VyfiSwap,
  [Swap.Provider.Sundaeswap_v1]: Icon.SundaeSwap,
  [Swap.Provider.Sundaeswap_v3]: Icon.SundaeSwap,
  [Swap.Provider.Splash_v1]: Icon.Swap,
} as const
