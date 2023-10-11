import {useFocusEffect} from '@react-navigation/native'
import {Balance, Swap} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import _ from 'lodash'
import {capitalize} from 'lodash'
import React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, TouchableOpacity, View} from 'react-native'
import {FlatList} from 'react-native-gesture-handler'

import {
  ExpandableInfoCard,
  ExpandableInfoCardSkeleton,
  HeaderWrapper,
  HiddenInfoWrapper,
  MainInfoWrapper,
  Spacer,
  Text,
  TokenIcon,
} from '../../../../../components'
import {useMetrics} from '../../../../../metrics/metricsManager'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {COLORS} from '../../../../../theme'
import {useTokenInfo, useTransactionInfos} from '../../../../../yoroi-wallets/hooks'
import {TransactionInfo, TxMetadataInfo} from '../../../../../yoroi-wallets/types'
import {asQuantity, openInExplorer, Quantities} from '../../../../../yoroi-wallets/utils'
import {Counter} from '../../../common/Counter/Counter'
import {PoolIcon} from '../../../common/PoolIcon/PoolIcon'
import {useStrings} from '../../../common/strings'
import {MAX_DECIMALS} from './mapOrders'

export type MappedRawOrder = {
  id: string
  metadata: {
    sellTokenId: string
    buyTokenId: string
    buyQuantity: string
    sellQuantity: string
    provider: Swap.SupportedProvider
  }
  date: string
}

const findCompletedOrderTx = (transactions: TransactionInfo[]): MappedRawOrder[] => {
  const sentTransactions = transactions.filter((tx) => tx.direction === 'SENT')
  const receivedTransactions = transactions.filter((tx) => tx.direction === 'RECEIVED')

  const filteredTx = sentTransactions.reduce((acc, sentTx) => {
    const result: {id?: string; metadata?: TxMetadataInfo; date?: string} = {}
    receivedTransactions.forEach((receivedTx) => {
      receivedTx.inputs.forEach((input) => {
        if (Boolean(input.id) && input?.id?.slice(0, -1) === sentTx?.id) {
          result['id'] = sentTx?.id
          result['metadata'] = sentTx?.metadata
          result['date'] = receivedTx?.lastUpdatedAt
        }
      })
    })

    if (result['id'] !== undefined && result['metadata'] !== undefined) {
      try {
        const metadata = JSON.parse(result.metadata as string)
        result['metadata'] = metadata
        return acc.concat(result as MappedRawOrder)
      } catch (error) {
        console.warn('Error parsing json metadata', error)
      }
    }
    return acc
  }, [] as Array<MappedRawOrder>)

  return filteredTx.filter((tx) => tx.metadata !== null)
}

export const CompletedOrders = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()

  const transactionsInfos = useTransactionInfos(wallet)

  const completeOrders = findCompletedOrderTx(Object.values(transactionsInfos))

  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.swapConfirmedPageViewed({swap_tab: 'Completed Orders'})
    }, [track]),
  )

  return (
    <>
      <View style={styles.container}>
        <FlatList
          data={completeOrders}
          renderItem={({item}: {item: MappedRawOrder}) => <ExpandableOrder order={item} />}
          keyExtractor={(item) => item.id}
        />
      </View>

      <Counter
        style={styles.counter}
        openingText={strings.youHave}
        counter={completeOrders?.length ?? 0}
        closingText={strings.listCompletedOrders}
      />
    </>
  )
}

