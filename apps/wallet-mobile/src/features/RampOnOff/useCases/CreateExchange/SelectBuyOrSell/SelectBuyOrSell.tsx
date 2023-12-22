import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {ButtonActionGroup} from '../../../common/ButtonActionGroup/ButtonActionGroup'
import {OrderType, useRampOnOff} from '../../../common/RampOnOffProvider'
import {useStrings} from '../../../common/useStrings'

export const SelectBuyOrSell = () => {
  const strings = useStrings()

  const orderTypeLables: ReadonlyArray<{label: string; value: OrderType}> = [
    {label: strings.buyCrypto, value: 'buy'},
    {label: strings.sellCrypto, value: 'sell'},
  ] as const

  const {orderType, orderTypeChanged} = useRampOnOff()

  const handleSelectAction = (action: OrderType) => {
    orderTypeChanged(action)
  }

  return (
    <View style={styles.buttonsGroup}>
      <ButtonActionGroup
        onSelect={(label) => handleSelectAction(label)}
        selected={orderType}
        labels={orderTypeLables}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  buttonsGroup: {
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
