import React from 'react'

import {Icon} from '../../../../components'
import {COLORS} from '../../../../theme'

// TODO add icons for each pool and change it depending on name
/* eslint-disable @typescript-eslint/no-unused-vars */
export const PoolIcon = ({providerId, size}: {providerId: string; size: number}) => {
  return <Icon.YoroiNightly size={size} color={COLORS.SHELLEY_BLUE} />
}
