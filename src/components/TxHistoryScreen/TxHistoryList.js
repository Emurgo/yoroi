// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'

import {Text, View} from 'react-native'
import _ from 'lodash'
import moment from 'moment'
import type {Moment} from 'moment'

import type {HistoryTransaction} from '../../types/HistoryTransaction'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import CustomText from '../../components/CustomText'
import TxHistoryListItem from './TxHistoryListItem'

import styles from './TxHistoryList.style'

const formatDate = (timestamp: Moment) => {
  if (moment().isSame(timestamp, 'day')) {
    return 'I18n today'
  } else if (moment().subtract(1, 'day').isSame(timestamp, 'day')) {
    return 'I18n yesterday'
  } else {
    // moment should be set to correct i18n
    return timestamp.format('L')
  }
}


const DayHeader = ({ts}) => (
  <View style={styles.dateLabelContainer}>
    <CustomText>
      <Text style={styles.dateLabel}>{formatDate(ts)}</Text>
    </CustomText>
  </View>
)

type Props = {
  transactions: Array<HistoryTransaction>,
  navigation: NavigationScreenProp<NavigationState>,
};

const TxHistoryList = ({transactions, navigation}: Props) => {
  // Fixme: add sorting by time
  const transactionsByDate = _(transactions)
    .groupBy((transaction) => moment(transaction.timestamp).format('L'))
    .toPairs()
    .value()

  return (
    <View style={styles.container}>
      {transactionsByDate.map(([date, transactions]) => (
        <View key={date} style={styles.dayContainer}>
          <DayHeader ts={transactions[0].timestamp} />
          {transactions.map((transaction) => (
            <TxHistoryListItem
              navigation={navigation}
              key={transaction.id}
              transaction={transaction}
            />
          ))}
        </View>
      ))}
    </View>
  )
}

export default compose(
  connect((state) => ({
  })),
)(TxHistoryList)
