import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, Spacer, Text} from '../../../../../components'
import {useBlockGoBack, useWalletNavigation} from '../../../../../navigation'
import {COLORS} from '../../../../../theme'
import {useStrings} from '../../../../Send/common/strings'
import {SubmittedTxImage} from './SubmittedTxImage'

export const SubmittedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const {resetToTxHistory} = useWalletNavigation()

  return (
    <View style={styles.container}>
      <SubmittedTxImage />

      <Text style={styles.title}>{strings.submittedTxTitle}</Text>

      <Text style={styles.text}>{strings.submittedTxText}</Text>

      <Spacer height={22} />

      <Button onPress={resetToTxHistory} title={strings.submittedTxButton} style={styles.button} shelleyTheme />
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
    maxWidth: 300,
  },
  button: {
    paddingHorizontal: 20,
  },
})