export const ExpandableOrder = ({order}: {order: MappedRawOrder}) => {
  const [hiddenInfoOpenId, setHiddenInfoOpenId] = React.useState<string | null>(null)
  const wallet = useSelectedWallet()
  const intl = useIntl()
  const metadata = order.metadata
  const id = order.id
  const expanded = id === hiddenInfoOpenId
  const sellIcon = <TokenIcon wallet={wallet} tokenId={metadata.sellTokenId} variant="swap" />
  const buyIcon = <TokenIcon wallet={wallet} tokenId={metadata.buyTokenId} variant="swap" />
  const buyTokenInfo = useTokenInfo({wallet, tokenId: metadata.buyTokenId})
  const sellTokenInfo = useTokenInfo({wallet, tokenId: metadata.sellTokenId})
  const buyQuantity = Quantities.format(metadata.buyQuantity as Balance.Quantity, buyTokenInfo.decimals ?? 0)
  const sellQuantity = Quantities.format(metadata.sellQuantity as Balance.Quantity, sellTokenInfo.decimals ?? 0)
  const tokenPrice = asQuantity(new BigNumber(metadata.sellQuantity).dividedBy(metadata.buyQuantity).toString())
  const marketPrice = Quantities.format(tokenPrice, sellTokenInfo.decimals ?? 0, MAX_DECIMALS)
  const buyLabel = buyTokenInfo?.ticker ?? buyTokenInfo?.name ?? '-'
  const sellLabel = sellTokenInfo?.ticker ?? sellTokenInfo?.name ?? '-'

  return (
    <ExpandableInfoCard
      key={id}
      info={
        <HiddenInfo
          txId={id}
          total={`${buyQuantity} ${buyLabel}`}
          onTxPress={() => openInExplorer(id, wallet.networkId)}
          provider={metadata.provider}
        />
      }
      header={
        <Header
          onPress={() => setHiddenInfoOpenId(hiddenInfoOpenId !== id ? id : null)}
          assetFromLabel={sellLabel}
          assetToLabel={buyLabel}
          assetFromIcon={sellIcon}
          assetToIcon={buyIcon}
          expanded={expanded}
        />
      }
      expanded={expanded}
      withBoxShadow
    >
      <MainInfo
        tokenPrice={marketPrice}
        sellLabel={sellLabel}
        tokenAmount={`${sellQuantity} ${sellLabel}`}
        txTimeCreated={intl.formatDate(new Date(order.date), {dateStyle: 'short', timeStyle: 'short'})}
      />
    </ExpandableInfoCard>
  )
}

const Header = ({
  assetFromLabel,
  assetToLabel,
  assetFromIcon,
  assetToIcon,
  expanded,
  onPress,
}: {
  assetFromLabel: string
  assetToLabel: string
  assetFromIcon: React.ReactNode
  assetToIcon: React.ReactNode
  expanded?: boolean
  onPress: () => void
}) => {
  return (
    <HeaderWrapper expanded={expanded} onPress={onPress}>
      <View style={styles.label}>
        {assetFromIcon}

        <Spacer width={4} />

        <Text>{assetFromLabel}</Text>

        <Text>/</Text>

        <Spacer width={4} />

        {assetToIcon}

        <Spacer width={4} />

        <Text>{assetToLabel}</Text>
      </View>
    </HeaderWrapper>
  )
}

const HiddenInfo = ({
  total,
  txId,
  onTxPress,
  provider,
}: {
  total: string
  txId: string
  onTxPress: () => void
  provider: Swap.PoolProvider
}) => {
  const shortenedTxId = `${txId.substring(0, 9)}...${txId.substring(txId.length - 4, txId.length)}`
  const strings = useStrings()
  return (
    <View>
      {[
        {
          label: strings.listOrdersTotal,
          value: total,
        },

        {
          label: strings.dex.toUpperCase(),
          value: capitalize(provider),
          icon: <PoolIcon providerId={provider} size={23} />,
        },
        {
          label: strings.listOrdersTxId,
          value: <TxLink txId={shortenedTxId} onTxPress={onTxPress} />,
        },
      ].map((item) => (
        <HiddenInfoWrapper key={item.label} value={item.value} label={item.label} icon={item.icon} />
      ))}
    </View>
  )
}

const MainInfo = ({
  tokenPrice,
  tokenAmount,
  sellLabel,
  txTimeCreated,
}: {
  tokenPrice: string
  sellLabel: string
  tokenAmount: string
  txTimeCreated: string
}) => {
  const strings = useStrings()
  return (
    <View>
      {[
        {label: strings.listOrdersSheetAssetPrice, value: `${tokenPrice} ${sellLabel}`},
        {label: strings.listOrdersSheetAssetAmount, value: tokenAmount},
        {label: strings.listOrdersTimeCreated, value: txTimeCreated},
      ].map((item, index) => (
        <MainInfoWrapper key={index} label={item.label} value={item.value} isLast={index === 2} />
      ))}
    </View>
  )
}

export const CompletedOrdersSkeleton = () => (
  <View style={styles.container}>
    <View style={styles.flex}>
      {[0, 1, 2, 3].map((index) => (
        <React.Fragment key={index}>
          <ExpandableInfoCardSkeleton />

          <Spacer height={20} />
        </React.Fragment>
      ))}
    </View>
  </View>
)

const TxLink = ({onTxPress, txId}: {onTxPress: () => void; txId: string}) => {
  return (
    <TouchableOpacity onPress={onTxPress} style={styles.txLink}>
      <Text style={styles.txLinkText}>{txId}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  flex: {
    flex: 1,
  },
  txLink: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  txLinkText: {
    color: '#4B6DDE',
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counter: {
    paddingVertical: 16,
  },
})
