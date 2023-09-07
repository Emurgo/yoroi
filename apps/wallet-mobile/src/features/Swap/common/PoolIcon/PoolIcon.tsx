import React, {FunctionComponent, ReactNode} from 'react'

import {Icon} from '../../../../components'
import {Pool} from '@yoroi/openswap'

export const PoolIcon = ({providerId, size}: {providerId: Pool['provider']; size: number}) => {
  console.log('providerId', providerId)
  const IconVariant = icons[providerId] || Icon.MuesliSwap
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
}
