// @flow

import React from 'react'
import {StyleSheet} from 'react-native'
import tinycolor from 'tinycolor2'

import Blockie from './Blockie'

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet'

const mkcolor = (primary, secondary, spots) => ({primary, secondary, spots})
const COLORS = [
  mkcolor('#E1F2FF', '#17D1AA', '#A80B32'),
  mkcolor('#E1F2FF', '#FA5380', '#0833B2'),
  mkcolor('#E1F2FF', '#F06EF5', '#0804F7'),
  mkcolor('#E1F2FF', '#EBB687', '#852D62'),
  mkcolor('#E1F2FF', '#F59F9A', '#085F48'),
]

const saturation = (color, factor: number = 0) => {
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
    height: 32,
    width: 32,
  },
})

type Props = {|
  +iconSeed: string,
  +scalePx?: number,
  +saturationFactor?: number,
  +style?: ViewStyleProp,
|}

const WalletAccountIcon = ({
  iconSeed,
  scalePx = 5,
  saturationFactor = 0,
  style,
}: Props) => {
  const colorIdx = Buffer.from(iconSeed, 'hex')[0] % COLORS.length
  const color = COLORS[colorIdx]
  return (
    <Blockie
      style={[styles.defaultStyle, style]}
      blockies={iconSeed}
      size={7}
      scale={scalePx != null ? scalePx : 5}
      bgColor={saturation(color.primary, saturationFactor)}
      color={saturation(color.secondary, saturationFactor)}
      spotColor={saturation(color.spots, saturationFactor)}
    />
  )
}

export default WalletAccountIcon
