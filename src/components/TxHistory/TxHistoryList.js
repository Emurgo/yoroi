// @flow

import React from 'react'
import {View, SectionList} from 'react-native'
import {injectIntl} from 'react-intl'
import type {intlShape} from 'react-intl'
import _ from 'lodash'

import {Text} from '../UiKit'
import TxHistoryListItem from './TxHistoryListItem'
import {formatDateRelative} from '../../utils/format'

import styles from './styles/TxHistoryList.style'

import type {TransactionInfo} from '../../types/HistoryTransaction'
import type {Navigation} from '../../types/navigation'
import type {ComponentType} from 'react'

const DayHeader = ({ts, intl}) => (
  <View style={styles.dayHeader}>
    <Text>{formatDateRelative(ts, intl)}</Text>
  </View>
)

const getTransactionsByDate = (transactions: Dict<TransactionInfo>) =>
  _(transactions)
    .filter((t) => t.submittedAt != null)
    .sortBy((t) => t.submittedAt)
    .reverse()
    .groupBy((t) => t.submittedAt.substring(0, '2001-01-01'.length))
    .values()
    .map((data) => ({data}))
    .value()

const TxHistoryList = ({
  transactions,
  navigation,
  refreshing,
  onRefresh,
  intl,
}) => {
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
          <DayHeader ts={data[0].submittedAt} intl={intl} />
        )}
        sections={groupedTransactions}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
      />
    </View>
  )
}

type ExternalProps = {
  transactions: Dict<TransactionInfo>,
  navigation: Navigation,
  refreshing: boolean,
  onRefresh: () => any,
  intl: intlShape,
}

export default injectIntl((TxHistoryList: ComponentType<ExternalProps>))
