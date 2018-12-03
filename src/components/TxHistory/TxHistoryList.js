// @flow

import React from 'react'
import {View, SectionList} from 'react-native'
import _ from 'lodash'

import {Text} from '../UiKit'
import TxHistoryListItem from './TxHistoryListItem'
import {formatDateRelative} from '../../utils/format'

import type {TransactionInfo} from '../../types/HistoryTransaction'
import type {NavigationScreenProp, NavigationState} from 'react-navigation'
import type {Dict} from '../../state'

import styles from './styles/TxHistoryList.style'

const DayHeader = ({ts}) => (
  <View style={styles.dayHeader}>
    <Text>{formatDateRelative(ts)}</Text>
  </View>
)

type Props = {
  transactions: Dict<TransactionInfo>,
  navigation: NavigationScreenProp<NavigationState>,
}

const getTransactionsByDate = (transactions: Dict<TransactionInfo>) =>
  _(transactions)
    .sortBy((t) => t.submittedAt)
    .reverse()
    .groupBy((t) => t.submittedAt.substring(0, '2001-01-01'.length))
    .values()
    .map((data) => ({data}))
    .value()

const TxHistoryList = ({transactions, navigation}: Props) => {
  // TODO(ppershing): add proper memoization here
  const groupedTransactions = getTransactionsByDate(transactions)

  return (
    <View style={styles.container}>
      <SectionList
        renderItem={({item}) => (
          <TxHistoryListItem navigation={navigation} id={item.id} />
        )}
        renderSectionHeader={({section: {data}}) => (
          <DayHeader ts={data[0].submittedAt} />
        )}
        sections={groupedTransactions}
        keyExtractor={(item) => item.id}
      />
    </View>
  )
}

export default TxHistoryList
