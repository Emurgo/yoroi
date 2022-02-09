import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, StyleSheet, Text, View} from 'react-native'

import image from '../../assets/img/no_transactions.png'
import {Spacer} from '../../components/Spacer'

export const EmptyHistory = () => {
  const strings = useStrings()

  return (
    <View style={styles.empty}>
      <Image style={styles.image} source={image} />
      <Spacer height={20} />
      <Text style={styles.emptyText}>{strings.noTransactions}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  empty: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 122,
  },
  emptyText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 'bold',
    color: '#242838',
    width: '55%',
    textAlign: 'center',
  },
  image: {
    height: 100,
    width: 131,
  },
})

const messages = defineMessages({
  noTransactions: {
    id: 'components.txhistory.txhistory.noTransactions',
    defaultMessage: '!!!No transactions to show yet',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    noTransactions: intl.formatMessage(messages.noTransactions),
  }
}
