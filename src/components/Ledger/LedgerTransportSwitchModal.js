// @flow

import React from 'react'
import {View, ScrollView, Platform} from 'react-native'
import {compose} from 'redux'
import {withStateHandlers} from 'recompose'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'
import DeviceInfo from 'react-native-device-info'

import {Text, Button, Modal} from '../UiKit'
import {CONFIG} from '../../config/config'
import {onDidMount} from '../../utils/renderUtils'

import styles from './styles/LedgerTransportSwitchModal.style'

import type {ComponentType} from 'react'

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
  bluetoothExaplanation: {
    id: 'components.ledger.ledgertransportswitchmodal.bluetoothExaplanation',
    defaultMessage:
      '!!!Choose this option if you want to connect to a Ledger Nano model X ' +
      'through Bluetooth:',
  },
  bluetoothButton: {
    id: 'components.ledger.ledgertransportswitchmodal.bluetoothButton',
    defaultMessage: '!!!Connect with Bluetooth',
  },
})

type Props = {
  intl: IntlShape,
  onSelectUSB: () => any,
  onSelectBLE: () => any,
  isUSBSupported: boolean,
}

const LedgerTransportSwitchView = ({
  intl,
  onSelectUSB,
  onSelectBLE,
  isUSBSupported,
}: {intl: IntlShape} & Object) => {
  const getUsbButtonTitle = (): string => {
    if (Platform.OS === 'ios') {
      return intl.formatMessage(messages.usbButtonDisabled)
    } else if (
      !CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT ||
      !isUSBSupported
    ) {
      return intl.formatMessage(messages.usbButtonNotSupported)
    } else {
      return intl.formatMessage(messages.usbButton)
    }
  }
  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.content}>
        <View style={styles.heading}>
          <Text style={styles.title}>{intl.formatMessage(messages.title)}</Text>
        </View>
        <Text style={styles.paragraph}>
          {intl.formatMessage(messages.usbExplanation)}
        </Text>
        <Button
          block
          onPress={onSelectUSB}
          title={getUsbButtonTitle()}
          disabled={
            Platform.OS === 'ios' ||
            !isUSBSupported ||
            !CONFIG.HARDWARE_WALLETS.LEDGER_NANO.ENABLE_USB_TRANSPORT
          }
          style={styles.button}
        />
        <Text style={styles.paragraph}>
          {intl.formatMessage(messages.bluetoothExaplanation)}
        </Text>
        <Button
          block
          onPress={onSelectBLE}
          title={intl.formatMessage(messages.bluetoothButton)}
          style={styles.button}
        />
      </View>
    </ScrollView>
  )
}

export const LedgerTransportSwitch = injectIntl(
  (compose(
    withStateHandlers(
      {
        isUSBSupported: true, // assume true by default
      },
      {
        checkUSBSupport: () => (sdk) => {
          const isUSBSupported =
            Platform.OS === 'android' &&
            sdk >= CONFIG.HARDWARE_WALLETS.LEDGER_NANO.USB_MIN_SDK
          return {isUSBSupported}
        },
      },
    ),
    onDidMount(({checkUSBSupport}) =>
      DeviceInfo.getApiLevel().then((sdk) => checkUSBSupport(sdk)),
    ),
  )(LedgerTransportSwitchView): ComponentType<Props>),
)

type ModalProps = {|
  visible: boolean,
  onSelectUSB: () => any,
  onSelectBLE: () => any,
  onRequestClose: () => any,
  showCloseIcon?: boolean,
|}

const LedgerTransportSwitchModal = ({
  visible,
  onSelectUSB,
  onSelectBLE,
  onRequestClose,
  showCloseIcon,
}: ModalProps) => (
  <Modal
    visible={visible}
    onRequestClose={onRequestClose}
    showCloseIcon={showCloseIcon === true}
  >
    {/* $FlowFixMe */}
    <LedgerTransportSwitch
      onSelectUSB={onSelectUSB}
      onSelectBLE={onSelectBLE}
    />
  </Modal>
)

export default LedgerTransportSwitchModal
