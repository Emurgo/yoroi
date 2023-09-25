import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, Spacer, Text} from '../../../../../components'
import {COLORS} from '../../../../../theme'
import {useStrings} from '../../../../Send/common/strings'
import {FailedTxImage} from './FailedTxImage'

export const FailedTxScreen = () => {
  const strings = useStrings()
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    color: COLORS.BLACK,
    fontWeight: 'bold',
    fontSize: 20,
    padding: 4,
    textAlign: 'center',
    lineHeight: 30,
  },
  text: {
    color: COLORS.TEXT_INPUT,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 330,
  },
  button: {
    paddingHorizontal: 20,
  },
})
