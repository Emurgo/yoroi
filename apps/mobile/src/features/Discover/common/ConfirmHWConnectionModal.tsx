import {useMutation} from '@tanstack/react-query'
import {atoms as a, useTheme} from '@yoroi/theme'
import {HW} from '@yoroi/types'
import React, {useCallback, useState} from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {ActivityIndicator, View} from 'react-native'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {LedgerConnect} from '~/ui/LedgerConnect/LedgerConnect'
import {LedgerTransportSwitch} from '~/ui/LedgerTransportSwitch/LedgerTransportSwitch'
import {useModal} from '~/ui/Modal/ModalContext'
import {ModalError} from '~/ui/ModalError/ModalError'
import {Text} from '~/ui/Text/Text'
import {withBLE, withUSB} from '~/wallets/hw/hwWallet'

type TransportType = 'USB' | 'BLE'
type Step = 'select-transport' | 'connect-transport' | 'loading'
type OnConfirmOptions = {
  transportType: TransportType
  deviceInfo: HW.DeviceInfo
}

type Props = {
  onConfirm: (options: OnConfirmOptions) => Promise<void>
  onClose?: () => void
  onCancel?: () => void
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
              <ModalError
                error={error}
                resetErrorBoundary={resetErrorBoundary}
                onCancel={onCancel}
              />
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
  const {palette: p} = useTheme()
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
    return (
      <LedgerConnect
        useUSB={transportType === 'USB'}
        onConnectBLE={onConnectBLE}
        onConnectUSB={onConnectUSB}
      />
    )
  }

  return (
    <View style={[a.flex_1, a.align_center, a.justify_center, {gap: 35}]}>
      <ActivityIndicator size="large" color={p.gray_max} />

      <Text style={[{fontSize: 18}, a.text_center, {color: p.gray_max}]}>
        {strings.continueOnLedger}
      </Text>
    </View>
  )
}
