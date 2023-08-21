import React, {useState} from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'

import {Boundary} from '../../../../../components'
import {COLORS} from '../../../../../theme'
import {ButtonGroup} from '../../../common/ButtonGroup/ButtonGroup'
import {useStrings} from '../../../common/strings'
import {ClosedOrders} from './ClosedOrders'
import {OpenOrders} from './OpenOrders'

type Item = {
  label: string
  value: string
}

type SwapOrder = {
  label: React.ReactNode
  mainInfo: Item[]
  hiddenInfo: Item[]
  buttonAction: () => void
  buttonText?: string
}

export type OpenOrderListType = SwapOrder[]

export const ListOrders = () => {
  const strings = useStrings()

  const [orderStatusIndex, setOrderStatusIndex] = useState<number>(0)
  // TODO: @SorinC6: is it completed or closed orders?
  const orderStatusLabels = [strings.openOrders, strings.completedOrders]
  const handleSelectOrderStatus = (index: number) => {
    setOrderStatusIndex(index)
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.keyboard}>
        <View style={styles.buttonsGroup}>
          <ButtonGroup labels={orderStatusLabels} onSelect={handleSelectOrderStatus} selected={orderStatusIndex} />
        </View>

        <Boundary>{orderStatusIndex === 0 ? <OpenOrders /> : <ClosedOrders />}</Boundary>
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
