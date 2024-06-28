import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet} from 'react-native'

import {Button, Spacer, Text} from '../../../../../components'
import {SafeArea} from '../../../../../components/SafeArea'
import {useStrings} from '../../../../Send/common/strings'
import {FailedTxImage} from './FailedTxImage'

export const FailedTxScreen = () => {
  const strings = useStrings()
  const styles = useStyles()
  const navigation = useNavigation()

  return (
    <SafeArea style={styles.container}>
      <FailedTxImage />

      <Text style={styles.title}>{strings.failedTxTitle}</Text>

      <Text style={styles.text}>{strings.failedTxText}</Text>

      <Spacer height={22} />

      <Button onPress={navigation.goBack} title={strings.failedTxButton} style={styles.button} shelleyTheme />
    </SafeArea>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    title: {
      color: color.gray_cmax,
      ...atoms.heading_3_medium,
      padding: 4,
      textAlign: 'center',
    },
    text: {
      color: color.gray_c600,
      ...atoms.body_2_md_regular,
      textAlign: 'center',
      maxWidth: 330,
    },
    button: {
      paddingHorizontal: 20,
    },
  })
  return styles
}
