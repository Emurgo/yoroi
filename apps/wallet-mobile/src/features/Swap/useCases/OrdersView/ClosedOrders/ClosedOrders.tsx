import React from 'react'
import {StyleSheet, View} from 'react-native'

import {Icon, Spacer, Text} from '../../../../../components'
// import {BottomSheet} from '../../../../../components/BottomSheet'
import {COLORS} from '../../../../../theme'
import {ExpandableInfoCard} from '../../../common/SelectPool/ExpendableCard'
import {OpenOrderListType} from '../OrdersView'

const mockOpenOrders: OpenOrderListType = [
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
        label: 'Min ADA',
        value: '2 ADA',
      },
      {
        label: 'Min Received',
        value: '2.99 USDA',
      },
      {
        label: 'Fees',
        value: '2 ADA',
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
        label: 'Min ADA',
        value: '2 ADA',
      },
      {
        label: 'Min Received',
        value: '2.99 USDA',
      },
      {
        label: 'Fees',
        value: '2 ADA',
      },
    ],
    buttonAction: () => {
      console.log('button pressed')
    },
  },
]

export const ClosedOrders = () => {
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
