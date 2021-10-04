// @flow

import React, {memo} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, StyleSheet, Text, View} from 'react-native'

import image from '../../../assets/img/no_transactions.png'

const styles = StyleSheet.create({
  empty: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingTop: '50%',
  },
  emptyText: {
    color: '#9B9B9B',
    marginTop: 32,
  },
})

const messages = defineMessages({
  noTransactions: {
    id: 'components.txhistory.txhistory.noTransactions',
    defaultMessage: '!!!No transactions to show yet',
  },
})

const EmptyHistory = () => {
  const intl = useIntl()

  return (
    <View style={styles.empty}>
      <Image source={image} />
      <Text style={styles.emptyText}>{intl.formatMessage(messages.noTransactions)}</Text>
    </View>
  )
}

export default memo<mixed>(EmptyHistory)
