// @flow

import React from 'react'
import {View, ScrollView, Platform} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {Text, Button, Modal} from '../UiKit'

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

type Props = {|
  intl: intlShape,
  visible: boolean,
  onSelectUSB: () => any,
  onSelectBLE: () => any,
  onRequestClose: () => any,
|}

const LedgerTransportSwitchModal = ({
  intl,
  visible,
  onSelectUSB,
  onSelectBLE,
  onRequestClose,
  disableButtons,
}: Props) => {
  return (
    <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.heading}>
            <Text style={styles.title}>
              {intl.formatMessage(messages.title)}
            </Text>
          </View>
          <Text style={styles.paragraph}>
            {intl.formatMessage(messages.usbExplanation)}
          </Text>
          <Button
            block
            onPress={onSelectUSB}
            title={
              Platform.OS === 'iOS'
                ? intl.formatMessage(messages.usbButtonDisabled)
                : intl.formatMessage(messages.usbButton)
            }
            disabled={Platform.OS === 'iOS'}
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
    </Modal>
  )
}

export default injectIntl((LedgerTransportSwitchModal: ComponentType<Props>))
