import React from 'react'
import {StyleSheet, View} from 'react-native'
import {useNavigateTo, useStrings} from '../../common'
import {Button, Spacer} from '../../../../../components'
import {Text} from '../../../../../components'
import {FailedTxImage} from './FailedTxImage'

export const FailedTxScreen = () => {
  const strings = useStrings()
  const navigate = useNavigateTo()

  const onPress = () => {
    navigate.home()
  }

  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <FailedTxImage />

        <Spacer height={16} />

        <Text style={styles.title}>{strings.transactionFailed}</Text>

        <Spacer height={4} />

        <Text style={styles.description}>{strings.transactionFailedDescription}</Text>

        <Spacer height={16} />

        <Button title={strings.tryAgain} shelleyTheme onPress={onPress} />
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
})
