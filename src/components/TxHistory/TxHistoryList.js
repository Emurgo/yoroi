// @flow

import React from 'react'
import {compose} from 'redux'
import {withHandlers} from 'recompose'
import {connect} from 'react-redux'

import {View} from 'react-native'
import _ from 'lodash'
import moment from 'moment'
import type {Moment} from 'moment'

import type {HistoryTransaction} from '../../types/HistoryTransaction'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {Dict} from '../../state'

import {Text} from '../UiKit'
import TxHistoryListItem from './TxHistoryListItem'

import styles from './styles/TxHistoryList.style'

const formatDate = (timestamp: Moment, trans) => {
  if (moment().isSame(timestamp, 'day')) {
    return trans.global.datetime.today
  } else if (
    moment()
      .subtract(1, 'day')
      .isSame(timestamp, 'day')
  ) {
    return trans.global.datetime.yesterday
  } else {
    // moment should be set to correct i18n
    return timestamp.format('L')
  }
}

const DayHeader = ({ts, formatDate}) => (
  <View style={styles.dateLabelContainer}>
    <Text style={styles.dateLabel}>{formatDate(ts)}</Text>
  </View>
)

type Props = {
  transactions: Dict<HistoryTransaction>,
  navigation: NavigationScreenProp<NavigationState>,
  formatDate: (timestamp: Moment, trans: any) => string,
}

const getTransactionsByDate = (transactions: Array<HistoryTransaction>) =>
  _(transactions)
    .sortBy((t) => -moment(t.submittedAt).unix())
    .groupBy((t) => moment(t.submittedAt).format('L'))
    .toPairs()
    .value()

const TxHistoryList = ({transactions, navigation, formatDate}: Props) => {
  // TODO(ppershing): add proper memoization here
  const groupedTransactions = getTransactionsByDate(transactions)

  return (
    <View style={styles.container}>
      {groupedTransactions.map(([date, transactions]) => (
        <View key={date} style={styles.dayContainer}>
          <DayHeader ts={transactions[0].submittedAt} formatDate={formatDate} />
          {transactions.map((transaction) => (
            <TxHistoryListItem
              navigation={navigation}
              key={transaction.id}
              id={transaction.id}
            />
          ))}
        </View>
      ))}
    </View>
  )
}

export default compose(
  connect((state) => ({
    translations: state.trans,
  })),
  withHandlers({
    formatDate: ({translations}) => (ts) => formatDate(ts, translations),
  }),
)(TxHistoryList)
