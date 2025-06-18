import {ThemedPalette, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {StyleSheet, View, ViewStyle} from 'react-native'

import {Received} from '../Icon/Received'
import {Send} from '../Icon/Send'
import {Transaction} from '../Icon/Transaction'
import {MultiParty} from './MultiParty'
import {IconProps} from './type'

export const Direction = ({
  transactionDirection,
  size = defaultSize,
  containerStyle,
}: IconProps & {
  transactionDirection: 'SENT' | 'RECEIVED' | 'SELF' | 'MULTI'
  containerStyle?: ViewStyle
}) => {
  const {palette: p} = useTheme()

  const iconStyles = styleMap(p)[transactionDirection]
  const IconComponent = iconMap[transactionDirection]

  return (
    <View
      style={[
        styles.icon,
        {backgroundColor: iconStyles?.background},
        containerStyle,
      ]}
    >
      <IconComponent color={iconStyles?.icon} size={iconStyles.size ?? size} />
    </View>
  )
}

const defaultSize = 36

const iconMap: Record<
  'SENT' | 'RECEIVED' | 'SELF' | 'MULTI',
  ({size, color}: {size: number; color: string}) => React.ReactNode
> = {
  SENT: Send,
  RECEIVED: Received,
  SELF: Transaction,
  MULTI: MultiParty,
}

export const styleMap: (
  color: ThemedPalette,
) => Record<
  ThemeStatus,
  {background: string; icon: string; text: string; size?: number}
> = (color) => ({
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
