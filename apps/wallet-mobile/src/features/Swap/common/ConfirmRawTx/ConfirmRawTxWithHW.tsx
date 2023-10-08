import React, {useState} from 'react'
import {ScrollView} from 'react-native'

import {Boundary, TwoActionView} from '../../../../components'
import {LedgerConnect} from '../../../../HW'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {DeviceId, DeviceObj, withBLE, withUSB} from '../../../../yoroi-wallets/hw'
import {walletManager} from '../../../../yoroi-wallets/walletManager'
import {LedgerTransportSwitch} from '../../useCases/ConfirmTxScreen/LedgerTransportSwitch'
import {useStrings} from '../strings'

type TransportType = 'USB' | 'BLE'
type Step = 'select-transport' | 'connect-transport' | 'confirm'

type Props = {
  onSuccess?: (options: {useUSB: boolean}) => void
}

export const ConfirmRawTxWithHW = ({onSuccess}: Props) => {
  const [transportType, setTransportType] = useState<TransportType>('USB')
  const [step, setStep] = useState<Step>('select-transport')
  const wallet = useSelectedWallet()

  const onSelectTransport = (transportType: TransportType) => {
    setTransportType(transportType)
    setStep('connect-transport')
  }

  const onConnectBLE = async (deviceId: DeviceId) => {
    await walletManager.updateHWDeviceInfo(wallet, withBLE(wallet, deviceId))
    setStep('confirm')
  }

  const onConnectUSB = async (deviceObj: DeviceObj) => {
    await walletManager.updateHWDeviceInfo(wallet, withUSB(wallet, deviceObj))
    setStep('confirm')
  }

  const handleConfirm = () => {
    onSuccess?.({useUSB: transportType === 'USB'})
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
        <LedgerConnect onConnectBLE={onConnectBLE} onConnectUSB={onConnectUSB} />
      </ScrollView>
    )
  }

  return (
    <Boundary>
      <Confirm onSuccess={handleConfirm} onCancel={() => setStep('select-transport')} />
    </Boundary>
  )
}

const Confirm = ({onSuccess, onCancel}: {onCancel?: () => void; onSuccess?: () => void}) => {
  const strings = useStrings()

  return (
    <TwoActionView
      title={strings.confirm}
      primaryButton={{
        label: strings.confirm,
        onPress: () => {
          console.log('ConfirmRawTxWithHW.tsx: Confirm: onPress')
          onSuccess?.()
        },
      }}
      secondaryButton={{
        label: strings.clear,
        onPress: () => onCancel?.(),
      }}
    >
      {/* <TransferSummary wallet={wallet} unsignedTx={unsignedTx} />*/}
    </TwoActionView>
  )
}
