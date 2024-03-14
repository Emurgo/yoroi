import {Providers} from '@yoroi/exchange'
import {Exchange} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {ButtonActionGroup} from '../../../common/ButtonActionGroup/ButtonActionGroup'
import {OrderType, useExchange} from '../../../common/ExchangeProvider'
import {useStrings} from '../../../common/useStrings'

export const SelectBuyOrSell = () => {
  const strings = useStrings()
  const {provider} = useExchange()
  const features: Exchange.ProviderFeatures = Providers[provider]

  const orderTypeLabels: ReadonlyArray<{label: string; value: OrderType; enabled: boolean}> = [
    {label: strings.buyCrypto, value: 'buy', enabled: !!features.buy},
    {label: strings.sellCrypto, value: 'sell', enabled: !!features.sell},
  ] as const

  const {orderType, orderTypeChanged} = useExchange()

  const handleSelectAction = (action: OrderType) => {
    orderTypeChanged(action)
  }

  return (
    <View style={styles.buttonsGroup}>
      <ButtonActionGroup
        onSelect={(label) => handleSelectAction(label)}
        selected={orderType}
        labels={orderTypeLabels.filter((orderTypeLabel) => orderTypeLabel.enabled)}
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
