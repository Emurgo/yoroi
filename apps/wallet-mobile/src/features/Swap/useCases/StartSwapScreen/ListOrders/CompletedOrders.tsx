import {useOrderByStatusCompleted} from '@yoroi/swap'
import React from 'react'
import {Linking, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native'

import {
  ExpandableInfoCard,
  ExpandableInfoCardSkeleton,
  HeaderWrapper,
  HiddenInfoWrapper,
  Icon,
  MainInfoWrapper,
  Spacer,
  Text,
} from '../../../../../components'
import {useSearch} from '../../../../../Search/SearchContext'
import {COLORS} from '../../../../../theme'
import {Counter} from '../../../common/Counter/Counter'
import {useStrings} from '../../../common/strings'
import {mapOrders, OrderProps} from './mapOrders'

export const CompletedOrders = () => {
  const strings = useStrings()
  const {search} = useSearch()
  const [hiddenInfoOpenId, setHiddenInfoOpenId] = React.useState<string | null>(null)

  const data = useOrderByStatusCompleted({
    onError: (err) => {
      console.log(err)
    },
  })

  const orders = mapOrders(data).filter(
    ({assetFromLabel, assetToLabel}) =>
      assetFromLabel.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      assetToLabel.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  )

  return (
    <>
      <ScrollView style={styles.container}>
        {orders.map((order) => {
          const id = `${order.assetFromLabel}-${order.assetToLabel}-${order.date}`
          const extended = id === hiddenInfoOpenId
          return (
            <ExpandableInfoCard
              key={`${order.assetFromLabel}-${order.assetToLabel}-${order.date}`}
              adornment={<HiddenInfo id={id} order={order} />}
              header={
                <Header
                  onPress={() => setHiddenInfoOpenId(hiddenInfoOpenId !== id ? id : null)}
                  assetFromLabel={order.assetFromLabel}
                  assetToLabel={order.assetToLabel}
                  extended={extended}
                />
              }
              extended={extended}
              withBoxShadow
            >
              <MainInfo order={order} />
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
  extended,
  onPress,
}: {
  assetFromLabel: string
  assetToLabel: string
  extended: boolean
  onPress: () => void
}) => {
  return (
    <HeaderWrapper extended={extended} onPress={onPress}>
      <View style={styles.label}>
        <Icon.YoroiNightly size={24} />

        <Spacer width={4} />

        <Text>{assetFromLabel}</Text>

        <Text>/</Text>

        <Spacer width={4} />

        <Icon.Assets size={24} />

        <Spacer width={4} />

        <Text>{assetToLabel}</Text>
      </View>
    </HeaderWrapper>
  )
}

const HiddenInfo = ({order}: {id: string; order: OrderProps}) => {
  const strings = useStrings()
  return (
    <View>
      {[
        {
          label: strings.listOrdersTotal,
          value: order.total,
        },
        {
          label: strings.listOrdersLiquidityPool,
          value: (
            <LiquidityPool
              liquidityPoolIcon={order.liquidityPoolIcon}
              liquidityPoolName={order.liquidityPoolName}
              poolUrl={order.poolUrl}
            />
          ),
        },
        {
          label: strings.listOrdersTimeCreated,
          value: order.date,
        },
        {
          label: strings.listOrdersTxId,
          value: <TxLink txId={order.txId} txLink={order.txLink} />,
        },
      ].map((item) => (
        <HiddenInfoWrapper key={item.label} value={item.value} label={item.label} />
      ))}
    </View>
  )
}

const MainInfo = ({order}: {order: OrderProps}) => {
  const strings = useStrings()
  return (
    <View>
      {[
        {label: strings.listOrdersSheetAssetPrice, value: order.tokenPrice},
        {label: strings.listOrdersSheetAssetAmount, value: order.tokenAmount},
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

const LiquidityPool = ({
  liquidityPoolIcon,
  liquidityPoolName,
  poolUrl,
}: {
  liquidityPoolIcon: React.ReactNode
  liquidityPoolName: string
  poolUrl: string
}) => {
  return (
    <View style={styles.liquidityPool}>
      {liquidityPoolIcon}

      <Spacer width={3} />

      <TouchableOpacity onPress={() => Linking.openURL(poolUrl)} style={styles.liquidityPoolLink}>
        <Text style={styles.liquidityPoolText}>{liquidityPoolName}</Text>
      </TouchableOpacity>
    </View>
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
  liquidityPool: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liquidityPoolLink: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  liquidityPoolText: {
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
