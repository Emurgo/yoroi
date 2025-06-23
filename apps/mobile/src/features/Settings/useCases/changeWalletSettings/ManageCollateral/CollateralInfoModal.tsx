import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {InfoModalIllustration} from './illustrations/InfoModalIllustration'
import {useStrings} from './strings'

export const CollateralInfoModal = () => {
  const {styles} = useStyles()
  const strings = useStrings()

  return (
    <View style={styles.modal}>
      <InfoModalIllustration />

      <Text style={styles.modalText}>{strings.collateralInfoModalText}</Text>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    modal: {
      ...atoms.flex_1,
      ...atoms.px_lg,
      ...atoms.align_center,
    },
    modalText: {
      ...atoms.text_center,
      ...atoms.body_1_lg_regular,
      color: color.text_gray_medium,
    },
  })

  const colors = {
    iconColor: color.gray_900,
  }

  return {styles, colors} as const
}
