import {Amounts, Quantities} from '@yoroi/cardano-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import {FlashList, FlashListProps} from '@shopify/flash-list'
import BigNumber from 'bignumber.js'
import _ from 'lodash'
import * as React from 'react'
import {ActivityIndicator, View} from 'react-native'

import {
  extractMetadataText,
  getAdaAmount,
  getTransactionOperationTypeKey,
} from '~/features/Transactions/common/filterHelpers'
import {TransactionSummary} from '~/features/Transactions/common/types'
import {useTransactionSummaries} from '~/features/Transactions/hooks/useTransactionSummaries'
import {Space} from '~/ui/Space/Space'

import {useTxFilter} from './TxFilterProvider'
import {TxListItem} from './TxListItem'

type Props = Partial<FlashListProps<TransactionSummary>> & {
  listHeaderComponent?: FlashListProps<TransactionSummary>['ListHeaderComponent']
}
export const TxList = ({listHeaderComponent, ...props}: Props) => {
  const {wallet} = useSelectedWallet()
  const {palette: p} = useTheme()

  const filter = useTxFilter()
  const transactionSummaries = useTransactionSummaries({wallet})
  const [isPending, startTransition] = React.useTransition()
  const [filteredTransactions, setFilteredTransactions] = React.useState<
    TransactionSummary[]
  >([])

  React.useEffect(() => {
    startTransition(() => {
      const filtered = filterTransactions(transactionSummaries, filter, wallet)
      setFilteredTransactions(filtered)
    })
  }, [transactionSummaries, filter, wallet])

  const [loadedTxs, setLoadedTxs] = React.useState<TransactionSummary[]>([])
  const [currentIndex, setCurrentIndex] = React.useState(0)

  React.useEffect(() => {
    const initialBatch = filteredTransactions.slice(0, batchSize)
    setLoadedTxs(initialBatch)
    setCurrentIndex(Math.min(batchSize, filteredTransactions.length))
  }, [filteredTransactions])

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

  if (isPending && filteredTransactions.length === 0) {
    return (
      <View style={[a.flex_1, a.justify_center, a.align_center]}>
        <ActivityIndicator size="large" color={p.primary_500} />
      </View>
    )
  }

  return (
    <View style={a.flex_1}>
      {isPending && filteredTransactions.length > 0 && !props.refreshing && (
        <View
          style={[
            a.absolute,
            {top: 0, left: 0, right: 0, zIndex: 10},
            a.align_center,
            a.py_sm,
          ]}
        >
          <ActivityIndicator size="small" color={p.primary_500} />
        </View>
      )}
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
        ListHeaderComponent={listHeaderComponent}
        {...props}
      />
    </View>
  )
}

const batchSize = 50

const filterTransactions = (
  transactions: Record<string, TransactionSummary>,
  filter: ReturnType<typeof useTxFilter>,
  wallet: ReturnType<typeof useSelectedWallet>['wallet'],
) =>
  _(transactions)
    .filter((t) => {
      // Token filter (existing)
      const {tokenId} = filter
      if (tokenId !== undefined) {
        if (tokenId === '.') {
          const primaryTokenId = '.'
          const deltaAmount = Amounts.getAmount(t.delta, primaryTokenId)
          if (Quantities.isZero(deltaAmount.quantity)) return false
        } else {
          const deltaAmount = Amounts.getAmount(t.delta, tokenId)
          if (Quantities.isZero(deltaAmount.quantity)) return false
        }
      }

      // Operation type filter
      if (filter.selectedOperations && filter.selectedOperations.length > 0) {
        const operationTypeKey = getTransactionOperationTypeKey(t)
        const operationToMatch = operationTypeKey ?? t.direction
        if (!filter.selectedOperations.includes(operationToMatch)) {
          return false
        }
      }

      // Metadata/Memo search filter
      if (filter.metadataMemoSearch && filter.metadataMemoSearch.trim()) {
        const searchTerm = filter.metadataMemoSearch.toLowerCase().trim()
        const metadataText = extractMetadataText(t.metadata)
        const rawTx = wallet.getRawTransaction(t.id)
        const memo = rawTx?.memo ?? ''
        const searchableText = `${metadataText} ${memo}`.toLowerCase()

        if (!searchableText.includes(searchTerm)) {
          return false
        }
      }

      // ADA amount range filter
      if (filter.minAdaMoved || filter.maxAdaMoved) {
        const primaryTokenId = '.'
        const adaAmount = getAdaAmount(t.amount, primaryTokenId)

        if (filter.minAdaMoved) {
          try {
            const minAda = new BigNumber(filter.minAdaMoved)
            // Convert to lovelace (multiply by 1e6)
            const minLovelace = minAda.multipliedBy(1e6)
            if (adaAmount.isLessThan(minLovelace)) {
              return false
            }
          } catch {
            // Invalid number, skip this filter
          }
        }

        if (filter.maxAdaMoved) {
          try {
            const maxAda = new BigNumber(filter.maxAdaMoved)
            // Convert to lovelace (multiply by 1e6)
            const maxLovelace = maxAda.multipliedBy(1e6)
            if (adaAmount.isGreaterThan(maxLovelace)) {
              return false
            }
          } catch {
            // Invalid number, skip this filter
          }
        }
      }

      return true
    })
    .sortBy((t) => t.submittedAt)
    .reverse()
    .value()
