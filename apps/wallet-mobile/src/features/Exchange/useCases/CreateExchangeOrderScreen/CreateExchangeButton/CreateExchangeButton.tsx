import {useExchange} from '@yoroi/exchange'
import {Chain} from '@yoroi/types'
import * as React from 'react'
import {Linking, StyleSheet, View, ViewStyle} from 'react-native'

import {Button} from '../../../../../components'
import {useWalletManager} from '../../../../WalletManager/context/WalletManagerProvider'
import {useStrings} from '../../../common/useStrings'

export const CreateExchangeButton = ({
  style,
  disabled,
  onPress,
}: {
  style: ViewStyle
  disabled: boolean
  onPress: () => void
}) => {
  const styles = useStyles()
  const {orderType} = useExchange()
  const strings = useStrings()
  const {
    selected: {network},
  } = useWalletManager()

  const isPreprod = network === Chain.Network.Preprod
  const isSancho = network === Chain.Network.Sancho

  const title =
    isPreprod && orderType === 'buy'
      ? strings.createOrderPreprodFaucetButtonText
      : isSancho && orderType === 'buy'
      ? strings.createOrderSanchonetFaucetButtonText
      : strings.proceed

  const handleOnPress = () => {
    if (isPreprod && orderType === 'buy') {
      handleOnPressOnPreprod()
      return
    }

    if (isSancho && orderType === 'buy') {
      handleOnPressOnSanchonet()
      return
    }

    onPress()
  }

  const isButtonDisabled = !(isPreprod || (isSancho && orderType === 'buy')) && disabled

  return (
    <View style={[styles.actions, style]}>
      <Button testID="rampOnOffButton" shelleyTheme title={title} onPress={handleOnPress} disabled={isButtonDisabled} />
    </View>
  )
}

const handleOnPressOnPreprod = () => {
  Linking.openURL('https://docs.cardano.org/cardano-testnets/tools/faucet/')
}

const handleOnPressOnSanchonet = () => {
  Linking.openURL('https://sancho.network/faucet/')
}

const useStyles = () => {
  const styles = StyleSheet.create({
    actions: {
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
  })
  return styles
}
