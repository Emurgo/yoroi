import React from 'react'
import {StyleSheet, View} from 'react-native'

import {TransactionInfo} from '../legacy/HistoryTransaction'
import {Icon} from './Icon'

const ICON = {
  SENT: Icon.Sent,
  RECEIVED: Icon.Received,
  SELF: Icon.Transaction,
  MULTI: Icon.Transaction,
}

const SIZE = 36
const COLORS = {
  PENDING: {
    background: '#F0F3F5',
    icon: '#6B7384',
  },
  NORMAL: {
    background: '#EAEDF2',
    icon: '#6B7384',
  },
  DIRECT_CREDIT: {
    background: 'rgba(23, 209, 170, 0.1)',
    icon: '#17D1AA',
  },
}
type Status = keyof typeof COLORS

type Props = {
  transaction: TransactionInfo
}

export const TxIcon = ({transaction}: Props) => {
  const {direction, assurance, status} = transaction
  const IconComponent = ICON[direction]
  const isPending = assurance === 'PENDING' || status === 'PENDING'
  const isReceived = direction === 'RECEIVED'
  const isDirectCredit = isReceived
  const theme: Status = isPending ? 'PENDING' : isDirectCredit ? 'DIRECT_CREDIT' : 'NORMAL'
  const color = COLORS[theme]

  return (
    <View style={[styles.container, {backgroundColor: color.background}]}>
      <IconComponent color={color.icon} width={SIZE} height={SIZE} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    height: SIZE,
    width: SIZE,
    borderRadius: SIZE / 2,
  },
})
