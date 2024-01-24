import React, {useState} from 'react'
import {ActivityIndicator, ScrollView, StyleSheet, View} from 'react-native'

import {Text} from '../../../../components'
import {LedgerConnect} from '../../../../HW'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useSignWithHwAndSubmitTx} from '../../../../yoroi-wallets/hooks'
import {DeviceId, DeviceObj, withBLE, withUSB} from '../../../../yoroi-wallets/hw'
import {YoroiSignedTx, YoroiUnsignedTx} from '../../../../yoroi-wallets/types'
import {walletManager} from '../../../../yoroi-wallets/walletManager'
import {useStrings} from '../../common/strings'
import {LedgerTransportSwitch} from './LedgerTransportSwitch'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  onCancel?: () => void
  onSuccess: (signedTx: YoroiSignedTx) => void
}

type TransportType = 'USB' | 'BLE'
type Step = 'select-transport' | 'connect-transport' | 'loading'

export const ConfirmTxWithHW = ({onSuccess, wallet, unsignedTx}: Props) => {
  const [transportType, setTransportType] = React.useState<TransportType>('USB')
  const [step, setStep] = useState<Step>('select-transport')
  const strings = useStrings()

  const {signAndSubmitTx} = useSignWithHwAndSubmitTx(
    {wallet}, //
    {signTx: {onSuccess}},
  )

  const onSelectTransport = (transportType: TransportType) => {
    setTransportType(transportType)
    setStep('connect-transport')
  }

  const onConnectBLE = async (deviceId: DeviceId) => {
    setStep('loading')
    await walletManager.updateHWDeviceInfo(wallet, withBLE(wallet, deviceId))
    signAndSubmitTx({unsignedTx, useUSB: false})
  }

  const onConnectUSB = async (deviceObj: DeviceObj) => {
    setStep('loading')
    await walletManager.updateHWDeviceInfo(wallet, withUSB(wallet, deviceObj))
    signAndSubmitTx({unsignedTx, useUSB: true})
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 35,
  },
  text: {
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
  },
})
