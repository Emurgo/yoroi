import {useNavigation} from '@react-navigation/native'
import _ from 'lodash'
import React from 'react'
import {useIntl} from 'react-intl'
import {Alert, Platform, SectionList, SectionListProps, StyleSheet, View} from 'react-native'
import {useSelector} from 'react-redux'

import {Text} from '../../components'
import features from '../../features'
import {actionMessages} from '../../i18n/global-messages'
import {formatDateRelative} from '../../legacy/format'
import {transactionsInfoSelector} from '../../legacy/selectors'
import {TransactionInfo} from '../../yoroi-wallets/types'
import {useOnScroll} from '../useOnScroll'
import {ActionsBanner} from './ActionsBanner'
import {EmptyHistory} from './EmptyHistory'
import {TxHistoryListItem} from './TxHistoryListItem'

type ListProps = SectionListProps<TransactionInfo>

type Props = Partial<ListProps> & {
  onScrollUp: ListProps['onScroll']
  onScrollDown: ListProps['onScroll']
}
export const TxHistoryList = ({onScrollUp, onScrollDown, ...props}: Props) => {
  const strings = useStrings()
  const key = useRemountOnFocusHack()

  const transactionsInfo = useSelector(transactionsInfoSelector)
  const groupedTransactions = getTransactionsByDate(transactionsInfo)

  const onScroll = useOnScroll({onScrollUp, onScrollDown})

  const handleExport = () => Alert.alert(strings.soon, strings.soon)
  const handleSearch = () => Alert.alert(strings.soon, strings.soon)

  return (
    <View style={styles.listRoot}>
      {(features.txHistory.export || features.txHistory.search) && (
        <ActionsBanner onExport={handleExport} onSearch={handleSearch} />
      )}
      <SectionList
        {...props}
        {...onScroll}
        key={key}
        ListEmptyComponent={<EmptyHistory />}
        renderItem={({item}) => <TxHistoryListItem transaction={item} />}
        renderSectionHeader={({section: {data}}) => <DayHeader ts={data[0].submittedAt} />}
        sections={groupedTransactions}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        nestedScrollEnabled={true}
        maxToRenderPerBatch={20}
        initialNumToRender={20}
        testID="txHistoryList"
      />
    </View>
  )
}

// workaround for https://emurgo.atlassian.net/browse/YOMO-199
// related to https://github.com/facebook/react-native/issues/15694
export const useRemountOnFocusHack = () => {
  const [key, setKey] = React.useState(0)
  const navigation = useNavigation()

  React.useEffect(() => {
    if (Platform.OS !== 'ios') {
      return
    }

    const unsubscribe = navigation.addListener('focus', () => {
      setKey((key) => key + 1)
    })

    return unsubscribe
  }, [key, navigation])

  return key
}

type DayHeaderProps = {
  ts: unknown
}

const DayHeader = ({ts}: DayHeaderProps) => {
  const intl = useIntl()

  return (
    <View style={styles.dayHeaderRoot}>
      <Text testID="dayHeaderText">{formatDateRelative(ts, intl)}</Text>
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
