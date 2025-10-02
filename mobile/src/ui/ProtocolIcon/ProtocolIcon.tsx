import {getDexByProtocol} from '@yoroi/swap'
import {Swap} from '@yoroi/types'

import * as React from 'react'
import {Image} from 'react-native'

import {Icon} from '~/ui/Icon'

type Props = {
  protocol: Swap.Protocol
  size: number
  fallbackImageUrl?: string
}

export const ProtocolIcon = ({protocol, size, fallbackImageUrl}: Props) => {
  const dex = getDexByProtocol(protocol)
  const IconVariant =
    icons[dex] === Icon.Swap
      ? (icons[protocol as Swap.Dex] ?? Icon.Swap)
      : icons[dex]

  if (IconVariant != null) return <IconVariant size={size} />

  if (fallbackImageUrl != null) {
    return (
      <Image
        source={{uri: fallbackImageUrl}}
        style={{width: size, height: size, borderRadius: size / 2}}
        resizeMode="contain"
      />
    )
  }

  const Unsupported = icons[Swap.Dex.Unsupported]
  return <Unsupported size={size} />
}

const icons: Record<Swap.Dex, React.FunctionComponent<{size?: number}>> = {
  [Swap.Dex.Muesliswap]: Icon.MuesliSwap,
  [Swap.Dex.Minswap]: Icon.MinSwap,
  [Swap.Dex.Spectrum]: Icon.SpectrumSwap,
  [Swap.Dex.Teddy]: Icon.Swap,
  [Swap.Dex.Wingriders]: Icon.WingRiders,
  [Swap.Dex.Vyfi]: Icon.VyfiSwap,
  [Swap.Dex.Sundaeswap]: Icon.SundaeSwap,
  [Swap.Dex.Splash]: Icon.Swap,
  [Swap.Dex.Cswap]: Icon.Cswap,
  [Swap.Dex.Unsupported]: Icon.Swap,
} as const
