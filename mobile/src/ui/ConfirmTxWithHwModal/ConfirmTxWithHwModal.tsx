import {atoms as a, useTheme} from '@yoroi/theme'
import {HW} from '@yoroi/types'
import * as React from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {ActivityIndicator, View} from 'react-native'

import {useSignTxWithHW} from '../../features/Transactions/hooks/useSignTxWithHW'
import {useSubmitTx} from '../../features/Transactions/hooks/useSubmitTx'
import {useWalletManager} from '../../features/WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '../../features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '../../kernel/i18n/useStrings'
import {withBLE, withUSB} from '../../wallets/hw/hwWallet'
import {YoroiSignedTx, YoroiUnsignedTx} from '../../wallets/types/yoroi'
import {delay} from '../../wallets/utils/timeUtils'
import {LedgerConnect} from '../LedgerConnect/LedgerConnect'
import {LedgerTransportSwitch} from '../LedgerTransportSwitch/LedgerTransportSwitch'
import {ModalError} from '../ModalError/ModalError'
import {Text} from '../Text/Text'

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
        <ModalError
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          onCancel={onCancel}
        />
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
  const [transportType, setTransportType] = React.useState<TransportType>('USB')
  const [step, setStep] = React.useState<Step>('select-transport')
  const {wallet, meta} = useSelectedWallet()
  const strings = useStrings()
  const {isDark, palette} = useTheme()

  const {submitTx} = useSubmitTx({wallet})

  const {signTx} = useSignTxWithHW(
    {wallet},
    {
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

    const isCIP1694Supported = await wallet.ledgerSupportsCIP1694(
      false,
      hwDeviceInfo,
    )
    if (!isCIP1694Supported && onNotSupportedCIP1694) {
      onNotSupportedCIP1694()
      return
    }

    if (
      unsignedTx.unsignedTx.catalystRegistrationData &&
      onCIP36SupportChange
    ) {
      const isCIP36Supported = await wallet.ledgerSupportsCIP36(
        false,
        hwDeviceInfo,
      )
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

    const isCIP1694Supported = await wallet.ledgerSupportsCIP1694(
      true,
      hwDeviceInfo,
    )
    if (!isCIP1694Supported && onNotSupportedCIP1694) {
      onNotSupportedCIP1694()
      return
    }

    if (
      unsignedTx.unsignedTx.catalystRegistrationData &&
      onCIP36SupportChange
    ) {
      const isCIP36Supported = await wallet.ledgerSupportsCIP36(
        true,
        hwDeviceInfo,
      )
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
      <View style={[a.px_lg]}>
        <LedgerConnect
          useUSB={transportType === 'USB'}
          onConnectBLE={onConnectBLE}
          onConnectUSB={onConnectUSB}
        />
      </View>
    )
  }

  return (
    <View
      style={[a.flex_1, a.align_center, a.justify_center, a.px_lg, {gap: 35}]}
    >
      <ActivityIndicator size="large" color={isDark ? 'white' : 'black'} />

      <Text
        style={[{color: palette.text_gray_max, fontSize: 18}, a.text_center]}
      >
        {strings.swap.continueOnLedger}
      </Text>
    </View>
  )
}
