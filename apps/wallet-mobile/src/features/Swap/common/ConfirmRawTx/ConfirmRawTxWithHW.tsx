import {useTheme} from '@yoroi/theme'
import {Swap} from '@yoroi/types'
import React, {useState} from 'react'
import {ActivityIndicator, ScrollView, StyleSheet, View} from 'react-native'

import {Text} from '../../../../components'
import {LedgerConnect} from '../../../../HW'
import {walletManager} from '../../../../wallet-manager/walletManager'
import {DeviceId, DeviceObj, withBLE, withUSB} from '../../../../yoroi-wallets/hw'
import {useSelectedWallet} from '../../../WalletManager/Context/SelectedWalletContext'
import {LedgerTransportSwitch} from '../../useCases/ConfirmTxScreen/LedgerTransportSwitch'
import {useCancelOrderWithHw} from '../helpers'
import {useStrings} from '../strings'

type TransportType = 'USB' | 'BLE'
type Step = 'select-transport' | 'connect-transport' | 'loading'

type Props = {
  onConfirm?: () => void
  utxo: string
  bech32Address: string
  cancelOrder: Swap.Api['cancelOrder']
}

export const ConfirmRawTxWithHW = ({onConfirm, utxo, bech32Address, cancelOrder}: Props) => {
  const [transportType, setTransportType] = useState<TransportType>('USB')
  const [step, setStep] = useState<Step>('select-transport')
  const wallet = useSelectedWallet()
  const strings = useStrings()
  const styles = useStyles()
  const {cancelOrder: cancelOrderWithHw} = useCancelOrderWithHw({cancelOrder}, {onSuccess: onConfirm})

  const onSelectTransport = (transportType: TransportType) => {
    setTransportType(transportType)
    setStep('connect-transport')
  }

  const onConnectBLE = async (deviceId: DeviceId) => {
    setStep('loading')
    await walletManager.updateHWDeviceInfo(wallet, withBLE(wallet, deviceId))
    cancelOrderWithHw({useUSB: false, utxo, bech32Address})
  }

  const onConnectUSB = async (deviceObj: DeviceObj) => {
    setStep('loading')
    await walletManager.updateHWDeviceInfo(wallet, withUSB(wallet, deviceObj))
    cancelOrderWithHw({useUSB: true, utxo, bech32Address})
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
      <ActivityIndicator size="large" color="black" />

      <Text style={styles.text}>{strings.continueOnLedger}</Text>
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 35,
    },
    text: {
      fontSize: 18,
      color: color['black-static'],
      textAlign: 'center',
    },
  })

  return styles
}
