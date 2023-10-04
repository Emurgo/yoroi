import React, {useState} from 'react'
import {DeviceId, DeviceObj, withBLE, withUSB} from '../../../../yoroi-wallets/hw'
import {walletManager} from '../../../../yoroi-wallets/walletManager'
import {useSelectedWallet} from '../../../../SelectedWallet'
import {LedgerTransportSwitch} from '../../useCases/ConfirmTxScreen/LedgerTransportSwitch'
import {LedgerConnect} from '../../../../HW'
import {ScrollView} from 'react-native'
import {Boundary, TwoActionView} from '../../../../components'
import {useStrings} from '../strings'
import {useSignWithHwAndSubmitTx} from '../../../../yoroi-wallets/hooks'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'

type TransportType = 'USB' | 'BLE'

export const ConfirmRawTxWithHW = ({onSuccess}: {onSuccess?: VoidFunction}) => {
  const [transportType, setTransportType] = useState<TransportType>('USB')
  const [step, setStep] = useState<'select-transport' | 'connect-transport' | 'confirm'>('select-transport')
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
      <Confirm
        wallet={wallet}
        onSuccess={onSuccess}
        onCancel={() => setStep('select-transport')}
        transport={transportType}
      />
    </Boundary>
  )
}

const Confirm = ({
  wallet,
  onSuccess,
  transport: transportType,
  onCancel,
}: {
  wallet: YoroiWallet
  onCancel?: () => void
  onSuccess?: () => void
  transport: TransportType
}) => {
  const strings = useStrings()
  const {signAndSubmitTx, isLoading} = useSignWithHwAndSubmitTx(
    {wallet}, //
    {signTx: {onSuccess}},
  )

  return (
    <TwoActionView
      title={strings.confirm}
      primaryButton={{
        disabled: isLoading,
        label: strings.confirm,
        onPress: () => signAndSubmitTx({unsignedTx: null as any, useUSB: transportType === 'USB'}),
      }}
      secondaryButton={{
        label: strings.clear,
        disabled: isLoading,
        onPress: () => onCancel?.(),
      }}
    >
      {/*<TransferSummary wallet={wallet} unsignedTx={unsignedTx} />*/}
    </TwoActionView>
  )
}
