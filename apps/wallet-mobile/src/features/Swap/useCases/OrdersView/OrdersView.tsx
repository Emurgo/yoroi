import React, {useState} from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'

import {Text} from '../../../../components'
import {COLORS} from '../../../../theme'
import {ButtonGroup} from '../../common/ButtonGroup'
import {useStrings} from '../../common/strings'
import {OpenOrders} from './OpenOrders'

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

        <View>{orderView === 'Open orders' ? <OpenOrders /> : <Text>CLosed Orders</Text>}</View>
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
