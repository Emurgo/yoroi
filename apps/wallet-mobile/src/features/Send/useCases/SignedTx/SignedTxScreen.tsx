import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, Spacer, Text} from '../../../../components'
import {useWalletNavigation} from '../../../../navigation'
import {COLORS} from '../../../../theme'
import {useStrings} from '../../common/strings'
import {SignedTxImage} from './SignedTxImage'

export const SignedTxScreen = () => {
  const strings = useStrings()
  const {resetToTxHistory} = useWalletNavigation()

  return (
    <View style={styles.container}>
      <SignedTxImage />

      <Text style={styles.title}>{strings.signedTxTitle}</Text>

      <Text style={styles.text}>{strings.signedTxText}</Text>

      <Spacer height={22} />

      <Button onPress={resetToTxHistory} title={strings.signedTxButton} style={styles.button} shelleyTheme />
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
