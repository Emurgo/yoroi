import {useTheme} from '@yoroi/theme'
import {HW} from '@yoroi/types'
import React, {useState} from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'

import {Text} from '../../../../components/Text'
import {LedgerConnect} from '../../../../legacy/HW'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useSignWithHwAndSubmitTx} from '../../../../yoroi-wallets/hooks'
import {withBLE, withUSB} from '../../../../yoroi-wallets/hw/hwWallet'
import {YoroiSignedTx, YoroiUnsignedTx} from '../../../../yoroi-wallets/types/yoroi'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../WalletManager/context/WalletManagerProvider'
import {ActivityIndicator} from '../../common/ConfirmRawTx/ActivityIndicator'
import {useStrings} from '../../common/strings'
import {LedgerTransportSwitch} from './LedgerTransportSwitch'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  onCancel?: () => void
  onSuccess: (signedTx: YoroiSignedTx) => void
}

type TransportType = 'USB' | 'BLE'
type Step = 'select-transport' | 'connect-transport' | 'loading'

export const ConfirmTxWithHW = ({onSuccess, wallet, unsignedTx}: Props) => {
  const styles = useStyles()
  const {meta} = useSelectedWallet()
  const {walletManager} = useWalletManager()
  const [transportType, setTransportType] = React.useState<TransportType>('USB')
  const [step, setStep] = useState<Step>('select-transport')
  const strings = useStrings()

  const {signAndSubmitTx} = useSignWithHwAndSubmitTx(
    {wallet}, //
    {signTx: {onSuccess}},
  )

  const onSelectTransport = (transportType: TransportType) => {
    setTransportType(transportType)
    setStep('connect-transport')
  }

  const onConnectBLE = (deviceId: string) => {
    setStep('loading')
    const hwDeviceInfo = withBLE(meta, deviceId)
    walletManager.updateWalletHWDeviceInfo(meta.id, hwDeviceInfo)
    signAndSubmitTx({unsignedTx, useUSB: false, hwDeviceInfo})
  }

  const onConnectUSB = (deviceObj: HW.DeviceObj) => {
    setStep('loading')
    const hwDeviceInfo = withUSB(meta, deviceObj)
    walletManager.updateWalletHWDeviceInfo(meta.id, hwDeviceInfo)
    signAndSubmitTx({unsignedTx, useUSB: true, hwDeviceInfo})
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
    text: {
      ...atoms.body_1_lg_regular,
      ...atoms.text_center,
      color: color.text_gray_medium,
    },
  })

  return styles
}
