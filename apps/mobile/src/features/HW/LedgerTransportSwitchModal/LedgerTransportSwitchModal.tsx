import {atoms as a} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Alert, Platform, ScrollView, Text} from 'react-native'
import DeviceInfo from 'react-native-device-info'

import globalMessages from '../../../kernel/i18n/global-messages'
import {Button} from '../../../ui/Button/Button'
import {Space} from '../../../ui/Space/Space'
import {HARDWARE_WALLETS, useLedgerPermissions} from '../../../wallets/hw/hw'

type Props = {
  onSelectUSB: () => void
  onSelectBLE: () => void
}

export const useIsUsbSupported = () => {
  const [isUSBSupported, setUSBSupported] = React.useState(false)
  React.useEffect(() => {
    DeviceInfo.getApiLevel().then((sdk) =>
      setUSBSupported(
        Platform.OS === 'android' &&
          sdk >= HARDWARE_WALLETS.LEDGER_NANO.USB_MIN_SDK,
      ),
    )
  }, [])

  return isUSBSupported
}

export const LedgerTransportSwitchView = ({
  onSelectUSB,
  onSelectBLE,
}: Props) => {
  const strings = useStrings()
  const isUSBSupported = useIsUsbSupported()

  const {request} = useLedgerPermissions({
    onError: () => Alert.alert(strings.error, strings.bluetoothError),
    onSuccess: onSelectBLE,
  })

  const getUsbButtonTitle = (): string => {
    if (Platform.OS === 'ios') {
      return strings.usbButtonDisabled
    } else if (
      !HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT ||
      !isUSBSupported
    ) {
      return strings.usbButtonNotSupported
    } else {
      return strings.usbButton
    }
  }

  return (
    <ScrollView style={[a.flex_1, a.px_lg]}>
      <Text style={[a.heading_3_medium, a.text_center]}>{strings.title}</Text>

      <Space.Height.lg />

      <Text style={a.body_1_lg_regular}>{strings.usbExplanation}</Text>

      <Space.Height.md />

      <Button
        onPress={onSelectUSB}
        title={getUsbButtonTitle()}
        disabled={
          !isUSBSupported || !HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT
        }
        testID="connectWithUSBButton"
      />

      <Space.Height.md />

      <Text style={a.body_1_lg_regular}>{strings.bluetoothExplanation}</Text>

      <Space.Height.md />

      <Button
        onPress={() => request()}
        title={strings.bluetoothButton}
        testID="connectWithBLEButton"
      />
    </ScrollView>
  )
}

export const LedgerTransportSwitch = LedgerTransportSwitchView

const messages = defineMessages({
  title: {
    id: 'components.ledger.ledgertransportswitchmodal.title',
    defaultMessage: '!!!Choose Connection Method',
  },
  usbExplanation: {
    id: 'components.ledger.ledgertransportswitchmodal.usbExplanation',
    defaultMessage:
      '!!!Choose this option if you want to connect to a Ledger Nano model X ' +
      'or S using an on-the-go USB cable adaptor:',
  },
  usbButton: {
    id: 'components.ledger.ledgertransportswitchmodal.usbButton',
    defaultMessage: '!!!Connect with USB',
  },
  usbButtonNotSupported: {
    id: 'components.ledger.ledgertransportswitchmodal.usbButtonNotSupported',
    defaultMessage: '!!!Connect with USB\n(Not supported)',
  },
  usbButtonDisabled: {
    id: 'components.ledger.ledgertransportswitchmodal.usbButtonDisabled',
    defaultMessage: '!!!Connect with USB\n(Blocked by Apple for iOS)',
  },
  bluetoothExplanation: {
    id: 'components.ledger.ledgertransportswitchmodal.bluetoothExplanation',
    defaultMessage:
      '!!!Choose this option if you want to connect to a Ledger Nano model X through Bluetooth:',
  },
  bluetoothButton: {
    id: 'components.ledger.ledgertransportswitchmodal.bluetoothButton',
    defaultMessage: '!!!Connect with Bluetooth',
  },
  bluetoothError: {
    id: 'global.ledgerMessages.bluetoothDisabledError',
    defaultMessage: '!!!Connect with Bluetooth',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    error: intl.formatMessage(globalMessages.error),
    title: intl.formatMessage(messages.title),
    usbExplanation: intl.formatMessage(messages.usbExplanation),
    usbButton: intl.formatMessage(messages.usbButton),
    usbButtonNotSupported: intl.formatMessage(messages.usbButtonNotSupported),
    usbButtonDisabled: intl.formatMessage(messages.usbButtonDisabled),
    bluetoothExplanation: intl.formatMessage(messages.bluetoothExplanation),
    bluetoothButton: intl.formatMessage(messages.bluetoothButton),
    bluetoothError: intl.formatMessage(messages.bluetoothError),
  }
}
