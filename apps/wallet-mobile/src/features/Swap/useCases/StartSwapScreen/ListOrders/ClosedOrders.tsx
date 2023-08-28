import {useSwap} from '@yoroi/swap'
import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Icon, Spacer, Text} from '../../../../../components'
import {useSelectedWallet} from '../../../../../SelectedWallet'
// import {BottomSheet} from '../../../../../components/BottomSheet'
import {COLORS} from '../../../../../theme'
import {useTokenInfo} from '../../../../../yoroi-wallets/hooks'
import {Quantities} from '../../../../../yoroi-wallets/utils'
import {ExpandableInfoCard} from '../../../common/SelectPool/ExpendableCard/ExpandableInfoCard'
import {useStrings} from '../../../common/strings'
import {OpenOrderListType} from './ListOrders'

const getMockOpenOrder: (strings, poolFee) => OpenOrderListType = (strings, poolFee) => [
  {
    label: (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Icon.YoroiNightly size={24} />

        <Spacer width={4} />

        <Text>ADA/</Text>

        <Spacer width={4} />

        <Icon.Assets size={24} />

        <Spacer width={4} />

        <Text>USDA</Text>
      </View>
    ),

    mainInfo: [
      {label: 'Token price', value: '3 ADA'},
      {label: 'Token amount', value: '3 USDA'},
    ],
    hiddenInfo: [
      {
        label: strings.swapMinAdaTitle,
        value: '2 ADA', // TODO add real value
        info: strings.swapMinAda,
      },
      {
        label: strings.swapMinReceivedTitle,
        value: '2.99 USDA', // TODO add real value
        info: strings.swapMinReceived,
      },
      {
        label: strings.swapFeesTitle,
        value: String(poolFee),
        info: strings.swapFees,
      },
    ],
    buttonAction: () => {
      console.log('button pressed')
    },
  },
  {
    label: (
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Icon.YoroiNightly size={24} />

        <Spacer width={4} />

        <Text>ADA/</Text>

        <Spacer width={4} />

        <Icon.Assets size={24} />

        <Spacer width={4} />

        <Text>USDA</Text>
      </View>
    ),

    mainInfo: [
      {label: 'Token price', value: '3 ADA'},
      {label: 'Token amount', value: '3 USDA'},
    ],
    hiddenInfo: [
      {
        label: strings.swapMinAdaTitle,
        value: '2 ADA',
        info: strings.swapMinAda,
      },
      {
        label: strings.swapMinReceivedTitle,
        value: '2.99 USDA', // TODO add real value
        info: strings.swapMinReceived,
      },
      {
        label: strings.swapFeesTitle,
        value: String(poolFee),
        info: strings.swapFees,
      },
    ],
    buttonAction: () => {
      console.log('button pressed')
    },
  },
]

export const ClosedOrders = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const {createOrder} = useSwap()
  const {selectedPool, amounts} = createOrder
  const sellTokenInfo = useTokenInfo({wallet, tokenId: amounts.sell.tokenId})
  const calculatedFee = (Number(selectedPool?.fee) / 100) * Number(createOrder.amounts.sell.quantity)
  const poolFee = Quantities.denominated(`${calculatedFee}`, sellTokenInfo.decimals ?? 0)
  const mockOpenOrders = getMockOpenOrder(strings, poolFee)

  return (
    <View style={styles.container}>
      {/* <BottomSheet /> */}

      <View style={styles.flex}>
        {mockOpenOrders.map((order, index) => (
          <ExpandableInfoCard
            key={`${order.label}  ${index}`}
            label={order.label}
            mainInfo={order.mainInfo}
            hiddenInfo={order.hiddenInfo}
            buttonAction={order.buttonAction}
            withBoxShadow
          />
        ))}
      </View>
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
})
