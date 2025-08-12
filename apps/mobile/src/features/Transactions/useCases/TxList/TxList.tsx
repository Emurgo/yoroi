import {FlashList, FlashListProps} from '@shopify/flash-list'
import {atoms as a} from '@yoroi/theme'
import _ from 'lodash'
import * as React from 'react'
import {View} from 'react-native'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {Space} from '~/ui/Space/Space'
import {useTransactionInfos} from '~/features/Transactions/hooks/useTransactionInfos'
import {TransactionInfo} from '~/wallets/types/other'
import {useTxFilter} from './TxFilterProvider'
import {TxListItem} from './TxListItem'

type Props = Partial<FlashListProps<TransactionInfo>>
export const TxList = (props: Props) => {
  const {wallet} = useSelectedWallet()

  const filter = useTxFilter()
  const transactionInfos = useTransactionInfos({wallet})
  const filteredTransactions = React.useMemo(
    () => filterTransactions(transactionInfos, filter),
    [transactionInfos, filter],
  )

  const [loadedTxs, setLoadedTxs] = React.useState(
    filteredTransactions.slice(0, batchSize),
  )
  const [currentIndex, setCurrentIndex] = React.useState(batchSize)

  React.useEffect(() => {
    setLoadedTxs(filteredTransactions.slice(0, currentIndex + batchSize))
    setCurrentIndex(currentIndex + batchSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionInfos]) // must be transactionInfos

  const handleOnEndReached = React.useCallback(() => {
    if (currentIndex >= filteredTransactions.length) return
    const nextBatch = filteredTransactions.slice(
      currentIndex,
      currentIndex + batchSize,
    )
    setLoadedTxs([...loadedTxs, ...nextBatch])
    setCurrentIndex(currentIndex + batchSize)
  }, [currentIndex, filteredTransactions, loadedTxs])

  return (
    <View style={a.flex_1}>
      <FlashList
        data={loadedTxs}
        contentContainerStyle={{...a.pt_lg, ...a.px_lg}}
        renderItem={({item}) => <TxListItem transaction={item} />}
        ItemSeparatorComponent={() => <Space.Height.lg />}
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

const filterTransactions = (
  transactions: Record<string, TransactionInfo>,
  filter: ReturnType<typeof useTxFilter>,
) =>
  _(transactions)
    .filter((t) => {
      const {tokenId} = filter
      if (tokenId === undefined) return true
      if (tokenId === '.')
        return Boolean(
          t.delta.find(({amount, isDefault}) => amount !== '0' && isDefault),
        )
      return Boolean(
        t.delta.find(
          ({amount, identifier}) => amount !== '0' && identifier === tokenId,
        ),
      )
    })
    .sortBy((t) => t.submittedAt)
    .reverse()
    .value()
