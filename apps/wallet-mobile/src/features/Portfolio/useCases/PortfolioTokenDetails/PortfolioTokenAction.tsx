import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, Icon} from '../../../../components'
import {useNavigateTo, usePortfolioTokenDetailParams} from '../../common/useNavigateTo'
import {useStrings} from '../../common/useStrings'

export const PortfolioTokenAction = () => {
  const {styles, colors} = useStyles()
  const strings = useStrings()
  const {id: tokenId} = usePortfolioTokenDetailParams()

  const navigateTo = useNavigateTo()

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <Button
          block
          shelleyTheme
          outlineOnLight
          title={strings.send.toLocaleUpperCase()}
          startContent={<Icon.Send color={colors.primary} size={24} />}
          onPress={() => navigateTo.send()}
        />

        <Button
          block
          shelleyTheme
          title={strings.swap.toLocaleUpperCase()}
          startContent={<Icon.Swap color={colors.white} size={24} />}
          onPress={() => navigateTo.swap(tokenId)}
        />
      </View>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.bg_color_high,
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
