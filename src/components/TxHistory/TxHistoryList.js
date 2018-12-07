// @flow

import React from 'react'
import {View, SectionList} from 'react-native'
import _ from 'lodash'

import {Text} from '../UiKit'
import TxHistoryListItem from './TxHistoryListItem'
import {formatDateRelative} from '../../utils/format'

import styles from './styles/TxHistoryList.style'

import type {TransactionInfo} from '../../types/HistoryTransaction'
import type {Navigation} from '../../types/navigation'
import type {Dict} from '../../state'
import type {ComponentType} from 'react'

const DayHeader = ({ts}) => (
  <View style={styles.dayHeader}>
    <Text>{formatDateRelative(ts)}</Text>
  </View>
)

const getTransactionsByDate = (transactions: Dict<TransactionInfo>) =>
  _(transactions)
    .sortBy((t) => t.submittedAt)
    .reverse()
    .groupBy((t) => t.submittedAt.substring(0, '2001-01-01'.length))
    .values()
    .map((data) => ({data}))
    .value()

const TxHistoryList = ({transactions, navigation, refreshing, onRefresh}) => {
  // TODO(ppershing): add proper memoization here
  const groupedTransactions = getTransactionsByDate(transactions)

  return (
    <View style={styles.container}>
      <SectionList
        onRefresh={onRefresh}
        refreshing={refreshing}
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

type ExternalProps = {
  transactions: Dict<TransactionInfo>,
  navigation: Navigation,
  refreshing: boolean,
  onRefresh: () => any,
}

export default (TxHistoryList: ComponentType<ExternalProps>)
