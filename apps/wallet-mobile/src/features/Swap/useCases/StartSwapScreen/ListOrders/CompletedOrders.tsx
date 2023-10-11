import {useFocusEffect} from '@react-navigation/native'
import {Swap} from '@yoroi/types'
import BigNumber from 'bignumber.js'
import _ from 'lodash'
import {capitalize} from 'lodash'
import React from 'react'
import {useIntl} from 'react-intl'
import {Linking, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native'

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
import {NETWORK_CONFIG} from '../../../../../yoroi-wallets/cardano/constants/mainnet/constants'
import {YoroiWallet} from '../../../../../yoroi-wallets/cardano/types'
import {useTokenInfo, useTransactionInfos} from '../../../../../yoroi-wallets/hooks'
import {TransactionInfo, TxMetadataInfo} from '../../../../../yoroi-wallets/types'
import {asQuantity, Quantities} from '../../../../../yoroi-wallets/utils'
import {Counter} from '../../../common/Counter/Counter'
import {PoolIcon} from '../../../common/PoolIcon/PoolIcon'
import {useStrings} from '../../../common/strings'
import {MappedCompleteOrder, MAX_DECIMALS} from './mapOrders'

const findCompletedOrderTx = (transactions: TransactionInfo[], wallet: YoroiWallet): MappedCompleteOrder[] => {
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
      const metadata = JSON.parse(result.metadata as string)

      const buyTokenInfo = useTokenInfo({wallet, tokenId: metadata.buyTokenId})
      const sellTokenInfo = useTokenInfo({wallet, tokenId: metadata.sellTokenId})
      const formattedBuyQuantity = Quantities.format(metadata.buyQuantity, buyTokenInfo.decimals ?? 0)
      const formattedSellQuantity = Quantities.format(metadata.sellQuantity, sellTokenInfo.decimals ?? 0)
      const tokenPrice = asQuantity(new BigNumber(metadata.sellQuantity).dividedBy(metadata.buyQuantity).toString())

      const mappedResult: MappedCompleteOrder = {
        id: result.id,
        date: result?.date ?? '',
        provider: metadata.provider,
        sellLabel: sellTokenInfo?.ticker ?? sellTokenInfo?.name ?? '-',
        sellQuantity: formattedSellQuantity,
        sellTokenId: metadata.sellTokenId,
        buyLabel: buyTokenInfo?.ticker ?? buyTokenInfo?.name ?? '-',
        buyQuantity: formattedBuyQuantity,
        buyTokenId: metadata.buyTokenId,
        txLink: NETWORK_CONFIG.EXPLORER_URL_FOR_TX(metadata.buyTokenId),
        tokenPrice: Quantities.format(tokenPrice, sellTokenInfo.decimals ?? 0, MAX_DECIMALS),
      }
      return acc.concat(mappedResult)
    }
    return acc
  }, [] as Array<MappedCompleteOrder>)

  return filteredTx
}

export const CompletedOrders = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const [hiddenInfoOpenId, setHiddenInfoOpenId] = React.useState<string | null>(null)

  const transactionsInfos = useTransactionInfos(wallet)

  const completeOrders = findCompletedOrderTx(Object.values(transactionsInfos), wallet)

  const intl = useIntl()

  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.swapConfirmedPageViewed({swap_tab: 'Completed Orders'})
    }, [track]),
  )

  return (
    <>
      <ScrollView style={styles.container}>
        {completeOrders?.map((order) => {
          const id = order.id
          const expanded = id === hiddenInfoOpenId
          const sellIcon = <TokenIcon wallet={wallet} tokenId={order.sellTokenId} variant="swap" />
          const buyIcon = <TokenIcon wallet={wallet} tokenId={order.buyTokenId} variant="swap" />
          return (
            <ExpandableInfoCard
              key={id}
              info={
                <HiddenInfo
                  txId={order.id}
                  total={`${order.buyQuantity} ${order.buyLabel}`}
                  txLink={order.txLink}
                  provider={order.provider}
                />
              }
              header={
                <Header
                  onPress={() => setHiddenInfoOpenId(hiddenInfoOpenId !== id ? id : null)}
                  assetFromLabel={order.sellLabel}
                  assetToLabel={order.buyLabel}
                  assetFromIcon={sellIcon}
                  assetToIcon={buyIcon}
                  expanded={expanded}
                />
              }
              expanded={expanded}
              withBoxShadow
            >
              <MainInfo
                tokenPrice={order.tokenPrice}
                sellLabel={order.sellLabel}
                tokenAmount={`${order.sellQuantity} ${order.sellLabel}`}
                txTimeCreated={intl.formatDate(new Date(order.date), {dateStyle: 'short', timeStyle: 'short'})}
              />
            </ExpandableInfoCard>
          )
        })}
      </ScrollView>

      <Counter style={styles.counter} counter={completeOrders?.length ?? 0} customText={strings.listCompletedOrders} />
    </>
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
  txLink,
  provider,
}: {
  total: string
  txId: string
  txLink: string
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
          value: <TxLink txId={shortenedTxId} txLink={txLink} />,
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

const TxLink = ({txLink, txId}: {txLink: string; txId: string}) => {
  return (
    <TouchableOpacity onPress={() => Linking.openURL(txLink)} style={styles.txLink}>
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
