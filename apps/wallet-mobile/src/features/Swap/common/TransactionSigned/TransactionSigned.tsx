import React from 'react'
import {Image, StyleSheet, Text, View} from 'react-native'

import TxSuccess from '../../../../assets/img//transaction-success.png'
import {Button} from '../../../../components'
import {COLORS} from '../../../../theme'

interface ButtonGroupProps {}

export const TransactionSigned = () => {
  return (
    <View style={styles.container}>
      <View style={styles.imageWrap} testID="notDelegatedInfo">
        <Image source={TxSuccess} />
      </View>

      <Text>Transaction signed</Text>

      <Text>Your transactions will be displayed both in the list of transaction and Open swap orders</Text>

      <Button title="GO TO Orders" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  imageWrap: {},
  buttonWrapper: {
    paddingRight: 8,
  },
  button: {},
  label: {
    color: COLORS.BLACK,
  },
})
