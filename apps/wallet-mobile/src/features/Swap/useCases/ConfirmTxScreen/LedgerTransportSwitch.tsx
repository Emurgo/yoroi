import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Alert, Platform, ScrollView, StyleSheet, View} from 'react-native'
import DeviceInfo from 'react-native-device-info'

import {Button, Spacer, Text} from '../../../../components'
import globalMessages from '../../../../i18n/global-messages'
import {spacing} from '../../../../theme'
import {HARDWARE_WALLETS, useLedgerPermissions} from '../../../../yoroi-wallets/hw'

type Props = {
  onSelectUSB: () => void
  onSelectBLE: () => void
}

const useIsUsbSupported = () => {
  const [isUSBSupported, setUSBSupported] = React.useState(false)
  React.useEffect(() => {
    DeviceInfo.getApiLevel().then((sdk) =>
      setUSBSupported(Platform.OS === 'android' && sdk >= HARDWARE_WALLETS.LEDGER_NANO.USB_MIN_SDK),
    )
  }, [])

  return isUSBSupported
}

export const LedgerTransportSwitchView = ({onSelectUSB, onSelectBLE}: Props) => {
  const strings = useStrings()
  const isUSBSupported = useIsUsbSupported()

  const {request} = useLedgerPermissions({
    onError: () => Alert.alert(strings.error, strings.bluetoothError),
    onSuccess: onSelectBLE,
  })

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.content}>
        <Text style={styles.paragraph}>{strings.bluetoothExplanation}</Text>

        <Button
          outlineShelley
          onPress={() => request()}
          title={strings.bluetoothButton}
          testID="connectWithBLEButton"
        />

        <Spacer height={16} />

        <Text style={styles.paragraph}>{strings.usbExplanation}</Text>

        <Button
          outlineShelley
          onPress={onSelectUSB}
          title={strings.usbButton}
          disabled={!isUSBSupported || !HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT}
          testID="connectWithUSBButton"
        />

        <Text style={styles.infoText}>{strings.usbConnectionIsBlocked}</Text>
      </View>
    </ScrollView>
  )
}

export const LedgerTransportSwitch = LedgerTransportSwitchView

const messages = defineMessages({
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
  usbConnectionIsBlocked: {
    id: 'components.ledger.ledgertransportswitchmodal.usbConnectionIsBlocked',
    defaultMessage: '!!! USB connection is blocked by iOS devices',
  },
  bluetoothExplanation: {
    id: 'components.ledger.ledgertransportswitchmodal.bluetoothExplanation',
    defaultMessage: '!!!Choose this option if you want to connect to a Ledger Nano model X through Bluetooth:',
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
    usbExplanation: intl.formatMessage(messages.usbExplanation),
    usbButton: intl.formatMessage(messages.usbButton),
    usbButtonNotSupported: intl.formatMessage(messages.usbButtonNotSupported),
    usbConnectionIsBlocked: intl.formatMessage(messages.usbConnectionIsBlocked),
    bluetoothExplanation: intl.formatMessage(messages.bluetoothExplanation),
    bluetoothButton: intl.formatMessage(messages.bluetoothButton),
    bluetoothError: intl.formatMessage(messages.bluetoothError),
  }
}

const styles = StyleSheet.create({
  scrollView: {
    paddingRight: 10,
  },
  paragraph: {
    marginBottom: spacing.paragraphBottomMargin,
    fontSize: 14,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    marginBottom: 24,
  },
  infoText: {
    paddingTop: 16,
    flex: 1,
    width: '100%',
  },
})
