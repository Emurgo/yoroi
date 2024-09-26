import {ThemedPalette, useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {TransactionDirection, TransactionInfo} from '../../yoroi-wallets/types/other'
import {Received} from '../Icon/Received'
import {Send} from '../Icon/Send'
import {Transaction} from '../Icon/Transaction'
import {IconProps} from './type'
import {MultiParty} from './MultiParty'

export const Direction = ({transaction, size = defaultSize}: IconProps & {transaction: TransactionInfo}) => {
  const {color} = useTheme()
  const {direction} = transaction

  const iconStyles = styleMap(color)[direction]
  const IconComponent = iconMap[direction]

  return (
    <View style={[styles.icon, {backgroundColor: iconStyles?.background}]}>
      <IconComponent color={iconStyles?.icon} size={iconStyles.size ?? size} />
    </View>
  )
}

const defaultSize = 36

const iconMap: Record<TransactionDirection, ({size, color}: {size: number; color: string}) => JSX.Element> = {
  SENT: Send,
  RECEIVED: Received,
  SELF: Transaction,
  MULTI: MultiParty,
}

export const styleMap: (
  color: ThemedPalette,
) => Record<ThemeStatus, {background: string; icon: string; text: string; size?: number}> = (color) => ({
  SELF: {
    text: color.gray_900,
    background: color.gray_100,
    icon: color.gray_900,
  },
  SENT: {
    text: color.el_primary_medium,
    background: color.primary_100,
    icon: color.el_primary_medium,
  },
  RECEIVED: {
    text: color.secondary_600,
    background: color.secondary_100,
    icon: color.secondary_600,
  },
  MULTI: {
    text: color.gray_900,
    background: color.gray_100,
    icon: color.gray_900,
    size: 50,
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
