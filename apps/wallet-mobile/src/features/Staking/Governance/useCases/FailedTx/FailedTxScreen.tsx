import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, Spacer, Text} from '../../../../../components'
import {SafeArea} from '../../../../../components/SafeArea'
import {useNavigateTo, useStrings} from '../../common'
import {BrokenImage} from '../../illustrations'

export const FailedTxScreen = () => {
  const strings = useStrings()
  const navigate = useNavigateTo()
  const styles = useStyles()

  const handleOnTryAgain = () => {
    navigate.home()
  }

  return (
    <SafeArea style={styles.root}>
      <View style={styles.center}>
        <BrokenImage />

        <Spacer height={16} />

        <Text style={styles.title}>{strings.transactionFailed}</Text>

        <Spacer height={4} />

        <Text style={styles.description}>{strings.transactionFailedDescription}</Text>

        <Spacer height={16} />

        <Button title={strings.tryAgain} textStyles={styles.button} shelleyTheme onPress={handleOnTryAgain} />
      </View>
    </SafeArea>
  )
}

const useStyles = () => {
  const {color} = useTheme()

  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.bg_color_high,
      flex: 1,
      padding: 16,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontFamily: 'Rubik-Medium',
      fontSize: 20,
      lineHeight: 30,
      color: color.gray_cmax,
      fontWeight: '500',
      textAlign: 'center',
    },
    description: {
      fontFamily: 'Rubik-Regular',
      fontSize: 16,
      lineHeight: 24,
      color: color.gray_c600,
      textAlign: 'center',
    },
    button: {
      paddingHorizontal: 24,
      paddingVertical: 15,
    },
  })

  return styles
}
