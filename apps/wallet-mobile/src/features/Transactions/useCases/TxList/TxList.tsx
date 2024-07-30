import {FlashList, FlashListProps} from '@shopify/flash-list'
import {useTheme} from '@yoroi/theme'
import _ from 'lodash'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Space} from '../../../../components/Space/Space'
import {useTransactionInfos} from '../../../../yoroi-wallets/hooks'
import {TransactionInfo} from '../../../../yoroi-wallets/types'
import {ShowBuyBanner} from '../../../Exchange/common/ShowBuyBanner/ShowBuyBanner'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useTxFilter} from './TxFilterProvider'
import {TxListItem} from './TxListItem'

type Props = Partial<FlashListProps<TransactionInfo>>
export const TxList = (props: Props) => {
  const styles = useStyles()
  const {wallet} = useSelectedWallet()

  const filter = useTxFilter()
  const transactionInfos = useTransactionInfos({wallet})
  const filteredTransactions = React.useMemo(
    () => filterTransactions(transactionInfos, filter),
    [transactionInfos, filter],
  )

  const [loadedTxs, setLoadedTxs] = React.useState(filteredTransactions.slice(0, batchSize))
  const [currentIndex, setCurrentIndex] = React.useState(batchSize)

  React.useEffect(() => {
    setLoadedTxs(filteredTransactions.slice(0, currentIndex + batchSize))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionInfos]) // must be transactionInfos

  const handleOnEndReached = React.useCallback(() => {
    if (currentIndex >= filteredTransactions.length) return
    const nextBatch = filteredTransactions.slice(currentIndex, currentIndex + batchSize)
    setLoadedTxs([...loadedTxs, ...nextBatch])
    setCurrentIndex(currentIndex + batchSize)
  }, [currentIndex, filteredTransactions, loadedTxs])

  return (
    <View style={styles.container}>
      <FlashList
        data={loadedTxs}
        ListHeaderComponent={<ShowBuyBanner />}
        contentContainerStyle={styles.content}
        renderItem={({item}) => <TxListItem transaction={item} />}
        ItemSeparatorComponent={() => <Space height="lg" />}
        keyExtractor={(_, index) => index.toString()}
        nestedScrollEnabled={true}
        testID="txHistoryList"
        onEndReached={handleOnEndReached}
        onEndReachedThreshold={0.5}
        estimatedItemSize={72}
        refreshing={true}
        {...props}
      />
    </View>
  )
}

const batchSize = 50

const filterTransactions = (transactions: Record<string, TransactionInfo>, filter: ReturnType<typeof useTxFilter>) =>
  _(transactions)
    .filter((t) => {
      const {tokenId} = filter
      if (tokenId === undefined) return true
      if (tokenId === '.') return Boolean(t.delta.find(({amount, isDefault}) => amount !== '0' && isDefault))
      return Boolean(t.delta.find(({amount, identifier}) => amount !== '0' && identifier === tokenId))
    })
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
