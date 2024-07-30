import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Space} from '../../../../../components/Space/Space'
import {useStrings} from '../../../common/useStrings'
import {PreprodNoticeIllustration} from '../../../illustrations/PreprodNoticeIllustration'

export const ShowPreprodNotice = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.container}>
      <Space height="_2xl" />

      <PreprodNoticeIllustration />

      <Space height="lg" />

      <Text style={styles.title}>{strings.createOrderPreprodNoticeTitle}</Text>

      <Text style={styles.text}>{strings.createOrderPreprodNoticeText}</Text>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
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
