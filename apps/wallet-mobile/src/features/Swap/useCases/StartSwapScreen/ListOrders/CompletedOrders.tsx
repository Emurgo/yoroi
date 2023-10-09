import {useFocusEffect} from '@react-navigation/native'
import {Swap} from '@yoroi/types'
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
import {useTransactionInfos} from '../../../../../yoroi-wallets/hooks'
import {TransactionInfo} from '../../../../../yoroi-wallets/types'
import {Counter} from '../../../common/Counter/Counter'
import {PoolIcon} from '../../../common/PoolIcon/PoolIcon'
import {useStrings} from '../../../common/strings'
import {mapCompletedOrders} from './mapOrders'

const findCompletedOrderTx = (transactions: TransactionInfo[]): TransactionInfo[] => {
  const sentTransactions = transactions.filter((tx) => tx.direction === 'SENT')
  const receivedTransactions = transactions.filter((tx) => tx.direction === 'RECEIVED')

  const filteredTx = sentTransactions.filter((sentTx) => {
    return receivedTransactions.filter((receivedTx) => {
      return sentTx.id === receivedTx.inputs[1]?.id?.slice(0, -1)
    })
  })
  return filteredTx
}

export const CompletedOrders = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const [hiddenInfoOpenId, setHiddenInfoOpenId] = React.useState<string | null>(null)

  const transactionsInfos = useTransactionInfos(wallet)

  const completeOrders = findCompletedOrderTx(Object.values(transactionsInfos))

  const intl = useIntl()

  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.swapConfirmedPageViewed({swap_tab: 'Completed Orders'})
    }, [track]),
  )

  const normalizedOrders = mapCompletedOrders(completeOrders, wallet)

  return (
    <>
      <ScrollView style={styles.container}>
        {normalizedOrders?.map((order) => {
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

      <Counter counter={normalizedOrders?.length ?? 0} customText={strings.listCompletedOrders} />
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
})
