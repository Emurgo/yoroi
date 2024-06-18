import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, Icon} from '../../../../components'
import {useStrings} from '../../common/useStrings'

export const PortfolioTokenAction = () => {
  const {styles, colors} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <Button
          block
          shelleyTheme
          outlineOnLight
          title={strings.send.toLocaleUpperCase()}
          startContent={<Icon.Send color={colors.primary} size={24} />}
        />

        <Button
          block
          shelleyTheme
          title={strings.swap.toLocaleUpperCase()}
          startContent={<Icon.Swap color={colors.white} size={24} />}
        />
      </View>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.gray_cmin,
      borderTopWidth: 1,
      borderTopColor: color.gray_c200,
    },
    container: {
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
