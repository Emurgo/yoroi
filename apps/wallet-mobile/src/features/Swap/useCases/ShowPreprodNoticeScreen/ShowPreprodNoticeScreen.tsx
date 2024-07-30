import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text} from 'react-native'

import {SafeArea} from '../../../../components/SafeArea'
import {PreprodNoticeScreenLogo} from '../../common/Illustrations/PreprodNoticeScreenLogo'

export const ShowPreprodNoticeScreen = () => {
  const {styles} = useStyles()

  return (
    <SafeArea style={styles.container}>
      <PreprodNoticeScreenLogo />

      <Text style={styles.title}>Swap is not available on testnet</Text>

      <Text style={styles.text}>Switch to mainnet if you want to use the feature and swap real tokens</Text>
    </SafeArea>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      backgroundColor: color.bg_color_high,
      ...atoms.p_lg,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: color.gray_c900,
      ...atoms.heading_3_medium,
      ...atoms.px_sm,
      textAlign: 'center',
    },
    text: {
      color: color.text_gray_medium,
      ...atoms.body_1_lg_regular,
      textAlign: 'center',
      maxWidth: 300,
    },
  })
  return {styles}
}
