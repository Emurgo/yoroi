import React, {useState} from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'

import {Boundary} from '../../../../components'
import {COLORS} from '../../../../theme'
import {ButtonGroup} from '../../common/ButtonGroup'
import {useStrings} from '../../common/strings'
import {ClosedOrders} from './ClosedOrders/ClosedOrders'
import {OpenOrders} from './OpenOrders'

type Item = {
  label: string
  value: string
}

type SwapOrder = {
  label: JSX.Element
  mainInfo: Item[]
  hiddenInfo: Item[]
  buttonAction: () => void
  buttonText?: string
}

export type OpenOrderListType = SwapOrder[]

export const OrdersView = () => {
  const [orderView, setOrderView] = useState<string>('Open orders')
  const strings = useStrings()

  const handleButtonClick = (label: string) => {
    console.log('Button clicked!', label)
    setOrderView(label)
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.keyboard}>
        <View style={styles.buttonsGroup}>
          <ButtonGroup buttons={[strings.openOrders, strings.completedOrders]} onButtonPress={handleButtonClick} />
        </View>

        <Boundary>{orderView === 'Open orders' ? <OpenOrders /> : <ClosedOrders />}</Boundary>
      </ScrollView>
    </View>
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
