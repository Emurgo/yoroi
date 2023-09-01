import React, {useState} from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary} from '../../../../../components'
import {useSearch, useSearchOnNavBar} from '../../../../../Search/SearchContext'
import {COLORS} from '../../../../../theme'
import {ButtonGroup} from '../../../common/ButtonGroup/ButtonGroup'
import {Counter} from '../../../common/Counter/Counter'
import {useStrings} from '../../../common/strings'
import {ClosedOrders} from './ClosedOrders'
import {getMockOpenOrder} from './mocks'
import {OpenOrders} from './OpenOrders'

type Order = {
  tokenPrice: string
  tokenAmount: string
  assetFromLabel: string
  assetFromIcon: React.ReactNode
  assetToLabel: string
  assetToIcon: React.ReactNode
  navigateTo?: () => void
  onPress?: () => void
  buttonText?: string
  withBoxShadow?: boolean
  date: string
  liquidityPoolIcon: React.ReactNode
  liquidityPoolName: string
  txId: string
  total: string
  poolUrl: string
  txLink: string
}

export type Orders = Array<Order>

export const ListOrders = () => {
  const strings = useStrings()

  const [orderStatusIndex, setOrderStatusIndex] = useState<number>(0)
  // TODO: @SorinC6: is it completed or closed orders?
  const orderStatusLabels = [strings.openOrders, strings.completedOrders]
  const handleSelectOrderStatus = (index: number) => {
    setOrderStatusIndex(index)
  }

  useSearchOnNavBar({
    placeholder: strings.searchTokens,
    title: strings.swapTitle,
  })

  const {search} = useSearch()
  // TODO: api data mapper
  const mockOpenOrders = getMockOpenOrder()

  const orders = mockOpenOrders.filter(
    ({assetFromLabel, assetToLabel}) =>
      assetFromLabel.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
      assetToLabel.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  )

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <ScrollView style={styles.keyboard}>
        <View style={styles.buttonsGroup}>
          <ButtonGroup labels={orderStatusLabels} onSelect={handleSelectOrderStatus} selected={orderStatusIndex} />
        </View>

        <Boundary>
          {/* TODO: add loading prop */}
          {orderStatusIndex === 0 ? <OpenOrders orders={orders} /> : <ClosedOrders orders={orders} />}
        </Boundary>
      </ScrollView>

      <Counter
        counter={orders.length}
        customText={orderStatusIndex === 0 ? strings.listOpenOrders : strings.listCompletedOrders}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  buttonsGroup: {
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  keyboard: {
    flex: 1,
  },
})
