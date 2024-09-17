import {Swap} from '@yoroi/types'
import React, {FunctionComponent} from 'react'

import {Icon} from '../../../../components/Icon'

type Props = {
  providerId: Swap.PoolProvider
  size: number
}

export const PoolIcon = ({providerId, size}: Props) => {
  const IconVariant = icons[providerId] ?? Icon.Swap
  return <IconVariant size={size} />
}

const icons: Record<Swap.PoolProvider, FunctionComponent<{size?: number}>> = {
  muesliswap: Icon.MuesliSwap,
  muesliswap_v1: Icon.MuesliSwap,
  muesliswap_v2: Icon.MuesliSwap,
  muesliswap_v3: Icon.MuesliSwap,
  muesliswap_v4: Icon.MuesliSwap,
  minswap: Icon.MinSwap,
  sundaeswap: Icon.SundaeSwap,
  wingriders: Icon.WingRiders,
  vyfi: Icon.VyfiSwap,
  spectrum: Icon.SpectrumSwap,
} as const
