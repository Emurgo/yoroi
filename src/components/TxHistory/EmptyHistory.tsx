import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, StyleSheet, Text, View} from 'react-native'

import image from '../../assets/img/no_transactions.png'
import Spacer from '../Spacer/Spacer'

// NOTE: layout is following inVision spec
// https://projects.invisionapp.com/d/main#/console/21500065/458210499/preview#project_console
const styles = StyleSheet.create({
  empty: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingTop: '20%',
  },
  emptyText: {
    color: '#242838',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 24,
    maxWidth: '45%',
    textAlign: 'center',
  },
  image: {
    height: 100,
    width: 131,
  },
})

const EmptyHistory = () => {
  const strings = useStrings()

  return (
    <View style={styles.empty}>
      <Image style={styles.image} source={image} />

      <Spacer height={16} />

      <Text style={styles.emptyText}>{strings.empty}</Text>
    </View>
  )
}

const messages = defineMessages({
  noTransactions: {
    id: 'components.txhistory.txhistory.noTransactions',
    defaultMessage: '!!!No transactions to show yet',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    empty: intl.formatMessage(messages.noTransactions),
  }
}

export default EmptyHistory
