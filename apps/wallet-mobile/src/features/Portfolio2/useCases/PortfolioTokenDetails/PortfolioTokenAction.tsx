/* eslint-disable react-native/no-raw-text */
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Icon} from '../../../../components'

export const PortfolioTokenAction = () => {
  const {styles, colors} = useStyles()

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']}>
      <View style={styles.root}>
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
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_col,
      backgroundColor: color.white_static,
      paddingBottom: 6,
      minHeight: 79,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      borderTopWidth: 1,
      borderTopColor: color.gray_c200,
    },
    container: {
      ...atoms.flex_1,
      ...atoms.flex_row,
      ...atoms.gap_lg,
      ...atoms.p_lg,
    },
  })

  const colors = {
    background: color.mobile_bg_blur,
    white: color.white_static,
    primary: color.primary_c500,
  } as const

  return {styles, colors} as const
}
