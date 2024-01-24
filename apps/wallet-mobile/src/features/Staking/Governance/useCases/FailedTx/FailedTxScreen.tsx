import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, Spacer, Text} from '../../../../../components'
import {useNavigateTo, useStrings} from '../../common'
import {BrokenImage} from '../../illustrations'

export const FailedTxScreen = () => {
  const strings = useStrings()
  const navigate = useNavigateTo()

  const handleOnTryAgain = () => {
    navigate.home()
  }

  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <BrokenImage />

        <Spacer height={16} />

        <Text style={styles.title}>{strings.transactionFailed}</Text>

        <Spacer height={4} />

        <Text style={styles.description}>{strings.transactionFailedDescription}</Text>

        <Spacer height={16} />

        <Button title={strings.tryAgain} textStyles={styles.button} shelleyTheme onPress={handleOnTryAgain} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
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
    color: '#000000',
    fontWeight: '500',
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Rubik-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7384',
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 15,
  },
})
