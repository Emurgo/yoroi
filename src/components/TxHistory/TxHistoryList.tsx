import {useNavigation} from '@react-navigation/native'
import _ from 'lodash'
import React from 'react'
import {useIntl} from 'react-intl'
import {Alert, SectionList, StyleSheet, View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import TxHistoryListItem from '../../../legacy/components/TxHistory/TxHistoryListItem'
import {Text} from '../../../legacy/components/UiKit'
import {actionMessages} from '../../../legacy/i18n/global-messages'
import {formatDateRelative} from '../../../legacy/utils/format'
import features from '../../features'
import {TransactionInfo} from './types'

type Props = {
  transactions: Dict<TransactionInfo>
  refreshing: boolean
  onRefresh: () => void
}

const TxHistoryList = ({transactions, refreshing, onRefresh}: Props) => {
  const strings = useStrings()
  const navigation = useNavigation()
  const groupedTransactions = getTransactionsByDate(transactions)

  const handleExport = () => Alert.alert(strings.soon, strings.soon)
  const handleSearch = () => Alert.alert(strings.soon, strings.soon)

  return (
    <View style={styles.listRoot}>
      {(features.txHistory.export || features.txHistory.search) && (
        <TxListActionsBanner onExport={handleExport} onSearch={handleSearch} />
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

type TxListActionsBannerProps = {
  onExport: () => void
  onSearch: () => void
}

const TxListActionsBanner = (props: TxListActionsBannerProps) => {
  return (
    <View style={styles.actionsRoot}>
      {features.txHistory.export && (
        <TouchableOpacity onPress={props.onExport}>
          <Icon name="export" size={24} color="#6B7384" />
        </TouchableOpacity>
      )}

      {features.txHistory.search && (
        <TouchableOpacity onPress={props.onSearch}>
          <Icon name="magnify" size={24} color="#6B7384" />
        </TouchableOpacity>
      )}
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

const getTransactionsByDate = (transactions: Dict<TransactionInfo>) =>
  _(transactions)
    .filter((t) => t.submittedAt != null)
    .sortBy((t) => t.submittedAt)
    .reverse()
    .groupBy((t) => t.submittedAt.substring(0, '2001-01-01'.length))
    .values()
    .map((data) => ({data}))
    .value()

// NOTE: layout is following inVision spec
// https://projects.invisionapp.com/d/main?origin=v7#/console/21500065/456867605/inspect?scrollOffset=2856#project_console
const styles = StyleSheet.create({
  listRoot: {
    flex: 1,
  },
  dayHeaderRoot: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  actionsRoot: {
    display: 'flex',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingBottom: 2,
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    soon: intl.formatMessage(actionMessages.soon),
  }
}

export default TxHistoryList
