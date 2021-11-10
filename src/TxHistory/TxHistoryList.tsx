import {useNavigation} from '@react-navigation/native'
import _ from 'lodash'
import React from 'react'
import {useIntl} from 'react-intl'
import {Alert, SectionList, StyleSheet, View} from 'react-native'

import TxHistoryListItem from '../../legacy/components/TxHistory/TxHistoryListItem'
import {Text} from '../../legacy/components/UiKit'
import {actionMessages} from '../../legacy/i18n/global-messages'
import {formatDateRelative} from '../../legacy/utils/format'
import features from '../features'
import {TxListActionsBannerForTransactionsTab} from './TxListActionsBanner'
import {TransactionInfo} from './types'

type Props = {
  transactions: Record<string, TransactionInfo>
  refreshing: boolean
  onRefresh: () => void
}

export const TxHistoryList = ({transactions, refreshing, onRefresh}: Props) => {
  const strings = useStrings()
  const navigation = useNavigation()
  const groupedTransactions = getTransactionsByDate(transactions)

  const handleExport = () => Alert.alert(strings.soon, strings.soon)
  const handleSearch = () => Alert.alert(strings.soon, strings.soon)

  return (
    <View style={styles.listRoot}>
      {(features.txHistory.export || features.txHistory.search) && (
        <TxListActionsBannerForTransactionsTab onExport={handleExport} onSearch={handleSearch} />
      )}
      <SectionList
        onRefresh={onRefresh}
        refreshing={refreshing}
        renderItem={({item}) => <TxHistoryListItem navigation={navigation} id={item.id} />}
        renderSectionHeader={({section: {data}}) => <DayHeader ts={data[0].submittedAt} />}
        sections={groupedTransactions}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
      />
    </View>
  )
}

type DayHeaderProps = {
  ts: unknown
}

const DayHeader = ({ts}: DayHeaderProps) => {
  const intl = useIntl()

  return (
    <View style={styles.dayHeaderRoot}>
      <Text>{formatDateRelative(ts, intl)}</Text>
    </View>
  )
}

const getTransactionsByDate = (transactions: Record<string, TransactionInfo>) =>
  _(transactions)
    .filter((t) => t.submittedAt != null)
    .sortBy((t) => t.submittedAt)
    .reverse()
    .groupBy((t) => t.submittedAt?.substring(0, '2001-01-01'.length))
    .values()
    .map((data) => ({data}))
    .value()

const styles = StyleSheet.create({
  listRoot: {
    flex: 1,
  },
  dayHeaderRoot: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    soon: intl.formatMessage(actionMessages.soon),
  }
}
