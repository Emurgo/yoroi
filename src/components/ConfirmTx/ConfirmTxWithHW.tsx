import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {useIntl} from 'react-intl'
import {LayoutAnimation} from 'react-native'

import {useSignWithHwAndSubmitTx} from '../../hooks'
import {LedgerConnect, LedgerTransportSwitchModal} from '../../HW'
import {actionMessages} from '../../i18n/global-messages'
import type {DeviceId, DeviceObj} from '../../legacy/ledgerUtils'
import {walletManager, withBLE, withUSB, YoroiWallet} from '../../yoroi-wallets'
import {YoroiUnsignedTx} from '../../yoroi-wallets/types'
import {Button} from '../Button'
import {LoadingOverlay} from '../LoadingOverlay'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  onSuccess: () => void
}

export const ConfirmTxWithHW = ({wallet, unsignedTx, onSuccess}: Props) => {
  const strings = useStrings()
  const navigation = useNavigation()
  const [transport, setTransport] = React.useState<'USB' | 'BLE'>('USB')
  const [step, setStep] = React.useState<'select-transport' | 'connect-transport' | 'confirm'>('select-transport')

  const onSelectTransport = (transport: 'USB' | 'BLE') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setTransport(transport)
    setStep('connect-transport')
  }

  const onConnectBLE = async (deviceId: DeviceId) => {
    await walletManager.updateHWDeviceInfo(wallet, withBLE(wallet, deviceId))
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setStep('confirm')
  }

  const onConnectUSB = async (deviceObj: DeviceObj) => {
    await walletManager.updateHWDeviceInfo(wallet, withUSB(wallet, deviceObj))
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setStep('confirm')
  }

  const {signAndSubmitTx, isLoading} = useSignWithHwAndSubmitTx(
    {wallet}, //
    {signTx: {onSuccess}},
  )

  return (
    <>
      <Route active={step === 'select-transport'}>
        <LedgerTransportSwitchModal
          showCloseIcon
          onRequestClose={() => navigation.goBack()}
          visible={step === 'select-transport'}
          onSelectBLE={() => onSelectTransport('BLE')}
          onSelectUSB={() => onSelectTransport('USB')}
        />
      </Route>

      <Route active={step === 'connect-transport'}>
        <LedgerConnect onConnectBLE={onConnectBLE} onConnectUSB={onConnectUSB} useUSB={transport === 'USB'} />
      </Route>

      <Route active={step === 'confirm'}>
        <Button
          onPress={() => signAndSubmitTx({unsignedTx, useUSB: transport === 'USB'})}
          title={strings.sendButton}
          disabled={isLoading}
          shelleyTheme
        />
      </Route>

      <LoadingOverlay loading={isLoading} />
    </>
  )
}

const Route = ({active, children}: {active: boolean; children: React.ReactNode}) => <>{active ? children : null}</>

const useStrings = () => {
  const intl = useIntl()

  return {
    sendButton: intl.formatMessage(actionMessages.send),
  }
}
