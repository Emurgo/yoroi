import {atoms as a} from '@yoroi/theme'

import {FlashList, FlashListProps} from '@shopify/flash-list'
import _ from 'lodash'
import * as React from 'react'
import {View} from 'react-native'

import {TransactionSummary} from '~/features/Transactions/common/types'
import {useTransactionSummaries} from '~/features/Transactions/hooks/useTransactionSummaries'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {Space} from '~/ui/Space/Space'
import {Amounts, Quantities} from '~/wallets/utils/utils'

import {useTxFilter} from './TxFilterProvider'
import {TxListItem} from './TxListItem'

type Props = Partial<FlashListProps<TransactionSummary>>
export const TxList = (props: Props) => {
  const {wallet} = useSelectedWallet()

  const filter = useTxFilter()
  const transactionSummaries = useTransactionSummaries({wallet})
  const filteredTransactions = React.useMemo(
    () => filterTransactions(transactionSummaries, filter),
    [transactionSummaries, filter],
  )

  const [loadedTxs, setLoadedTxs] = React.useState(
    filteredTransactions.slice(0, batchSize),
  )
  const [currentIndex, setCurrentIndex] = React.useState(batchSize)

  React.useEffect(() => {
    setLoadedTxs(filteredTransactions.slice(0, currentIndex + batchSize))
    setCurrentIndex(currentIndex + batchSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionSummaries]) // must be transactionSummaries

  const handleOnEndReached = React.useCallback(() => {
    if (currentIndex >= filteredTransactions.length) return
    const nextBatch = filteredTransactions.slice(
      currentIndex,
      currentIndex + batchSize,
    )
    setLoadedTxs([...loadedTxs, ...nextBatch])
    setCurrentIndex(currentIndex + batchSize)
  }, [currentIndex, filteredTransactions, loadedTxs])

  const renderItem = React.useCallback(
    ({item}: {item: TransactionSummary}) => <TxListItem transaction={item} />,
    [],
  )

  const ItemSeparator = React.useCallback(() => <Space.Height.lg />, [])

  const keyExtractor = React.useCallback(
    (_: TransactionSummary, index: number) => index.toString(),
    [],
  )

  return (
    <View style={a.flex_1}>
      <FlashList
        data={loadedTxs}
        contentContainerStyle={a.p_lg}
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparator}
        keyExtractor={keyExtractor}
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

const filterTransactions = (
  transactions: Record<string, TransactionSummary>,
  filter: ReturnType<typeof useTxFilter>,
) =>
  _(transactions)
    .filter((t) => {
      const {tokenId} = filter
      if (tokenId === undefined) return true
      if (tokenId === '.') {
        const primaryTokenId = '.'
        const deltaAmount = Amounts.getAmount(t.delta, primaryTokenId)
        return !Quantities.isZero(deltaAmount.quantity)
      }
      const deltaAmount = Amounts.getAmount(t.delta, tokenId)
      return !Quantities.isZero(deltaAmount.quantity)
    })
    .sortBy((t) => t.submittedAt)
    .reverse()
    .value()
