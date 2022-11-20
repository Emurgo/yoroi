import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Platform, ScrollView, StyleSheet, View} from 'react-native'
import DeviceInfo from 'react-native-device-info'

import {Button, Modal, Spacer, Text} from '../../components'
import {CONFIG} from '../../legacy/config'
import {COLORS} from '../../theme'

type Props = {
  onSelectUSB: () => void
  onSelectBLE: () => void
}

const useIsUsbSupported = () => {
  const [isUSBSupported, setUSBSupported] = React.useState(false)
  React.useEffect(() => {
    DeviceInfo.getApiLevel().then((sdk) =>
      setUSBSupported(Platform.OS === 'android' && sdk >= CONFIG.HARDWARE_WALLETS.LEDGER_NANO.USB_MIN_SDK),
    )
  }, [])

  return isUSBSupported
}

export const LedgerTransportSwitchView = ({onSelectUSB, onSelectBLE}: Props) => {
  const strings = useStrings()
  const isUSBSupported = useIsUsbSupported()

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.content}>
        <View style={styles.center}>
          <Text style={styles.title}>{strings.title}</Text>
        </View>

        <Spacer height={16} />

        {Platform.OS === 'android' && (
          <>
            <Text style={styles.paragraph}>{strings.usbHelp}</Text>
            <Spacer height={16} />
            <Button
              block
              onPress={onSelectUSB}
              title={strings.usbButton}
              disabled={!isUSBSupported || !CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT}
              style={styles.button}
              fontStyle={styles.buttonText}
              testID="connectWithUSBButton"
              outlineShelley
            />
            <Spacer height={16} />
          </>
        )}

        <Text style={styles.paragraph}>{strings.bluetoothHelp}</Text>
        <Spacer height={16} />
        <Button
          block
          onPress={onSelectBLE}
          title={strings.bluetoothButton}
          style={styles.button}
          testID="connectWithBLEButton"
          fontStyle={styles.buttonText}
          outlineShelley
        />

        {Platform.OS === 'ios' && (
          <View style={styles.center}>
            <Spacer height={26} />
            <Text style={[styles.paragraph, styles.disabled]}>{strings.usbDisabled}</Text>
          </View>
        )}
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
  usbDisabled: {
    id: 'components.ledger.ledgertransportswitchmodal.usbDisabled',
    defaultMessage: '!!!Blocked by Apple for iOS',
  },
  bluetoothExplanation: {
    id: 'components.ledger.ledgertransportswitchmodal.bluetoothExplanation',
    defaultMessage: '!!!Choose this option if you want to connect to a Ledger Nano model X through Bluetooth:',
  },
  bluetoothButton: {
    id: 'components.ledger.ledgertransportswitchmodal.bluetoothButton',
    defaultMessage: '!!!Connect with Bluetooth',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
    usbButton: intl.formatMessage(messages.usbButton),
    usbHelp: intl.formatMessage(messages.usbExplanation),
    usbDisabled: intl.formatMessage(messages.usbDisabled),
    bluetoothButton: intl.formatMessage(messages.bluetoothButton),
    bluetoothHelp: intl.formatMessage(messages.bluetoothExplanation),
  }
}

const styles = StyleSheet.create({
  scrollView: {
    paddingRight: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
  },
  disabled: {
    color: COLORS.WORD_BADGE_TEXT,
  },
  content: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: 'bold',
  },
  button: {
    borderWidth: 2,
  },
  buttonText: {
    fontWeight: '500',
    fontFamily: 'Rubik-Medium',
  },
})
