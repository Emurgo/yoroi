import {useExchange} from '@yoroi/exchange'
import {atoms as a} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import * as React from 'react'
import {Linking, View, ViewStyle} from 'react-native'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {Button} from '~/ui/Button/Button'
import {useStrings} from '../../common/useStrings'

export const CreateExchangeButton = ({
  style,
  disabled,
  onPress,
}: {
  style: ViewStyle
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
      ? strings.createOrderPreprodFaucetButtonText
      : strings.proceed
    : strings.proceed

  const handleOnPress = () => {
    if (isPreprod && isBuy) {
      handleOnPressOnPreprod()
      return
    }

    onPress()
  }

  return (
    <View style={[a.px_lg, a.pt_lg, style]}>
      <Button
        testID="rampOnOffButton"
        title={title}
        onPress={handleOnPress}
        disabled={disabled}
      />
    </View>
  )
}

const handleOnPressOnPreprod = () => {
  Linking.openURL('https://docs.cardano.org/cardano-testnets/tools/faucet/')
}
