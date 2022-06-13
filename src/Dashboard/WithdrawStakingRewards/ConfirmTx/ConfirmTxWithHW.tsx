import React from 'react'
import {useIntl} from 'react-intl'
import {useDispatch} from 'react-redux'

import {TwoActionView} from '../../../components'
import {useSignWithHwAndSubmitTx} from '../../../hooks'
import {LedgerConnect, LedgerTransportSwitch} from '../../../HW'
import {confirmationMessages, txLabels} from '../../../i18n/global-messages'
import {setLedgerDeviceId, setLedgerDeviceObj} from '../../../legacy/hwWallet'
import type {DeviceId, DeviceObj} from '../../../legacy/ledgerUtils'
import {YoroiWallet} from '../../../yoroi-wallets'
import {YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {TransferSummary} from '../TransferSummary'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  onCancel: () => void
  onSuccess: () => void
}

export const ConfirmTxWithHW: React.FC<Props> = ({wallet, unsignedTx, onSuccess, onCancel}) => {
  const strings = useStrings()
  const [transport, setTransport] = React.useState<'USB' | 'BLE'>('USB')
  const [step, setStep] = React.useState<'select-transport' | 'connect-transport' | 'confirm'>('select-transport')

  const onSelectTransport = (transport: 'USB' | 'BLE') => {
    setTransport(transport)
    setStep('connect-transport')
  }

  const dispatch = useDispatch()
  const onConnectBLE = async (deviceID: DeviceId) => {
    await dispatch(setLedgerDeviceId(deviceID))
    setStep('confirm')
  }
  const onConnectUSB = async (deviceObj: DeviceObj) => {
    await dispatch(setLedgerDeviceObj(deviceObj))
    setStep('confirm')
  }

  const {signAndSubmitTx, isLoading} = useSignWithHwAndSubmitTx(
    {wallet}, //
    {signTx: {onSuccess}},
  )

  return (
    <>
      <Route active={step === 'select-transport'}>
        <LedgerTransportSwitch
          onSelectBLE={() => onSelectTransport('BLE')}
          onSelectUSB={() => onSelectTransport('USB')}
        />
      </Route>

      <Route active={step === 'connect-transport'}>
        <LedgerConnect onConnectBLE={onConnectBLE} onConnectUSB={onConnectUSB} useUSB={transport === 'USB'} />
      </Route>

      <Route active={step === 'confirm'}>
        <TwoActionView
          title={strings.confirmTx}
          primaryButton={{
            disabled: isLoading,
            label: strings.confirmButton,
            onPress: () => signAndSubmitTx({unsignedTx, useUSB: transport === 'USB'}),
          }}
          secondaryButton={{
            disabled: isLoading,
            onPress: () => onCancel(),
          }}
        >
          <TransferSummary wallet={wallet} unsignedTx={unsignedTx} />
        </TwoActionView>
      </Route>
    </>
  )
}

const Route: React.FC<{active: boolean}> = ({active, children}) => <>{active ? children : null}</>

const useStrings = () => {
  const intl = useIntl()

  return {
    confirmButton: intl.formatMessage(confirmationMessages.commonButtons.confirmButton),
    confirmTx: intl.formatMessage(txLabels.confirmTx),
    password: intl.formatMessage(txLabels.password),
  }
}
