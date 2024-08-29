import {useTheme} from '@yoroi/theme'
import {HW} from '@yoroi/types'
import React, {useCallback, useState} from 'react'
import {ActivityIndicator, ScrollView, StyleSheet, View} from 'react-native'

import {Text, useModal} from '../../../components'
import {LedgerConnect} from '../../../legacy/HW'
import {withBLE, withUSB} from '../../../yoroi-wallets/hw'
import {LedgerTransportSwitch} from '../../Swap/useCases/ConfirmTxScreen/LedgerTransportSwitch'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'
import {useStrings} from './useStrings'

type TransportType = 'USB' | 'BLE'
type Step = 'select-transport' | 'connect-transport' | 'loading'

type Props = {
  onConfirm: (options: {transportType: TransportType; deviceInfo: HW.DeviceInfo}) => void
}

const modalHeight = 350

export const useConfirmHWConnectionModal = () => {
  const {openModal, closeModal} = useModal()
  const strings = useStrings()
  const confirmHWConnection = useCallback(
    ({onConfirm, onClose}: {onConfirm: Props['onConfirm']; onClose: () => void}) => {
      openModal(strings.signTransaction, <ConfirmHWConnectionModal onConfirm={onConfirm} />, modalHeight, onClose)
    },
    [openModal, strings.signTransaction],
  )
  return {confirmHWConnection, closeModal}
}

const ConfirmHWConnectionModal = ({onConfirm}: Props) => {
  const {walletManager} = useWalletManager()
  const [transportType, setTransportType] = useState<TransportType>('USB')
  const [step, setStep] = useState<Step>('select-transport')
  const {meta} = useSelectedWallet()
  const strings = useStrings()
  const {styles, colors} = useStyles()

  const onSelectTransport = (transportType: TransportType) => {
    setTransportType(transportType)
    setStep('connect-transport')
  }

  const onConnectBLE = (deviceId: string) => {
    setStep('loading')
    const hwDeviceInfo = withBLE(meta, deviceId)
    walletManager.updateWalletHWDeviceInfo(meta.id, hwDeviceInfo)
    onConfirm({transportType: 'BLE', deviceInfo: hwDeviceInfo})
  }

  const onConnectUSB = (deviceObj: HW.DeviceObj) => {
    setStep('loading')
    const hwDeviceInfo = withUSB(meta, deviceObj)
    walletManager.updateWalletHWDeviceInfo(meta.id, hwDeviceInfo)
    onConfirm({transportType: 'USB', deviceInfo: hwDeviceInfo})
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
