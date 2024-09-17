import {useTheme} from '@yoroi/theme'
import {HW} from '@yoroi/types'
import React, {useState} from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {ActivityIndicator, ScrollView, StyleSheet, View} from 'react-native'

import {LedgerTransportSwitch} from '../../features/Swap/useCases/ConfirmTxScreen/LedgerTransportSwitch'
import {useSelectedWallet} from '../../features/WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../features/WalletManager/context/WalletManagerProvider'
import {LedgerConnect} from '../../legacy/HW'
import {useSignTxWithHW, useSubmitTx} from '../../yoroi-wallets/hooks'
import {withBLE, withUSB} from '../../yoroi-wallets/hw/hwWallet'
import {YoroiSignedTx, YoroiUnsignedTx} from '../../yoroi-wallets/types/yoroi'
import {delay} from '../../yoroi-wallets/utils/timeUtils'
import {ModalError} from '../ModalError/ModalError'
import {Text} from '../Text'
import {useStrings} from './strings'

type TransportType = 'USB' | 'BLE'
type Step = 'select-transport' | 'connect-transport' | 'loading'

type Props = {
  onSuccess?: (signedTx: YoroiSignedTx) => void
  unsignedTx: YoroiUnsignedTx
  onCancel?: () => void
  supportsCIP36?: boolean
  onCIP36SupportChange?: (isSupported: boolean) => void
  useUSB?: boolean
  setUseUSB?: (useUSB: boolean) => void
  onNotSupportedCIP1694?: () => void
}

export const ConfirmTxWithHwModal = ({
  onSuccess,
  unsignedTx,
  onCancel,
  supportsCIP36,
  onCIP36SupportChange,
  setUseUSB,
  onNotSupportedCIP1694,
}: Props) => {
  return (
    <ErrorBoundary
      fallbackRender={({error, resetErrorBoundary}) => (
        <ModalError error={error} resetErrorBoundary={resetErrorBoundary} onCancel={onCancel} />
      )}
    >
      <ConfirmTxWithHwModalContent
        onSuccess={onSuccess}
        unsignedTx={unsignedTx}
        supportsCIP36={supportsCIP36}
        onCIP36SupportChange={onCIP36SupportChange}
        setUseUSB={setUseUSB}
        onNotSupportedCIP1694={onNotSupportedCIP1694}
      />
    </ErrorBoundary>
  )
}

const ConfirmTxWithHwModalContent = ({
  onSuccess,
  unsignedTx,
  supportsCIP36,
  onCIP36SupportChange,
  setUseUSB,
  onNotSupportedCIP1694,
}: Omit<Props, 'onCancel'>) => {
  const {walletManager} = useWalletManager()
  const [transportType, setTransportType] = useState<TransportType>('USB')
  const [step, setStep] = useState<Step>('select-transport')
  const {wallet, meta} = useSelectedWallet()
  const strings = useStrings()
  const styles = useStyles()
  const {isDark} = useTheme()

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
    setUseUSB?.(transportType === 'USB')
    setStep('connect-transport')
  }

  const onConnectBLE = async (deviceId: string) => {
    setStep('loading')

    const hwDeviceInfo = withBLE(meta, deviceId)
    walletManager.updateWalletHWDeviceInfo(meta.id, hwDeviceInfo)

    const isCIP1694Supported = await wallet.ledgerSupportsCIP1694(false, hwDeviceInfo)
    if (!isCIP1694Supported && onNotSupportedCIP1694) {
      onNotSupportedCIP1694()
      return
    }

    if (unsignedTx.unsignedTx.catalystRegistrationData && onCIP36SupportChange) {
      const isCIP36Supported = await wallet.ledgerSupportsCIP36(false, hwDeviceInfo)
      if (supportsCIP36 !== isCIP36Supported) {
        onCIP36SupportChange(isCIP36Supported)
        await delay(1000)
      }
    }

    signTx({unsignedTx, useUSB: false, hwDeviceInfo})
  }

  const onConnectUSB = async (deviceObj: HW.DeviceObj) => {
    setStep('loading')

    const hwDeviceInfo = withUSB(meta, deviceObj)
    walletManager.updateWalletHWDeviceInfo(meta.id, hwDeviceInfo)

    const isCIP1694Supported = await wallet.ledgerSupportsCIP1694(true, hwDeviceInfo)
    if (!isCIP1694Supported && onNotSupportedCIP1694) {
      onNotSupportedCIP1694()
      return
    }

    if (unsignedTx.unsignedTx.catalystRegistrationData && onCIP36SupportChange) {
      const isCIP36Supported = await wallet.ledgerSupportsCIP36(true, hwDeviceInfo)
      if (supportsCIP36 !== isCIP36Supported) {
        onCIP36SupportChange(isCIP36Supported)
        await delay(1000)
      }
    }

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
      <ScrollView style={styles.scroll}>
        <LedgerConnect useUSB={transportType === 'USB'} onConnectBLE={onConnectBLE} onConnectUSB={onConnectUSB} />
      </ScrollView>
    )
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={isDark ? 'white' : 'black'} />

      <Text style={styles.text}>{strings.continueOnLedger}</Text>
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    scroll: {
      ...atoms.px_lg,
    },
    container: {
      ...atoms.flex_1,
      ...atoms.align_center,
      ...atoms.justify_center,
      ...atoms.px_lg,
      gap: 35,
    },
    text: {
      color: color.text_gray_max,
      fontSize: 18,
      ...atoms.text_center,
    },
  })

  return styles
}
