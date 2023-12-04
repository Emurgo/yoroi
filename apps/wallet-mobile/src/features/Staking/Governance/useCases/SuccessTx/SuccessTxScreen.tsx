import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Button, Spacer, Text} from '../../../../../components'
import {useNavigateTo, useStrings} from '../../common'
import {SuccessTxImage} from './SuccessTxImage'

export const SuccessTxScreen = () => {
  const strings = useStrings()
  const navigate = useNavigateTo()

  const onPress = () => {
    navigate.home()
  }

  return (
    <View style={styles.root}>
      <Spacer fill />

      <View style={styles.center}>
        <SuccessTxImage />

        <Spacer height={24} />

        <Text style={styles.title}>{strings.thankYouForParticipating}</Text>

        <Spacer height={16} />

        <Text style={styles.description}>{strings.thisTransactionCanTakeAWhile}</Text>

        <Spacer height={16} />

        <Text style={styles.description}>{strings.participationBenefits}</Text>
      </View>

      <Spacer fill />

      <Button title={strings.goToGovernance} shelleyTheme onPress={onPress} />

      <Spacer height={24} />
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
