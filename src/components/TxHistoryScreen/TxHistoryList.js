/**
 * @flow
 */

import React, {Component} from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {groupBy} from 'lodash'
import moment from 'moment'
import type {Moment} from 'moment'

import type {HistoryTransaction} from '../../types/HistoryTransaction'
import CustomText from '../../components/CustomText'
import TxHistoryListItem from './TxHistoryListItem'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 15,
  },
  dayContainer: {
    flex: 0,
    flexShrink: 1,
    marginTop: 10,
    marginBottom: 15,
  },
  dateLabelContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
  },
  dateLabel: {
    color: '#000',
    fontSize: 20,
  },
})

type Props = {transactions: Array<HistoryTransaction>};
class TxHistoryList extends Component<Props> {
  formatDate = (timestamp: Moment) => {
    if (moment().isSame(timestamp, 'day')) {
      return 'Today'
    } else if (moment().subtract(1, 'day').isSame(timestamp, 'day')) {
      return 'Yesterday'
    } else {
      return timestamp.format('L')
    }
  }

  render() {
    const {transactions, navigation} = this.props
    // Fixme: add sorting by time
    const transactionsByDate = groupBy(transactions, (transaction) => this.formatDate(transaction.timestamp))

    return (
      <View style={styles.container}>
        {Object.keys(transactionsByDate).map((date) => (
          <View key={date} style={styles.dayContainer}>
            <View style={styles.dateLabelContainer}>
              <CustomText>
                <Text style={styles.dateLabel}>{date}</Text>
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
}

export default TxHistoryList
