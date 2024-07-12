import {ThemedPalette, useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {TransactionDirection, TransactionInfo} from '../../yoroi-wallets/types'
import {Received} from '../Icon/Received'
import {Send} from '../Icon/Send'
import {Transaction} from '../Icon/Transaction'

type Props = {
  transaction: TransactionInfo
  size?: number
}

export const Direction = ({transaction, size = defaultSize}: Props) => {
  const {color} = useTheme()
  const {direction} = transaction

  const iconColors = colorsMap(color)[direction]
  const IconComponent = iconMap[direction]

  return (
    <View style={[styles.icon, {backgroundColor: iconColors?.background}]}>
      <IconComponent color={iconColors?.icon} size={size} />
    </View>
  )
}

const defaultSize = 36

const iconMap: Record<TransactionDirection, ({size, color}: {size: number; color: string}) => JSX.Element> = {
  SENT: Send,
  RECEIVED: Received,
  SELF: Transaction,
  MULTI: Transaction,
}

export const colorsMap: (
  color: ThemedPalette,
) => Record<ThemeStatus, {background: string; icon: string; text: string}> = (color) => ({
  SELF: {
    text: color.gray_c900,
    background: color.gray_c100,
    icon: color.gray_c900,
  },
  SENT: {
    text: color.primary_c600,
    background: color.primary_c100,
    icon: color.primary_c500,
  },
  RECEIVED: {
    text: color.secondary_c600,
    background: color.secondary_c100,
    icon: color.secondary_c600,
  },
  MULTI: {
    text: color.gray_c900,
    background: color.gray_c100,
    icon: color.gray_c900,
  },
})

type ThemeStatus = 'SENT' | 'RECEIVED' | 'SELF' | 'MULTI'

const styles = StyleSheet.create({
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 40,
    borderRadius: 20,
  },
})
