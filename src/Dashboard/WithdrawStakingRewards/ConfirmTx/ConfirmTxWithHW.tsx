import React from 'react'
import {useIntl} from 'react-intl'
import {useDispatch, useSelector} from 'react-redux'

import {TwoActionView} from '../../../components'
import {useSignTxWithHW, useSubmitTx, useWithdrawalTx} from '../../../hooks'
import {LedgerConnect, LedgerTransportSwitch} from '../../../HW'
import {confirmationMessages, txLabels} from '../../../i18n/global-messages'
import {setLedgerDeviceId, setLedgerDeviceObj} from '../../../legacy/hwWallet'
import type {DeviceId, DeviceObj} from '../../../legacy/ledgerUtils'
import {serverStatusSelector, utxosSelector} from '../../../legacy/selectors'
import {useSelectedWallet} from '../../../SelectedWallet'
import {Staked} from '../../StakePoolInfos'
import {TransferSummary} from '../WithdrawalDialog/TransferSummary'

type Props = {
  onCancel: () => void
  onSuccess: () => void
  stakingInfo: Staked
  shouldDeregister: boolean
}

export const ConfirmTxWithHW: React.FC<Props> = ({onSuccess, onCancel, shouldDeregister}) => {
  const wallet = useSelectedWallet()
  const strings = useStrings()
  const [transport, setTransport] = React.useState<'USB' | 'BLE'>('USB')
  const utxos = useSelector(utxosSelector) || []
  const serverStatus = useSelector(serverStatusSelector)
  const [step, setStep] = React.useState<'select-transport' | 'connect-transport' | 'confirm'>('select-transport')

  const onSelectTransport = async (transport: 'USB' | 'BLE') => {
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

  const {withdrawalTx} = useWithdrawalTx({
    wallet,
    utxos,
    shouldDeregister,
    serverTime: serverStatus.serverTime,
  })

  const {signTx, isLoading: isLoadingSignTx} = useSignTxWithHW(
    {wallet}, //
    {onSuccess: (signedTx) => submitTx(signedTx)},
  )

  const {submitTx, isLoading: isLoadingSubmitTx} = useSubmitTx(
    {wallet}, //
    {onSuccess},
  )

  const isLoading = isLoadingSignTx || isLoadingSubmitTx

  return (
    <>
      <Route active={step === 'select-transport'}>
        <LedgerTransportSwitch onSelectTransport={onSelectTransport} />
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
            onPress: () => signTx({yoroiUnsignedTx: withdrawalTx, useUSB: transport === 'USB'}),
          }}
          secondaryButton={{
            disabled: isLoading,
            onPress: () => onCancel(),
          }}
        >
          <TransferSummary withdrawalTx={withdrawalTx} />
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
