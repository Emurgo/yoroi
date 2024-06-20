import {HW} from '@yoroi/types'
import React, {useState} from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {ActivityIndicator, ScrollView, StyleSheet, View} from 'react-native'

import {LedgerTransportSwitch} from '../../features/Swap/useCases/ConfirmTxScreen/LedgerTransportSwitch'
import {useSelectedWallet} from '../../features/WalletManager/common/hooks/useSelectedWallet'
import {useSelectedWalletMeta} from '../../features/WalletManager/common/hooks/useSelectedWalletMeta'
import {useWalletManager} from '../../features/WalletManager/context/WalletManagerProvider'
import {LedgerConnect} from '../../legacy/HW'
import {useSignTxWithHW, useSubmitTx} from '../../yoroi-wallets/hooks'
import {withBLE, withUSB} from '../../yoroi-wallets/hw'
import {YoroiSignedTx, YoroiUnsignedTx} from '../../yoroi-wallets/types'
import {ModalError} from '../ModalError/ModalError'
import {Text} from '../Text'
import {useStrings} from './strings'

type TransportType = 'USB' | 'BLE'
type Step = 'select-transport' | 'connect-transport' | 'loading'

type Props = {
  onSuccess?: (signedTx: YoroiSignedTx) => void
  unsignedTx: YoroiUnsignedTx
  onCancel?: () => void
}

export const ConfirmTxWithHwModal = ({onSuccess, unsignedTx, onCancel}: Props) => {
  return (
    <ErrorBoundary
      fallbackRender={({error, resetErrorBoundary}) => (
        <ModalError error={error} resetErrorBoundary={resetErrorBoundary} onCancel={onCancel} />
      )}
    >
      <ConfirmTxWithHwModalContent onSuccess={onSuccess} unsignedTx={unsignedTx} />
    </ErrorBoundary>
  )
}

const ConfirmTxWithHwModalContent = ({onSuccess, unsignedTx}: Omit<Props, 'onCancel'>) => {
  const {walletManager} = useWalletManager()
  const [transportType, setTransportType] = useState<TransportType>('USB')
  const [step, setStep] = useState<Step>('select-transport')
  const wallet = useSelectedWallet()
  const meta = useSelectedWalletMeta()
  const strings = useStrings()

  const {submitTx} = useSubmitTx({wallet}, {useErrorBoundary: true})

  const {signTx} = useSignTxWithHW(
    {wallet},
    {
      useErrorBoundary: true,
      retry: false,
      onSuccess: (signedTx) => {
        submitTx(signedTx, {onSuccess: () => onSuccess?.(signedTx)})
      },
    },
  )

  const onSelectTransport = (transportType: TransportType) => {
    setTransportType(transportType)
    setStep('connect-transport')
  }

  const onConnectBLE = (deviceId: string) => {
    setStep('loading')
    const hwDeviceInfo = withBLE(meta, deviceId)
    walletManager.updateWalletHWDeviceInfo(meta.id, hwDeviceInfo)
    signTx({unsignedTx, useUSB: false, hwDeviceInfo})
  }

  const onConnectUSB = (deviceObj: HW.DeviceObj) => {
    setStep('loading')
    const hwDeviceInfo = withUSB(meta, deviceObj)
    walletManager.updateWalletHWDeviceInfo(meta.id, hwDeviceInfo)
    signTx({unsignedTx, useUSB: true, hwDeviceInfo})
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
