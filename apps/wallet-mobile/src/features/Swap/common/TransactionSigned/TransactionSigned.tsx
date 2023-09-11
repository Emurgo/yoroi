import React from 'react'
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native'

import TxSuccess from '../../../../assets/img//transaction-success.png'
import {Button} from '../../../../components'
import {useNavigateTo} from '../navigation'
import {useStrings} from '../strings'

export const TransactionSigned = () => {
  const strings = useStrings()
  const navigate = useNavigateTo()

  return (
    <View style={styles.container}>
      <View>
        <Image source={TxSuccess} />
      </View>

      <Text style={styles.title}>{strings.transactionSigned}</Text>

      <Text style={styles.text}>{strings.transactionDisplay}</Text>

      <TouchableOpacity style={styles.button}>
        <Text>{strings.seeOnExplorer}</Text>
      </TouchableOpacity>

      <Button shelleyTheme title={strings.goToOrders} onPress={() => navigate.startSwap()} />
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
  title: {
    fontWeight: '500',
    fontSize: 20,
    paddingBottom: 4,
  },
  text: {
    color: '#6B7384',
    fontSize: 16,
  },
  button: {
    paddingVertical: 16,
  },
})
