import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {Button} from '../../../../../components/Button/Button'
import {useModal} from '../../../../../components/Modal/ModalContext'
import {Space} from '../../../../../components/Space/Space'
import {useStrings} from '../../../common/useStrings'
import {ErrorLogo} from '../../../illustrations/ErrorLogo'

export const ErrorScreen = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {closeModal} = useModal()

  return (
    <View style={styles.root}>
      <ErrorLogo />

      <Space height="lg" />

      <Text style={styles.text}>{strings.linkError}</Text>

      <Space height="lg" />

      <Button testID="rampOnOffErrorCloseButton" title={strings.close} style={styles.button} onPress={closeModal} />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()

  const styles = StyleSheet.create({
    root: {
      ...atoms.flex_1,
      ...atoms.align_center,
      ...atoms.justify_center,
    },
    text: {
      ...atoms.heading_3_medium,
      ...atoms.text_center,
      color: color.text_gray_max,
      maxWidth: 340,
    },
    button: {
      ...atoms.px_lg,
    },
  })

  return {styles} as const
}
