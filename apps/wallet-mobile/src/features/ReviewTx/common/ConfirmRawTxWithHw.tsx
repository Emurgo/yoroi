import {useTheme} from '@yoroi/theme'
import {HW} from '@yoroi/types'
import React, {useState} from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'
import {useMutation, UseMutationOptions} from 'react-query'

import {Text} from '../../../components/Text'
import {LedgerConnect, LedgerTransportSwitch} from '../../../legacy/HW'
import {withBLE, withUSB} from '../../../yoroi-wallets/hw/hwWallet'
import {ActivityIndicator} from '../../Swap/common/ConfirmRawTx/ActivityIndicator'
import {useStrings} from '../../Swap/common/strings'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'

type TransportType = 'USB' | 'BLE'
type Step = 'select-transport' | 'connect-transport' | 'loading'

type Props = {
  onSuccess?: () => void
  cbor: string
}

export const ConfirmRawTxWithHW = ({onSuccess, cbor}: Props) => {
  const {walletManager} = useWalletManager()
  const [transportType, setTransportType] = useState<TransportType>('USB')
  const [step, setStep] = useState<Step>('select-transport')
  const {meta} = useSelectedWallet()
  const strings = useStrings()
  const {styles} = useStyles()
  const {signRawWithHw} = useSignRawTxWithHw({onSuccess})

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
      <ScrollView style={styles.scroll}>
        <LedgerConnect useUSB={transportType === 'USB'} onConnectBLE={onConnectBLE} onConnectUSB={onConnectUSB} />
      </ScrollView>
    )
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator />

      <Text style={styles.text}>{strings.continueOnLedger}</Text>
    </View>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...atoms.flex_1,
      ...atoms.align_center,
      ...atoms.justify_center,
      ...atoms.gap_2xl,
      ...atoms.px_lg,
    },
    scroll: {
      ...atoms.px_lg,
    },
    text: {
      ...atoms.body_1_lg_regular,
      ...atoms.text_center,
      color: color.text_gray_medium,
    },
  })

  return {styles} as const
}

export const useSignRawTxWithHw = (
  options?: UseMutationOptions<void, Error, {cbor: string; useUSB: boolean; hwDeviceInfo: HW.DeviceInfo}>,
) => {
  const {wallet} = useSelectedWallet()
  const mutation = useMutation({
    ...options,
    useErrorBoundary: true,
    mutationFn: async ({cbor, useUSB, hwDeviceInfo}) => {
      await wallet.signRawTxWithLedger(cbor, useUSB, hwDeviceInfo)
    },
  })
  return {
    ...mutation,
    signRawWithHw: mutation.mutate,
  }
}
