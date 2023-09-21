import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, Spacer, Text} from '../../../../../components'
import {useBlockGoBack} from '../../../../../navigation'
import {COLORS} from '../../../../../theme'
import {useNavigateTo} from '../../../common/navigation'
import {useStrings} from '../../../common/strings'
import {SubmittedTxImage} from './SubmittedTxImage'

export const SubmittedTxScreen = () => {
  useBlockGoBack()
  const strings = useStrings()
  const navigate = useNavigateTo()

  return (
    <View style={styles.container}>
      <SubmittedTxImage />

      <Text style={styles.title}>{strings.transactionSigned}</Text>

      <Text style={styles.text}>{strings.transactionDisplay}</Text>

      <Spacer height={22} />

      <Button onPress={() => navigate.swapOpenOrders()} title={strings.goToOrders} style={styles.button} shelleyTheme />
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
    fontWeight: '600',
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
