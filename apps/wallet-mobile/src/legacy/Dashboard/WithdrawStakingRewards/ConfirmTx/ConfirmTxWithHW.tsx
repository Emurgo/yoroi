import {useTheme} from '@yoroi/theme'
import {App, HW} from '@yoroi/types'
import React from 'react'
import {useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {Boundary} from '../../../../components/Boundary/Boundary'
import {TwoActionView} from '../../../../components/TwoActionView/TwoActionView'
import {useSelectedWallet} from '../../../../features/WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../../../features/WalletManager/context/WalletManagerProvider'
import {confirmationMessages, txLabels} from '../../../../kernel/i18n/global-messages'
import {throwLoggedError} from '../../../../kernel/logger/helpers/throw-logged-error'
import {useSignWithHwAndSubmitTx} from '../../../../yoroi-wallets/hooks'
import {withBLE, withUSB} from '../../../../yoroi-wallets/hw/hwWallet'
import {YoroiUnsignedTx} from '../../../../yoroi-wallets/types/yoroi'
import {LedgerConnect, LedgerTransportSwitch} from '../../../HW'
import {TransferSummary} from '../TransferSummary/TransferSummary'

type Props = {
  unsignedTx: YoroiUnsignedTx
  onCancel: () => void
  onSuccess: () => void
}

type TransportType = 'USB' | 'BLE'

export const ConfirmTxWithHW = (props: Props) => {
  const {meta} = useSelectedWallet()
  const {walletManager} = useWalletManager()
  const [transportType, setTransportType] = React.useState<TransportType>('USB')
  const [step, setStep] = React.useState<'select-transport' | 'connect-transport' | 'confirm'>('select-transport')
  const {styles} = useStyles()

  const onSelectTransport = (transportType: TransportType) => {
    setTransportType(transportType)
    setStep('connect-transport')
  }

  const onConnectBLE = (deviceId: string) => {
    const hwDeviceInfo = withBLE(meta, deviceId)
    walletManager.updateWalletHWDeviceInfo(meta.id, hwDeviceInfo)
    setStep('confirm')
  }

  const onConnectUSB = (deviceObj: HW.DeviceObj) => {
    const hwDeviceInfo = withUSB(meta, deviceObj)
    walletManager.updateWalletHWDeviceInfo(meta.id, hwDeviceInfo)
    setStep('confirm')
  }

  return (
    <View style={styles.container}>
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
    </View>
  )
}

const Confirm = ({onSuccess, onCancel, unsignedTx, transport: transportType}: Props & {transport: TransportType}) => {
  const strings = useStrings()
  const {wallet, meta} = useSelectedWallet()

  const {signAndSubmitTx, isLoading} = useSignWithHwAndSubmitTx(
    {wallet}, //
    {signTx: {onSuccess}},
  )

  const handleSignAndSubmitTx = () => {
    if (meta.hwDeviceInfo == null)
      throwLoggedError(new App.Errors.InvalidState('ConfirmTxWithHW: HW device info missing'))

    signAndSubmitTx({unsignedTx, useUSB: transportType === 'USB', hwDeviceInfo: meta.hwDeviceInfo})
  }

  return (
    <TwoActionView
      title={strings.confirmTx}
      primaryButton={{
        disabled: isLoading,
        label: strings.confirmButton,
        onPress: handleSignAndSubmitTx,
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

const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...atoms.flex_1,
      ...atoms.px_lg,
    },
  })

  return {styles} as const
}
