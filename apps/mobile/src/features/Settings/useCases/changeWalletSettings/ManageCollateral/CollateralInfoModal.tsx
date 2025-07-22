import {atoms as a, useTheme} from '@yoroi/theme'
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
  const {palette: p} = useTheme()
  const styles = StyleSheet.create({
    modal: {
      ...a.flex_1,
      ...a.px_lg,
      ...a.align_center,
    },
    modalText: {
      ...a.text_center,
      ...a.body_1_lg_regular,
      color: p.text_gray_medium,
    },
  })

  const colors = {
    iconColor: p.gray_900,
  }

  return {styles, colors} as const
}
