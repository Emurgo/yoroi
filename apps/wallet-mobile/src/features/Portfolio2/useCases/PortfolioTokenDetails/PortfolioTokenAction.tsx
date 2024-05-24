/* eslint-disable react-native/no-raw-text */
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, Icon} from '../../../../components'

export const PortfolioTokenAction = () => {
  const {styles, colors} = useStyles()

  return (
    <View style={styles.root}>
      <View style={styles.divider} />

      <View style={styles.container}>
        <Button
          block
          shelleyTheme
          outlineOnLight
          title="SEND"
          startContent={<Icon.Send color={colors.primary} size={24} />}
        />

        <Button block shelleyTheme title="SWAP" startContent={<Icon.Swap color={colors.white} size={24} />} />
      </View>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.flex_col,
      backgroundColor: color.mobile_bg_blur,
      paddingBottom: 34,
      minHeight: 79,
    },
    container: {
      ...atoms.flex_1,
      ...atoms.flex_row,
      ...atoms.gap_lg,
      ...atoms.p_lg,
    },
    divider: {
      height: 1,
      backgroundColor: color.gray_c200,
    },
  })

  const colors = {
    white: color.white_static,
    primary: color.primary_c500,
  } as const

  return {styles, colors} as const
}
