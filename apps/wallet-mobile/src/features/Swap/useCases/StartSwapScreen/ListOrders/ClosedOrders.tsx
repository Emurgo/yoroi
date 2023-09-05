import React from 'react'
import {Linking, StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon, Spacer, Text} from '../../../../../components'
import {COLORS} from '../../../../../theme'
import {
  ExpandableInfoCard,
  ExpandableInfoCardSkeleton,
} from '../../../common/SelectPool/ExpendableCard/ExpandableInfoCard'
import {useStrings} from '../../../common/strings'
import {OrderProps} from './mapOrders'

export const ClosedOrders = ({orders}: {orders: Array<OrderProps>}) => {
  const strings = useStrings()

  return (
    <View style={styles.container}>
      <View style={styles.flex}>
        {orders.map((order) => (
          <ExpandableInfoCard
            key={`${order.assetFromLabel}-${order.assetToLabel}-${order.date}`}
            mainInfo={[
              {label: strings.listOrdersSheetAssetPrice, value: order.tokenPrice},
              {label: strings.listOrdersSheetAssetAmount, value: order.tokenAmount},
            ]}
            label={<Label assetFromLabel={order.assetFromLabel} assetToLabel={order.assetToLabel} />}
            hiddenInfo={[
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
            ]}
            withBoxShadow
          />
        ))}
      </View>
    </View>
  )
}

export const ClosedOrdersSkeleton = () => (
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

const Label = ({assetFromLabel, assetToLabel}: {assetFromLabel: string; assetToLabel: string}) => {
  return (
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
  label: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txLink: {
    paddingVertical: 16,
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
    paddingVertical: 16,
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
})
