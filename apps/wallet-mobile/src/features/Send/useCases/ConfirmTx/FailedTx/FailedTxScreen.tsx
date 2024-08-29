import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet} from 'react-native'

import {Button, Text} from '../../../../../components'
import {SafeArea} from '../../../../../components/SafeArea'
import {Space} from '../../../../../components/Space/Space'
import {useBlockGoBack} from '../../../../../kernel/navigation'
import {useNavigateTo} from '../../../common/navigation'
import {useStrings} from '../../../common/strings'
import {FailedTxImage} from './FailedTxImage'

export const FailedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const styles = useStyles()
  const navigateTo = useNavigateTo()

  return (
    <SafeArea style={styles.container}>
      <FailedTxImage />

      <Text style={styles.title}>{strings.failedTxTitle}</Text>

      <Text style={styles.text}>{strings.failedTxText}</Text>

      <Space height="xl" />

      <Button
        onPress={navigateTo.startTxAfterReset}
        title={strings.failedTxButton}
        style={styles.button}
        shelleyTheme
      />
    </SafeArea>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      backgroundColor: color.bg_color_max,
      ...atoms.flex_1,
      ...atoms.align_center,
      ...atoms.justify_center,
      ...atoms.p_lg,
    },
    title: {
      color: color.gray_max,
      ...atoms.heading_3_medium,
      ...atoms.px_xs,
      ...atoms.text_center,
    },
    text: {
      color: color.gray_600,
      ...atoms.body_2_md_regular,
      ...atoms.text_center,
      maxWidth: 330,
    },
    button: {
      ...atoms.px_lg,
    },
  })
  return styles
}
