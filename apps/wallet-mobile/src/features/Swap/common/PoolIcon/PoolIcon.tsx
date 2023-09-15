import {Pool} from '@yoroi/openswap'
import React, {FunctionComponent} from 'react'

import {Icon} from '../../../../components'

export const PoolIcon = ({providerId, size}: {providerId: Pool['provider']; size: number}) => {
  const IconVariant = icons[providerId] ?? Icon.Swap
  return <IconVariant size={size} />
}

const icons: Record<Pool['provider'], FunctionComponent<{size?: number}>> = {
  muesliswap_v1: Icon.MuesliSwap,
  muesliswap_v2: Icon.MuesliSwap,
  muesliswap_v3: Icon.MuesliSwap,
  muesliswap_v4: Icon.MuesliSwap,
  minswap: Icon.MinSwap,
  sundaeswap: Icon.SundaeSwap,
  wingriders: Icon.WingRiders,
  vyfi: Icon.VyfiSwap,
  spectrum: Icon.SpectrumSwap,
}
