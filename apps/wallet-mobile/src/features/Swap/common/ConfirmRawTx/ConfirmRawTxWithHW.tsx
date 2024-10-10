import {useTheme} from '@yoroi/theme'
import {HW, Swap} from '@yoroi/types'
import React, {useState} from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'

import {Text} from '../../../../components/Text'
import {LedgerConnect} from '../../../../legacy/HW'
import {withBLE, withUSB} from '../../../../yoroi-wallets/hw/hwWallet'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {LedgerTransportSwitch} from '../../useCases/ConfirmTxScreen/LedgerTransportSwitch'
import {useCancelOrderWithHw} from '../helpers'
import {useStrings} from '../strings'
import {ActivityIndicator} from './ActivityIndicator'

type TransportType = 'USB' | 'BLE'
type Step = 'select-transport' | 'connect-transport' | 'loading'

type Props = {
  onConfirm?: () => void
  utxo: string
  bech32Address: string
  cancelOrder: Swap.Api['cancelOrder']
}

export const ConfirmRawTxWithHW = ({onConfirm, utxo, bech32Address, cancelOrder}: Props) => {
  const {walletManager} = useWalletManager()
  const [transportType, setTransportType] = useState<TransportType>('USB')
  const [step, setStep] = useState<Step>('select-transport')
  const {meta} = useSelectedWallet()
  const strings = useStrings()
  const styles = useStyles()
  const {cancelOrder: cancelOrderWithHw} = useCancelOrderWithHw({cancelOrder}, {onSuccess: onConfirm})

  const onSelectTransport = (transportType: TransportType) => {
    setTransportType(transportType)
    setStep('connect-transport')
  }

  const onConnectBLE = (deviceId: string) => {
    setStep('loading')
    const hwDeviceInfo = withBLE(meta, deviceId)
    walletManager.updateWalletHWDeviceInfo(meta.id, hwDeviceInfo)
    cancelOrderWithHw({useUSB: false, utxo, bech32Address, hwDeviceInfo})
  }

  const onConnectUSB = (deviceObj: HW.DeviceObj) => {
    setStep('loading')
    const hwDeviceInfo = withUSB(meta, deviceObj)
    walletManager.updateWalletHWDeviceInfo(meta.id, hwDeviceInfo)
    cancelOrderWithHw({useUSB: true, utxo, bech32Address, hwDeviceInfo})
  }

  if (step === 'select-transport') {
    return (
      <LedgerTransportSwitch
        onSelectBLE={() => onSelectTransport('BLE')}
        onSelectUSB={() => onSelectTransport('USB')}
      />
    )
  }

  if (step === 'connect-transport') {
    return (
      <ScrollView>
        <LedgerConnect useUSB={transportType === 'USB'} onConnectBLE={onConnectBLE} onConnectUSB={onConnectUSB} />
      </ScrollView>
    )
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator />

      <Text style={styles.text}>{strings.continueOnLedger}</Text>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...atoms.flex_1,
      ...atoms.align_center,
      ...atoms.justify_center,
      ...atoms.gap_2xl,
      ...atoms.px_lg,
    },
    text: {
      ...atoms.body_1_lg_regular,
      ...atoms.text_center,
      color: color.text_gray_medium,
    },
  })

  return styles
}
