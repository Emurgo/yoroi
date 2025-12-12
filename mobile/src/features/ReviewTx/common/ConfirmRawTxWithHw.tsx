import {RejectedByUserError} from '@yoroi/cardano-wallet'
import {withBLE, withUSB} from '@yoroi/cardano-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {HW} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'
import {useWalletManager} from '@yoroi/wallet-manager'

import {UseMutationOptions, useMutation} from '@tanstack/react-query'
import React, {useState} from 'react'
import {ScrollView, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {ActivityIndicator} from '~/ui/ActivityIndicator/ActivityIndicator'
import {LedgerConnect} from '~/ui/LedgerConnect/LedgerConnect'
import {LedgerTransportSwitch} from '~/ui/LedgerTransportSwitch/LedgerTransportSwitch'
import {Text} from '~/ui/Text/Text'

type TransportType = 'USB' | 'BLE'
type Step = 'select-transport' | 'connect-transport' | 'loading'

type Props = {
  onSuccess?: () => void
  onCancel?: () => void
  cbor: string
}

export const ConfirmRawTxWithHW = ({onSuccess, onCancel, cbor}: Props) => {
  const {walletManager} = useWalletManager()
  const [transportType, setTransportType] = useState<TransportType>('USB')
  const [step, setStep] = useState<Step>('select-transport')
  const {meta} = useSelectedWallet()
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {signRawWithHw} = useSignRawTxWithHw({onSuccess, onCancel})

  const onSelectTransport = (transportType: TransportType) => {
    setTransportType(transportType)
    setStep('connect-transport')
  }

  const onConnectBLE = (deviceId: string) => {
    setStep('loading')
    const hwDeviceInfo = withBLE(meta, deviceId)
    walletManager.updateWalletHWDeviceInfo(meta.id, hwDeviceInfo)
    signRawWithHw({useUSB: false, cbor, hwDeviceInfo})
  }

  const onConnectUSB = (deviceObj: HW.DeviceObj) => {
    setStep('loading')
    const hwDeviceInfo = withUSB(meta, deviceObj)
    walletManager.updateWalletHWDeviceInfo(meta.id, hwDeviceInfo)
    signRawWithHw({useUSB: true, cbor, hwDeviceInfo})
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
      <ScrollView style={[a.px_lg]}>
        <LedgerConnect
          useUSB={transportType === 'USB'}
          onConnectBLE={onConnectBLE}
          onConnectUSB={onConnectUSB}
        />
      </ScrollView>
    )
  }

  return (
    <View
      style={[a.flex_1, a.align_center, a.justify_center, a.gap_2xl, a.px_lg]}
    >
      <ActivityIndicator />

      <Text style={[a.body_1_lg_regular, a.text_center, ta.text_gray_medium]}>
        {strings.ledgerMessages.continueOnLedger}
      </Text>
    </View>
  )
}

type UseSignRawTxWithHwOptions = UseMutationOptions<
  void,
  Error,
  {cbor: string; useUSB: boolean; hwDeviceInfo: HW.DeviceInfo}
> & {
  onCancel?: () => void
}

export const useSignRawTxWithHw = (options?: UseSignRawTxWithHwOptions) => {
  const {wallet} = useSelectedWallet()
  const {onCancel, onError, ...mutationOptions} = options || {}

  const mutation = useMutation({
    ...mutationOptions,
    throwOnError: true, // Let ErrorBoundary catch the error (it's already working)
    mutationFn: async ({cbor, useUSB, hwDeviceInfo}) => {
      try {
        await wallet.signRawTxWithLedger(cbor, useUSB, hwDeviceInfo)
      } catch (err) {
        // For user rejection, call onCancel callback before re-throwing
        // This ensures onCancel is called while still allowing ErrorBoundary to handle the error
        if (err instanceof RejectedByUserError) {
          onCancel?.()
        }
        // Re-throw so ErrorBoundary can catch it and show the error modal
        throw err
      }
    },
    onError: (error, variables, context, mutation) => {
      // Call the original onError if provided (with correct signature)
      onError?.(error, variables, context, mutation)
      // ErrorBoundary will handle displaying the error modal
    },
  })
  return {
    ...mutation,
    signRawWithHw: mutation.mutate,
  }
}
