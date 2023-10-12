import React from 'react'
import {ScrollView} from 'react-native'

import {Boundary, TwoActionView} from '../../../../components'
import {TransferSummary} from '../../../../Dashboard/WithdrawStakingRewards/TransferSummary'
import {LedgerConnect} from '../../../../HW'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useSignWithHwAndSubmitTx} from '../../../../yoroi-wallets/hooks'
import {DeviceId, DeviceObj, withBLE, withUSB} from '../../../../yoroi-wallets/hw'
import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types'
import {walletManager} from '../../../../yoroi-wallets/walletManager'
import {useStrings} from '../../common/strings'
import {LedgerTransportSwitch} from './LedgerTransportSwitch'

type Props = {
  wallet: YoroiWallet
  unsignedTx: YoroiUnsignedTx
  additionalFees?: string
  onCancel?: () => void
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
        <ScrollView>
          <LedgerConnect onConnectBLE={onConnectBLE} onConnectUSB={onConnectUSB} />
        </ScrollView>
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
  unsignedTx,
  transport: transportType,
  additionalFees,
}: Props & {transport: TransportType; additionalFees?: string}) => {
  const strings = useStrings()
  const {signAndSubmitTx, isLoading} = useSignWithHwAndSubmitTx(
    {wallet}, //
    {signTx: {onSuccess}},
  )

  return (
    <TwoActionView
      title={strings.confirm}
      primaryButton={{
        disabled: isLoading,
        label: strings.confirm,
        onPress: () => signAndSubmitTx({unsignedTx, useUSB: transportType === 'USB'}),
      }}
    >
      <TransferSummary wallet={wallet} unsignedTx={unsignedTx} additionalFees={additionalFees} />
    </TwoActionView>
  )
}

const Route = ({active, children}: {active: boolean; children: React.ReactNode}) => <>{active ? children : null}</>
