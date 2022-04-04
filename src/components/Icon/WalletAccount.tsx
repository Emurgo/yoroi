import React from 'react'
import {StyleSheet, View, ViewStyle} from 'react-native'
import Blockies from 'react-native-blockies-svg'
import tinycolor from 'tinycolor2'

import {COLORS as APP_COLORS} from '../../theme'

const mkcolor = (primary, secondary, spots) => ({primary, secondary, spots})
const COLORS = [
  mkcolor('#E1F2FF', '#17D1AA', '#A80B32'),
  mkcolor('#E1F2FF', '#FA5380', '#0833B2'),
  mkcolor('#E1F2FF', '#F06EF5', '#0804F7'),
  mkcolor('#E1F2FF', '#EBB687', '#852D62'),
  mkcolor('#E1F2FF', '#F59F9A', '#085F48'),
]

const saturation = (color, factor = 0) => {
  if (factor < -100 || factor > 100) {
    throw Error('Expected factor between -100 and 100 (default 0)')
  }
  let tcol = tinycolor(color)
  for (let i = 0; i < Math.abs(factor); i++) {
    tcol = factor < 0 ? tcol.desaturate() : tcol.saturate()
  }
  return tcol.toHexString()
}

const styles = StyleSheet.create({
  defaultStyle: {
    borderColor: APP_COLORS.LIGHT_GRAY,
    borderRadius: 6,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    overflow: 'hidden',
  },
})

type Props = {
  iconSeed: string
  scalePx?: number
  saturationFactor?: number
  style?: ViewStyle
}

export const WalletAccount = ({iconSeed, scalePx = 5, saturationFactor = 0, style}: Props) => {
  const colorIdx = Buffer.from(iconSeed, 'hex')[0] % COLORS.length
  const color = COLORS[colorIdx]
  return (
    <View style={[styles.defaultStyle, style]}>
      <Blockies
        seed={iconSeed}
        size={7}
        scale={scalePx != null ? scalePx : 5}
        bgcolor={saturation(color.primary, saturationFactor)}
        color={saturation(color.secondary, saturationFactor)}
        spotcolor={saturation(color.spots, saturationFactor)}
      />
    </View>
  )
}
