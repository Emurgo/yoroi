import {useExchange} from '@yoroi/exchange'
import {useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import * as React from 'react'
import {Linking, StyleSheet, View, ViewStyle} from 'react-native'

import {Button} from '../../../../../components/Button/Button'
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
  const isBuy = orderType === 'buy'

  const title = isBuy
    ? isPreprod
      ? strings.createOrderPreprodFaucetButtonText
      : isSancho
      ? strings.createOrderSanchonetFaucetButtonText
      : strings.proceed
    : strings.proceed

  const handleOnPress = () => {
    if (isPreprod && isBuy) {
      handleOnPressOnPreprod()
      return
    }

    if (isSancho && isBuy) {
      handleOnPressOnSanchonet()
      return
    }

    onPress()
  }

  return (
    <View style={[styles.actions, style]}>
      <Button testID="rampOnOffButton" shelleyTheme title={title} onPress={handleOnPress} disabled={disabled} />
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
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    actions: {
      ...atoms.px_lg,
      ...atoms.pt_lg,
    },
  })
  return styles
}
