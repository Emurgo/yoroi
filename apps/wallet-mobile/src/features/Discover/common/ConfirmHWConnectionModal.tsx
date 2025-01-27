import {useTheme} from '@yoroi/theme'
import {HW} from '@yoroi/types'
import React, {useCallback, useState} from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {ActivityIndicator, StyleSheet, View} from 'react-native'
import {useMutation} from 'react-query'

import {LedgerTransportSwitch} from '../../../components/LedgerTransportSwitch/LedgerTransportSwitch'
import {useModal} from '../../../components/Modal/ModalContext'
import {ModalError} from '../../../components/ModalError/ModalError'
import {Text} from '../../../components/Text'
import {LedgerConnect} from '../../../legacy/HW'
import {withBLE, withUSB} from '../../../yoroi-wallets/hw/hwWallet'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'
import {useStrings} from './useStrings'

type TransportType = 'USB' | 'BLE'
type Step = 'select-transport' | 'connect-transport' | 'loading'
type OnConfirmOptions = {transportType: TransportType; deviceInfo: HW.DeviceInfo}

type Props = {
  onConfirm: (options: OnConfirmOptions) => Promise<void>
  onClose: () => void
  onCancel: () => void
}

export const useConfirmHWConnectionModal = () => {
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const confirmHWConnection = useCallback(
    ({onConfirm, onClose, onCancel}: Props) => {
      openModal({
        title: strings.signTransaction,
        content: (
          <ErrorBoundary
            fallbackRender={({error, resetErrorBoundary}) => (
              <ModalError error={error} resetErrorBoundary={resetErrorBoundary} onCancel={onCancel} />
            )}
          >
            <ConfirmHWConnectionModal onConfirm={onConfirm} />
          </ErrorBoundary>
        ),
        height: 350,
        onClose,
      })
    },
    [openModal, strings.signTransaction],
  )
  return {confirmHWConnection, closeModal}
}

const ConfirmHWConnectionModal = ({onConfirm}: Pick<Props, 'onConfirm'>) => {
  const {walletManager} = useWalletManager()
  const [transportType, setTransportType] = useState<TransportType>('USB')
  const [step, setStep] = useState<Step>('select-transport')
  const {meta} = useSelectedWallet()
  const strings = useStrings()
  const {styles, colors} = useStyles()
  const {mutate: handleOnConfirm} = useMutation<void, Error, OnConfirmOptions>({
    mutationFn: onConfirm,
    useErrorBoundary: true,
  })

  const onSelectTransport = (transportType: TransportType) => {
    setTransportType(transportType)
    setStep('connect-transport')
  }

  const onConnectBLE = (deviceId: string) => {
    setStep('loading')
    const hwDeviceInfo = withBLE(meta, deviceId)
    walletManager.updateWalletHWDeviceInfo(meta.id, hwDeviceInfo)
    handleOnConfirm({transportType: 'BLE', deviceInfo: hwDeviceInfo})
  }

  const onConnectUSB = (deviceObj: HW.DeviceObj) => {
    setStep('loading')
    const hwDeviceInfo = withUSB(meta, deviceObj)
    walletManager.updateWalletHWDeviceInfo(meta.id, hwDeviceInfo)
    handleOnConfirm({transportType: 'USB', deviceInfo: hwDeviceInfo})
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
    return <LedgerConnect useUSB={transportType === 'USB'} onConnectBLE={onConnectBLE} onConnectUSB={onConnectUSB} />
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.spinner} />

      <Text style={styles.text}>{strings.continueOnLedger}</Text>
    </View>
  )
}

const useStyles = () => {
  const {color} = useTheme()

  const colors = {
    spinner: color.gray_max,
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
      color: color.gray_max,
      textAlign: 'center',
    },
  })

  return {styles, colors}
}
