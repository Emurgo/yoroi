import {useFocusEffect} from '@react-navigation/native'
import {FlashList, FlashListProps} from '@shopify/flash-list'
import {useTheme} from '@yoroi/theme'
import _ from 'lodash'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Space} from '../../../components/Space/Space'
import {ShowBuyBanner} from '../../../features/Exchange/common/ShowBuyBanner/ShowBuyBanner'
import {useSelectedWallet} from '../../../features/WalletManager/common/hooks/useSelectedWallet'
import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {useTransactionInfos} from '../../../yoroi-wallets/hooks'
import {TransactionInfo} from '../../../yoroi-wallets/types'
import {TxHistoryListItem} from './TxHistoryListItem'

type Props = Partial<FlashListProps<TransactionInfo>>
export const TxHistoryList = (props: Props) => {
  const styles = useStyles()
  const {wallet} = useSelectedWallet()
  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.transactionsPageViewed()
    }, [track]),
  )

  const transactionsInfo = useTransactionInfos(wallet)
  const sortedTransactions = React.useMemo(() => getTransactionsByDate(transactionsInfo), [transactionsInfo])

  const [loadedTxs, setLoadedTxs] = React.useState(sortedTransactions.slice(0, batchSize))
  const [currentIndex, setCurrentIndex] = React.useState(batchSize)

  const handleOnEndReached = React.useCallback(() => {
    if (currentIndex >= sortedTransactions.length) return
    const nextBatch = sortedTransactions.slice(currentIndex, currentIndex + batchSize)
    setLoadedTxs([...loadedTxs, ...nextBatch])
    setCurrentIndex(currentIndex + batchSize)
  }, [currentIndex, sortedTransactions, loadedTxs])

  return (
    <View style={styles.container}>
      <FlashList
        {...props}
        data={loadedTxs}
        ListHeaderComponent={<ShowBuyBanner />}
        contentContainerStyle={styles.content}
        renderItem={({item}) => <TxHistoryListItem transaction={item} />}
        ItemSeparatorComponent={() => <Space height="lg" />}
        keyExtractor={(_, index) => index.toString()}
        nestedScrollEnabled={true}
        testID="txHistoryList"
        onEndReached={handleOnEndReached}
        onEndReachedThreshold={0.5}
        estimatedItemSize={72}
      />
    </View>
  )
}

const batchSize = 50

const getTransactionsByDate = (transactions: Record<string, TransactionInfo>) =>
  _(transactions)
    .sortBy((t) => t.submittedAt)
    .reverse()
    .value()

const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      ...atoms.pt_lg,
      ...atoms.px_lg,
    },
  })

  return styles
}
