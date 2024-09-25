import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Alert, Platform, ScrollView, StyleSheet} from 'react-native'
import DeviceInfo from 'react-native-device-info'

import {Button} from '../../../components/Button/Button'
import {Space} from '../../../components/Space/Space'
import {Text} from '../../../components/Text'
import globalMessages from '../../../kernel/i18n/global-messages'
import {HARDWARE_WALLETS, useLedgerPermissions} from '../../../yoroi-wallets/hw/hw'

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
  const {styles} = useStyles()
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
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>{strings.title}</Text>

      <Space height="lg" />

      <Text style={styles.paragraph}>{strings.usbExplanation}</Text>

      <Space height="md" />

      <Button
        block
        shelleyTheme
        onPress={onSelectUSB}
        title={getUsbButtonTitle()}
        disabled={!isUSBSupported || !HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT}
        testID="connectWithUSBButton"
      />

      <Space height="md" />

      <Text style={styles.paragraph}>{strings.bluetoothExplanation}</Text>

      <Space height="md" />

      <Button
        block
        shelleyTheme
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

const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      ...atoms.px_lg,
    },
    heading: {
      ...atoms.heading_3_medium,
      textAlign: 'center',
    },
    paragraph: {
      ...atoms.body_1_lg_regular,
    },
  })

  return {styles} as const
}
