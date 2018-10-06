// @flow

import React from 'react'
import {Text, View} from 'react-native'
import {groupBy} from 'lodash'
import moment from 'moment'
import type {Moment} from 'moment'

import type {HistoryTransaction} from '../../types/HistoryTransaction'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import CustomText from '../../components/CustomText'
import TxHistoryListItem from './TxHistoryListItem'

import styles from './TxHistoryList.style'

const formatDate = (timestamp: Moment) => {
  if (moment().isSame(timestamp, 'day')) {
    return 'Today'
  } else if (moment().subtract(1, 'day').isSame(timestamp, 'day')) {
    return 'Yesterday'
  } else {
    return timestamp.format('L')
  }
}


type Props = {
  transactions: Array<HistoryTransaction>,
  navigation: NavigationScreenProp<NavigationState>
};

const TxHistoryList = ({transactions, navigation}: Props) => {
  // Fixme: add sorting by time
  const transactionsByDate = groupBy(
    transactions,
    (transaction) => formatDate(transaction.timestamp)
  )

  return (
    <View style={styles.container}>
      {Object.keys(transactionsByDate).map((date) => (
        <View key={date} style={styles.dayContainer}>
          <View style={styles.dateLabelContainer}>
            <CustomText>
              <Text style={styles.dateLabel}>i18n{date}</Text>
            </CustomText>
          </View>
          {transactionsByDate[date].map((transaction) => (
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

export default TxHistoryList
