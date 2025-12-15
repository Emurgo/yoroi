import {useExchange} from '@yoroi/exchange'
import {Chain} from '@yoroi/types'
import {useWalletManager} from '@yoroi/wallet-manager'

import * as React from 'react'
import {Linking} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'

export const CreateExchangeButton = ({
  disabled,
  onPress,
}: {
  disabled: boolean
  onPress: () => void
}) => {
  const {orderType} = useExchange()
  const strings = useStrings()
  const {
    selected: {network},
  } = useWalletManager()

  const isPreprod = network === Chain.Network.Preprod
  const isBuy = orderType === 'buy'

  const title = isBuy
    ? isPreprod
      ? strings.exchange.createOrderPreprodFaucetButtonText
      : strings.global.proceed
    : strings.global.proceed

  const handleOnPress = () => {
    if (isPreprod && isBuy) {
      handleOnPressOnPreprod()
      return
    }

    onPress()
  }

  return (
    <Button
      testID="rampOnOffButton"
      title={title}
      onPress={handleOnPress}
      disabled={disabled}
    />
  )
}

const handleOnPressOnPreprod = () => {
  Linking.openURL('https://docs.cardano.org/cardano-testnets/tools/faucet/')
}
