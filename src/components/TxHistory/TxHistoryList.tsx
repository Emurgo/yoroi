import {useNavigation} from '@react-navigation/native'
import _ from 'lodash'
import React from 'react'
import {useIntl} from 'react-intl'
import {SectionList, StyleSheet, View} from 'react-native'

import TxHistoryListItem from '../../../legacy/components/TxHistory/TxHistoryListItem'
import {Text} from '../../../legacy/components/UiKit'
import {formatDateRelative} from '../../../legacy/utils/format'
import {TransactionInfo} from './types'

type Props = {
  transactions: Dict<TransactionInfo>,
  refreshing: boolean,
  onRefresh: () => void,
}

const TxHistoryList = ({transactions, refreshing, onRefresh}: Props) => {
  const intl = useIntl()
  const navigation = useNavigation()
  const groupedTransactions = getTransactionsByDate(transactions)

  return (
    <View style={styles.container}>
      <SectionList
        onRefresh={onRefresh}
        refreshing={refreshing}
        renderItem={({item}) => <TxHistoryListItem navigation={navigation} id={item.id} />}
        renderSectionHeader={({section: {data}}) => <DayHeader ts={data[0].submittedAt} intl={intl} />}
        sections={groupedTransactions}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
      />
    </View>
  )
}

type DayHeaderProps = {
  ts: unknown,
}

const DayHeader = ({ts}: DayHeaderProps) => {
  const intl = useIntl()

  return (
    <View style={styles.dayHeader}>
      <Text>{formatDateRelative(ts, intl)}</Text>
    </View>
  )
}

const getTransactionsByDate = (transactions: Dict<TransactionInfo>) =>
  _(transactions)
    .filter((t) => t.submittedAt != null)
    .sortBy((t) => t.submittedAt)
    .reverse()
    .groupBy((t) => t.submittedAt.substring(0, '2001-01-01'.length))
    .values()
    .map((data) => ({data}))
    .value()

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dayHeader: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 28,
    backgroundColor: '#fff',
  },
})


export default TxHistoryList
