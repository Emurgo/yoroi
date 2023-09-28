import {useSwapOrdersByStatusCompleted} from '@yoroi/swap'
import _ from 'lodash'
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
import {useLanguage} from '../../../../../i18n'
import {useSearch} from '../../../../../Search/SearchContext'
import {useSelectedWallet} from '../../../../../SelectedWallet'
import {COLORS} from '../../../../../theme'
import {useTokenInfos, useTransactionInfos} from '../../../../../yoroi-wallets/hooks'
import {Counter} from '../../../common/Counter/Counter'
import {useStrings} from '../../../common/strings'
import {mapOrders} from './mapOrders'

export const CompletedOrders = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const [hiddenInfoOpenId, setHiddenInfoOpenId] = React.useState<string | null>(null)

  const transactionsInfos = useTransactionInfos(wallet)
  const {search} = useSearch()
  const {numberLocale} = useLanguage()
  const intl = useIntl()

  const orders = useSwapOrdersByStatusCompleted()

  const tokenIds: Array<string> = React.useMemo(
    () => _.uniq(orders.flatMap((o) => [o.from.tokenId, o.to.tokenId])),
    [orders],
  )
  const tokenInfos = useTokenInfos({wallet, tokenIds})
  const normalizedOrders = React.useMemo(
    () => mapOrders(orders, tokenInfos, numberLocale, Object.values(transactionsInfos)),
    [orders, tokenInfos, numberLocale, transactionsInfos],
  )

  const filteredOrders = React.useMemo(
    () =>
      normalizedOrders.filter((order) => {
        const searchLower = search.toLocaleLowerCase()
        return (
          order.assetFromLabel.toLocaleLowerCase().includes(searchLower) ||
          order.assetToLabel.toLocaleLowerCase().includes(searchLower)
        )
      }),
    [normalizedOrders, search],
  )

  return (
    <>
      <ScrollView style={styles.container}>
        {filteredOrders.map((order) => {
          const id = `${order.assetFromLabel}-${order.assetToLabel}-${order.date}`
          const expanded = id === hiddenInfoOpenId
          const fromIcon = <TokenIcon wallet={wallet} tokenId={order.fromTokenInfo?.id ?? ''} variant="swap" />
          const toIcon = <TokenIcon wallet={wallet} tokenId={order.toTokenInfo?.id ?? ''} variant="swap" />
          return (
            <ExpandableInfoCard
              key={`${order.assetFromLabel}-${order.assetToLabel}-${order.date}`}
              info={
                <HiddenInfo
                  txId={order.txId}
                  total={`${order.total} ${order.assetFromLabel}`}
                  txLink={order.txLink}
                  date={intl.formatDate(new Date(order.date), {dateStyle: 'short', timeStyle: 'short'})}
                />
              }
              header={
                <Header
                  onPress={() => setHiddenInfoOpenId(hiddenInfoOpenId !== id ? id : null)}
                  assetFromLabel={order.assetFromLabel}
                  assetToLabel={order.assetToLabel}
                  assetFromIcon={fromIcon}
                  assetToIcon={toIcon}
                  expanded={expanded}
                />
              }
              expanded={expanded}
              withBoxShadow
            >
              <MainInfo
                tokenAmount={`${order.tokenAmount} ${order.assetToLabel}`}
                tokenPrice={`${order.tokenPrice} ${order.assetFromLabel}`}
              />
            </ExpandableInfoCard>
          )
        })}
      </ScrollView>

      <Counter counter={orders?.length ?? 0} customText={strings.listCompletedOrders} />
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

const HiddenInfo = ({total, date, txId, txLink}: {total: string; date: string; txId: string; txLink: string}) => {
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
          label: strings.listOrdersTimeCreated,
          value: date,
        },
        {
          label: strings.listOrdersTxId,
          value: <TxLink txId={shortenedTxId} txLink={txLink} />,
        },
      ].map((item) => (
        <HiddenInfoWrapper key={item.label} value={item.value} label={item.label} />
      ))}
    </View>
  )
}

const MainInfo = ({tokenPrice, tokenAmount}: {tokenPrice: string; tokenAmount: string}) => {
  const strings = useStrings()
  return (
    <View>
      {[
        {label: strings.listOrdersSheetAssetPrice, value: tokenPrice},
        {label: strings.listOrdersSheetAssetAmount, value: tokenAmount},
      ].map((item, index) => (
        <MainInfoWrapper key={index} label={item.label} value={item.value} isLast={index === 1} />
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
