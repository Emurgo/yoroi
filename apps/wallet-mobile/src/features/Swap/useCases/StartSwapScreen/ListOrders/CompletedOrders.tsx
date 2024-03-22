import {useFocusEffect} from '@react-navigation/native'
import {getPoolUrlByProvider, useSwapOrdersByStatusCompleted} from '@yoroi/swap'
import {useTheme} from '@yoroi/theme'
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
import {useSearch} from '../../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {useTokenInfos} from '../../../../../yoroi-wallets/hooks'
import {asQuantity, openInExplorer, Quantities} from '../../../../../yoroi-wallets/utils'
import {PRICE_PRECISION} from '../../../common/constants'
import {Counter} from '../../../common/Counter/Counter'
import {EmptyCompletedOrdersIllustration} from '../../../common/Illustrations/EmptyCompletedOrdersIllustration'
import {LiquidityPool} from '../../../common/LiquidityPool/LiquidityPool'
import {PoolIcon} from '../../../common/PoolIcon/PoolIcon'
import {useStrings} from '../../../common/strings'

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

export const CompletedOrders = () => {
  const strings = useStrings()
  const styles = useStyles()
  const wallet = useSelectedWallet()

  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.swapConfirmedPageViewed({swap_tab: 'Completed Orders'})
    }, [track]),
  )

  const completedOrders = useSwapOrdersByStatusCompleted()
  const tokenIds = React.useMemo(
    () => _.uniq(completedOrders?.flatMap((o) => [o.from.tokenId, o.to.tokenId])),
    [completedOrders],
  )
  const tokenInfos = useTokenInfos({wallet, tokenIds})
  const {search} = useSearch()

  const filteredOrders = React.useMemo(
    () =>
      completedOrders.filter((order) => {
        const sellTokenInfo = tokenInfos.find((tokenInfo) => tokenInfo.id === order.from.tokenId)
        const buyTokenInfo = tokenInfos.find((tokenInfo) => tokenInfo.id === order.to.tokenId)

        const sellLabel = sellTokenInfo?.ticker ?? sellTokenInfo?.name ?? '-'
        const buyLabel = buyTokenInfo?.ticker ?? buyTokenInfo?.name ?? '-'
        const searchLower = search.toLocaleLowerCase()
        return sellLabel.toLocaleLowerCase().includes(searchLower) || buyLabel.toLocaleLowerCase().includes(searchLower)
      }),
    [completedOrders, search, tokenInfos],
  )

  return (
    <>
      <View style={styles.container}>
        <FlatList
          contentContainerStyle={{paddingTop: 10, paddingHorizontal: 16}}
          data={filteredOrders}
          renderItem={({item}: {item: Swap.CompletedOrder}) => <ExpandableOrder tokenInfos={tokenInfos} order={item} />}
          keyExtractor={(item) => item.txHash}
          ListEmptyComponent={<ListEmptyComponent completedOrders={completedOrders} />}
        />
      </View>

      <Counter
        style={styles.counter}
        openingText={strings.youHave}
        counter={filteredOrders?.length ?? 0}
        closingText={strings.listCompletedOrders}
      />
    </>
  )
}

