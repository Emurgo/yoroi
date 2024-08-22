import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, Text} from '../../../../../components'
import {SafeArea} from '../../../../../components/SafeArea'
import {Space} from '../../../../../components/Space/Space'
import {useNavigateTo, useStrings} from '../../common'
import {NoFunds} from '../../illustrations'

export const NoFundsScreen = () => {
  const strings = useStrings()
  const navigate = useNavigateTo()
  const styles = useStyles()

  const handleOnTryAgain = () => {
    navigate.home()
  }

  return (
    <SafeArea style={styles.root}>
      <View style={styles.center}>
        <NoFunds />

        <Space height="lg" />

        <Text style={styles.title}>{strings.noFunds}</Text>

        <Space height="lg" />

        <Button title={strings.tryAgain} textStyles={styles.button} shelleyTheme onPress={handleOnTryAgain} />
      </View>
    </SafeArea>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.bg_color_high,
      ...atoms.flex_1,
      ...atoms.p_xl,
    },
    center: {
      ...atoms.flex_1,
      ...atoms.align_center,
      ...atoms.justify_center,
    },
    title: {
      ...atoms.heading_3_medium,
      color: color.gray_cmax,
    },
    button: {
      paddingHorizontal: 24,
      paddingVertical: 15,
    },
  })

  return styles
}
