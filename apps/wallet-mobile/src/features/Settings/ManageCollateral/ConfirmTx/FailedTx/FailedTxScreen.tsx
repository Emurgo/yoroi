import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, Spacer, Text} from '../../../../../components'
import {useStrings} from '../../../../Send/common/strings'
import {FailedTxImage} from './FailedTxImage'

export const FailedTxScreen = () => {
  const strings = useStrings()
  const styles = useStyles()
  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      <FailedTxImage />

      <Text style={styles.title}>{strings.failedTxTitle}</Text>

      <Text style={styles.text}>{strings.failedTxText}</Text>

      <Spacer height={22} />

      <Button onPress={navigation.goBack} title={strings.failedTxButton} style={styles.button} shelleyTheme />
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    title: {
      color: color.gray.max,
      ...typography['heading-3-medium'],
      padding: 4,
      textAlign: 'center',
    },
    text: {
      color: color.gray[600],
      ...typography['body-2-m-regular'],
      textAlign: 'center',
      maxWidth: 330,
    },
    button: {
      paddingHorizontal: 20,
    },
  })
  return styles
}
