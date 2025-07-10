import {OrderType, useExchange} from '@yoroi/exchange'
import {atoms as a} from '@yoroi/theme'
import * as React from 'react'
import {View} from 'react-native'

import {ButtonActionGroup} from '../../../common/ButtonActionGroup/ButtonActionGroup'
import {useStrings} from '../../../common/useStrings'

export const SelectBuyOrSell = ({disabled}: {disabled?: boolean}) => {
  const strings = useStrings()

  const orderTypeLabels: ReadonlyArray<{label: string; value: OrderType}> = [
    {label: strings.buyCrypto, value: 'buy'},
    {label: strings.sellCrypto, value: 'sell'},
  ] as const

  const {orderType, orderTypeChanged} = useExchange()

  const handleSelectAction = (action: OrderType) => {
    orderTypeChanged(action)
  }

  return (
    <View style={[a.flex_row, a.justify_between]}>
      <ButtonActionGroup
        disabled={disabled}
        onSelect={(label) => handleSelectAction(label)}
        selected={orderType}
        labels={orderTypeLabels}
      />
    </View>
  )
}