export const ExpandableOrder = ({
  order,
  tokenInfos,
}: {
  order: Swap.CompletedOrder
  tokenInfos: Array<Balance.TokenInfo>
}) => {
  const [hiddenInfoOpenId, setHiddenInfoOpenId] = React.useState<string | null>(null)
  const wallet = useSelectedWallet()
  const intl = useIntl()
  const id = order.txHash
  const expanded = id === hiddenInfoOpenId
  const sellIcon = <TokenIcon wallet={wallet} tokenId={order.from.tokenId} variant="swap" />
  const buyIcon = <TokenIcon wallet={wallet} tokenId={order.to.tokenId} variant="swap" />
  const buyTokenInfo = tokenInfos.find((tokenInfo) => tokenInfo.id === order.to.tokenId)
  const sellTokenInfo = tokenInfos.find((tokenInfo) => tokenInfo.id === order.from.tokenId)

  const buyQuantity = Quantities.format(order.to.quantity, buyTokenInfo?.decimals ?? 0)
  const sellQuantity = Quantities.format(order.from.quantity, sellTokenInfo?.decimals ?? 0)
  const tokenPrice = asQuantity(new BigNumber(order.from.quantity).dividedBy(order.to.quantity).toString())
  const denomination = (sellTokenInfo?.decimals ?? 0) - (buyTokenInfo?.decimals ?? 0)
  const marketPrice = Quantities.format(tokenPrice ?? Quantities.zero, denomination, PRICE_PRECISION)
  const buyLabel = buyTokenInfo?.ticker ?? buyTokenInfo?.name ?? '-'
  const sellLabel = sellTokenInfo?.ticker ?? sellTokenInfo?.name ?? '-'

  return (
    <ExpandableInfoCard
      key={id}
      info={
        <HiddenInfo
          txId={id}
          total={`${sellQuantity} ${sellLabel}`}
          onTxPress={() => openInExplorer(id, wallet.networkId)}
          provider={order.provider}
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
        buyLabel={buyLabel}
        tokenAmount={`${buyQuantity} ${buyLabel}`}
        txTimeCreated={intl.formatDate(new Date(order.placedAt), {
          dateStyle: 'short',
          timeStyle: 'medium',
          hour12: false,
        })}
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
  const styles = useStyles()
  return (
    <HeaderWrapper expanded={expanded} onPress={onPress}>
      <View style={styles.label}>
        {assetFromIcon}

        <Spacer width={4} />

        <Text style={styles.headerLabel}>{assetFromLabel}</Text>

        <Text style={styles.headerLabel}>/</Text>

        <Spacer width={4} />

        {assetToIcon}

        <Spacer width={4} />

        <Text style={styles.headerLabel}>{assetToLabel}</Text>
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
          value: (
            <LiquidityPool
              liquidityPoolIcon={<PoolIcon providerId={provider} size={28} />}
              liquidityPoolName={capitalize(provider)}
              poolUrl={getPoolUrlByProvider(provider)}
            />
          ),
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
  buyLabel,
  txTimeCreated,
}: {
  tokenPrice: string
  sellLabel: string
  buyLabel: string
  tokenAmount: string
  txTimeCreated: string
}) => {
  const strings = useStrings()
  const orderInfo = [
    {label: strings.listOrdersSheetAssetPrice, value: `${tokenPrice} ${sellLabel}/${buyLabel}`},
    {label: strings.listOrdersSheetAssetAmount, value: tokenAmount},
    {label: strings.listOrdersTimeCompleted, value: txTimeCreated},
  ]
  return (
    <View>
      {orderInfo.map((item, index) => (
        <MainInfoWrapper key={index} label={item.label} value={item.value} isLast={index === orderInfo.length - 1} />
      ))}
    </View>
  )
}

export const CompletedOrdersSkeleton = () => {
  const styles = useStyles()
  return (
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
}

const TxLink = ({onTxPress, txId}: {onTxPress: () => void; txId: string}) => {
  const styles = useStyles()
  return (
    <TouchableOpacity onPress={onTxPress} style={styles.txLink}>
      <Text style={styles.txLinkText}>{txId}</Text>
    </TouchableOpacity>
  )
}

const ListEmptyComponent = ({completedOrders}: {completedOrders: Swap.CompletedOrderResponse}) => {
  const {search: assetSearchTerm, visible: isSearching} = useSearch()

  if (isSearching && assetSearchTerm.length > 0 && completedOrders.length > 0) return <EmptySearchResult />

  return <NoOrdersYet />
}

const NoOrdersYet = () => {
  const strings = useStrings()
  const styles = useStyles()
  return (
    <View style={styles.notOrdersYetContainer}>
      <Spacer height={80} />

      <EmptyCompletedOrdersIllustration style={styles.illustration} />

      <Spacer height={15} />

      <Text style={styles.contentText}>{strings.emptyCompletedOrders}</Text>
    </View>
  )
}

const EmptySearchResult = () => {
  return null
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color.gray.min,
    },
    flex: {
      flex: 1,
    },
    txLink: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    txLinkText: {
      color: color.primary[400],
      ...typography['body-1-l-regular'],
      textDecorationLine: 'underline',
    },
    label: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerLabel: {
      color: color.gray.max,
      ...typography['body-2-m-medium'],
    },
    counter: {
      paddingVertical: 16,
    },
    illustration: {
      flex: 1,
      alignSelf: 'center',
      width: 280,
      height: 224,
    },
    notOrdersYetContainer: {
      flex: 1,
      textAlign: 'center',
    },
    contentText: {
      flex: 1,
      textAlign: 'center',
      ...typography['body-2-m-medium'],
      color: color.gray.max,
      fontSize: 20,
    },
  })
  return styles
}
