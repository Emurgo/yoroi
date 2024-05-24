import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Alert, Platform, ScrollView, StyleSheet, View} from 'react-native'
import DeviceInfo from 'react-native-device-info'

import {Button, Text} from '../../components'
import globalMessages from '../../kernel/i18n/global-messages'
import {Modal} from '../../legacy/Modal'
import {HARDWARE_WALLETS, useLedgerPermissions} from '../../yoroi-wallets/hw'

type Props = {
  onSelectUSB: () => void
  onSelectBLE: () => void
}

export const useIsUsbSupported = () => {
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

  const getUsbButtonTitle = (): string => {
    if (Platform.OS === 'ios') {
      return strings.usbButtonDisabled
    } else if (!HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT || !isUSBSupported) {
      return strings.usbButtonNotSupported
    } else {
      return strings.usbButton
    }
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.content}>
        <View style={styles.heading}>
          <Text style={styles.title}>{strings.title}</Text>
        </View>

        <Text style={styles.paragraph}>{strings.usbExplanation}</Text>

        <Button
          block
          onPress={onSelectUSB}
          title={getUsbButtonTitle()}
          disabled={!isUSBSupported || !HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT}
          style={styles.button}
          testID="connectWithUSBButton"
        />

        <Text style={styles.paragraph}>{strings.bluetoothExplanation}</Text>

        <Button
          block
          onPress={() => request()}
          title={strings.bluetoothButton}
          style={styles.button}
          testID="connectWithBLEButton"
        />
      </View>
    </ScrollView>
  )
}

export const LedgerTransportSwitch = LedgerTransportSwitchView

type ModalProps = {
  visible: boolean
  onRequestClose: () => void
  showCloseIcon?: boolean
} & Props

export const LedgerTransportSwitchModal = ({
  visible,
  onSelectUSB,
  onSelectBLE,
  onRequestClose,
  showCloseIcon,
}: ModalProps) => (
  <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon={showCloseIcon}>
    <LedgerTransportSwitch onSelectUSB={onSelectUSB} onSelectBLE={onSelectBLE} />
  </Modal>
)

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

const styles = StyleSheet.create({
  scrollView: {
    paddingRight: 10,
  },
  paragraph: {
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    marginBottom: 24,
  },
  heading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  button: {
    marginHorizontal: 10,
    marginBottom: 16,
  },
})
