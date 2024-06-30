import {useTheme} from '@yoroi/theme'
import {HW} from '@yoroi/types'
import React, {useCallback, useState} from 'react'
import {ActivityIndicator, ScrollView, StyleSheet, View} from 'react-native'

import {Text, useModal} from '../../../components'
import {LedgerConnect} from '../../../legacy/HW'
import {withBLE, withUSB} from '../../../yoroi-wallets/hw'
import {useStrings} from '../../Swap/common/strings'
import {LedgerTransportSwitch} from '../../Swap/useCases/ConfirmTxScreen/LedgerTransportSwitch'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'

type TransportType = 'USB' | 'BLE'
type Step = 'select-transport' | 'connect-transport' | 'loading'

type Props = {
  onConfirm: (transportType: TransportType) => void
}

export const useConfirmHWConnection = () => {
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const confirmHWConnection = useCallback(
    ({onConfirm, onClose}: {onConfirm: (transportType: TransportType) => void; onClose: () => void}) => {
      openModal(strings.signTransaction, <ConfirmRawTxWithHW onConfirm={onConfirm} />, 350, onClose)
    },
    [openModal, strings.signTransaction],
  )
  return {confirmHWConnection, closeModal}
}

export const ConfirmRawTxWithHW = ({onConfirm}: Props) => {
  const {walletManager} = useWalletManager()
  const [transportType, setTransportType] = useState<TransportType>('USB')
  const [step, setStep] = useState<Step>('select-transport')
  const {meta} = useSelectedWallet()
  const strings = useStrings()
  const styles = useStyles()

  const onSelectTransport = (transportType: TransportType) => {
    setTransportType(transportType)
    setStep('connect-transport')
  }

  const onConnectBLE = (deviceId: string) => {
    setStep('loading')
    const hwDeviceInfo = withBLE(meta, deviceId)
    walletManager.updateWalletHWDeviceInfo(meta.id, hwDeviceInfo)
    onConfirm?.('BLE')
  }

  const onConnectUSB = (deviceObj: HW.DeviceObj) => {
    setStep('loading')
    const hwDeviceInfo = withUSB(meta, deviceObj)
    walletManager.updateWalletHWDeviceInfo(meta.id, hwDeviceInfo)
    onConfirm?.('USB')
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

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 35,
    },
    text: {
      fontSize: 18,
      color: color.black_static,
      textAlign: 'center',
    },
  })

  return styles
}
