import React from 'react'
import {useIntl} from 'react-intl'

import {Boundary, TwoActionView} from '../../../components'
import {walletManager} from '../../../features/WalletManager/common/walletManager'
import {LedgerConnect, LedgerTransportSwitch} from '../../../HW'
import {confirmationMessages, txLabels} from '../../../kernel/i18n/global-messages'
import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {useSignWithHwAndSubmitTx} from '../../../yoroi-wallets/hooks'
import {DeviceId, DeviceObj, withBLE, withUSB} from '../../../yoroi-wallets/hw'
import {YoroiUnsignedTx} from '../../../yoroi-wallets/types'
import {TransferSummary} from '../TransferSummary'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  onCancel: () => void
  onSuccess: () => void
}

type TransportType = 'USB' | 'BLE'

export const ConfirmTxWithHW = (props: Props) => {
  const {wallet} = props
  const [transportType, setTransportType] = React.useState<TransportType>('USB')
  const [step, setStep] = React.useState<'select-transport' | 'connect-transport' | 'confirm'>('select-transport')

  const onSelectTransport = (transportType: TransportType) => {
    setTransportType(transportType)
    setStep('connect-transport')
  }

  const onConnectBLE = async (deviceId: DeviceId) => {
    await walletManager.updateHWDeviceInfo(wallet, withBLE(wallet, deviceId))
    setStep('confirm')
  }

  const onConnectUSB = async (deviceObj: DeviceObj) => {
    await walletManager.updateHWDeviceInfo(wallet, withUSB(wallet, deviceObj))
    setStep('confirm')
  }

  return (
    <>
      <Route active={step === 'select-transport'}>
        <LedgerTransportSwitch
          onSelectBLE={() => onSelectTransport('BLE')}
          onSelectUSB={() => onSelectTransport('USB')}
        />
      </Route>

      <Route active={step === 'connect-transport'}>
        <LedgerConnect onConnectBLE={onConnectBLE} onConnectUSB={onConnectUSB} useUSB={transportType === 'USB'} />
      </Route>

      <Route active={step === 'confirm'}>
        <Boundary>
          <Confirm {...props} transport={transportType} />
        </Boundary>
      </Route>
    </>
  )
}

const Confirm = ({
  wallet,
  onSuccess,
  onCancel,
  unsignedTx,
  transport: transportType,
}: Props & {transport: TransportType}) => {
  const strings = useStrings()

  const {signAndSubmitTx, isLoading} = useSignWithHwAndSubmitTx(
    {wallet}, //
    {signTx: {onSuccess}},
  )

  return (
    <TwoActionView
      title={strings.confirmTx}
      primaryButton={{
        disabled: isLoading,
        label: strings.confirmButton,
        onPress: () => signAndSubmitTx({unsignedTx, useUSB: transportType === 'USB'}),
      }}
      secondaryButton={{
        disabled: isLoading,
        onPress: () => onCancel(),
      }}
    >
      <TransferSummary wallet={wallet} unsignedTx={unsignedTx} />
    </TwoActionView>
  )
}

const Route = ({active, children}: {active: boolean; children: React.ReactNode}) => <>{active ? children : null}</>

const useStrings = () => {
  const intl = useIntl()

  return {
    confirmButton: intl.formatMessage(confirmationMessages.commonButtons.confirmButton),
    confirmTx: intl.formatMessage(txLabels.confirmTx),
    password: intl.formatMessage(txLabels.password),
  }
}
