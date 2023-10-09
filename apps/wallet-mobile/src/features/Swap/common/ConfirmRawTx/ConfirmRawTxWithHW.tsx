import React, {useState} from 'react'
import {ActivityIndicator, ScrollView} from 'react-native'

import {LedgerConnect} from '../../../../HW'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {DeviceId, DeviceObj, withBLE, withUSB} from '../../../../yoroi-wallets/hw'
import {walletManager} from '../../../../yoroi-wallets/walletManager'
import {LedgerTransportSwitch} from '../../useCases/ConfirmTxScreen/LedgerTransportSwitch'

type TransportType = 'USB' | 'BLE'
type Step = 'select-transport' | 'connect-transport' | 'loading'

type Props = {
  onConfirm?: (options: {useUSB: boolean}) => void
}

export const ConfirmRawTxWithHW = ({onConfirm}: Props) => {
  const [transportType, setTransportType] = useState<TransportType>('USB')
  const [step, setStep] = useState<Step>('select-transport')
  const wallet = useSelectedWallet()

  const onSelectTransport = (transportType: TransportType) => {
    setTransportType(transportType)
    setStep('connect-transport')
  }

  const onConnectBLE = async (deviceId: DeviceId) => {
    await walletManager.updateHWDeviceInfo(wallet, withBLE(wallet, deviceId))
    onConfirm?.({useUSB: false})
    setStep('loading')
  }

  const onConnectUSB = async (deviceObj: DeviceObj) => {
    await walletManager.updateHWDeviceInfo(wallet, withUSB(wallet, deviceObj))
    onConfirm?.({useUSB: true})
    setStep('loading')
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

  return <ActivityIndicator size="large" color="black" />
}
