import React from 'react'
import {View} from 'react-native'

import {TransactionInfo} from '../../legacy/HistoryTransaction'
import {TransactionDirection} from '../../types'
import {Received} from '../Icon/Received'
import {Sent} from '../Icon/Sent'
import {Transaction} from '../Icon/Transaction'

type Props = {
  transaction: TransactionInfo
  size?: number
}

export const Direction = ({transaction, size = defaultSize}: Props) => {
  const {direction, assurance, status} = transaction
  const isPending = assurance === 'PENDING' || status === 'PENDING'

  const theme: ThemeStatus = isPending ? 'PENDING' : direction === 'RECEIVED' ? 'DIRECT_CREDIT' : 'NORMAL'
  const color = colorsMap[theme]

  const IconComponent = iconMap[direction]

  return (
    <View style={{display: 'flex', borderRadius: size / 2, backgroundColor: color?.background}}>
      <IconComponent color={color?.icon} width={size} height={size} />
    </View>
  )
}

const defaultSize = 36

const iconMap: Record<
  TransactionDirection,
  ({width, height, color}: {width: number; height: number; color: string}) => JSX.Element
> = {
  SENT: Sent,
  RECEIVED: Received,
  SELF: Transaction,
  MULTI: Transaction,
}

const colorsMap: Record<ThemeStatus, {background: string; icon: string}> = {
  PENDING: {
    background: '#DCE0E9',
    icon: '#6B7384',
  },
  NORMAL: {
    background: '#EDEFF3',
    icon: '#6B7384',
  },
  DIRECT_CREDIT: {
    background: 'rgba(23, 209, 170, 0.1)',
    icon: '#17D1AA',
  },
}

type ThemeStatus = 'PENDING' | 'NORMAL' | 'DIRECT_CREDIT'
