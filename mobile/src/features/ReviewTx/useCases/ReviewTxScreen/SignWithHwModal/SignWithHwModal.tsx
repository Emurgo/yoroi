import {atoms as a, useTheme} from '@yoroi/theme'
import {UnsignedTransaction} from '@yoroi/tx'
import {HW} from '@yoroi/types'

import * as CSL from '@emurgo/cross-csl-core'
import * as React from 'react'
import {ErrorBoundary} from 'react-error-boundary'
import {ActivityIndicator, View} from 'react-native'

import {useStrings} from '../../../../../kernel/i18n/useStrings'
import {LedgerConnect} from '../../../../../ui/LedgerConnect/LedgerConnect'
import {LedgerTransportSwitch} from '../../../../../ui/LedgerTransportSwitch/LedgerTransportSwitch'
import {ModalError} from '../../../../../ui/ModalError/ModalError'
import {Text} from '../../../../../ui/Text/Text'
import {withBLE, withUSB} from '../../../../../wallets/hw/hwWallet'
import {delay} from '../../../../../wallets/utils/timeUtils'
import {useSignTxWithHW} from '../../../../Transactions/hooks/useSignTxWithHW'
import {useSubmitTx} from '../../../../Transactions/hooks/useSubmitTx'
import {useWalletManager} from '../../../../WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '../../../../WalletManager/hooks/useSelectedWallet'

type TransportType = 'USB' | 'BLE'
type Step = 'select-transport' | 'connect-transport' | 'loading'

type Props = {
  onSuccess?: (signedTx: CSL.Transaction) => void
  unsignedTx: UnsignedTransaction
  onCancel?: () => void
  supportsCIP36?: boolean
  onCIP36SupportChange?: (isSupported: boolean) => void
  useUSB?: boolean
  setUseUSB?: (useUSB: boolean) => void
  onNotSupportedCIP1694?: () => void
}

export const SignWithHwModal = ({
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
      <SignWithHwModalContent
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

const SignWithHwModalContent = ({
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
  const {isDark, atoms: ta} = useTheme()

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
      unsignedTx.metadata?.some(
        (meta) =>
          String(meta.label) === '61284' || Number(meta.label) === 61284,
      ) &&
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
      unsignedTx.metadata?.some(
        (meta) =>
          String(meta.label) === '61284' || Number(meta.label) === 61284,
      ) &&
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
      <View>
        <LedgerConnect
          useUSB={transportType === 'USB'}
          onConnectBLE={onConnectBLE}
          onConnectUSB={onConnectUSB}
        />
      </View>
    )
  }

  return (
    <View style={[a.flex_1, a.align_center, a.justify_center, a.gap_2xl]}>
      <ActivityIndicator size="large" color={isDark ? 'white' : 'black'} />

      <Text style={[ta.text_gray_max, a.body_1_lg_regular, a.text_center]}>
        {strings.swap.continueOnLedger}
      </Text>
    </View>
  )
}
