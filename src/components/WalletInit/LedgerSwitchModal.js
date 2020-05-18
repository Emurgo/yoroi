// @flow

import React from 'react'
import {View, ScrollView, Platform} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {Text, Button, Modal} from '../UiKit'

import styles from './styles/LedgerSwitchModal.style'

import type {ComponentType} from 'react'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.ledgerswitchmodal.title',
    defaultMessage: '!!!Choose Connection Method',
  },
  usbExplanation: {
    id: 'components.walletinit.ledgerswitchmodal.usbExplanation',
    defaultMessage:
      '!!!Choose this option if you want to connect to a Ledger Nano model X ' +
      'or S using an on-the-go USB cable adaptor:',
  },
  usbButton: {
    id: 'components.walletinit.ledgerswitchmodal.usbButton',
    defaultMessage: '!!!Connect with USB',
  },
  usbButtonDisabled: {
    id: 'components.walletinit.ledgerswitchmodal.usbButtonDisabled',
    defaultMessage: '!!!Connect with USB\n(Blocked by Apple for iOS)',
  },
  bluetoothExaplanation: {
    id: 'components.walletinit.ledgerswitchmodal.bluetoothExaplanation',
    defaultMessage:
      '!!!Choose this option if you want to connect to a Ledger Nano model X ' +
      'through Bluetooth:',
  },
  bluetoothButton: {
    id: 'components.walletinit.ledgerswitchmodal.bluetoothButton',
    defaultMessage: '!!!Connect with Bluetooth',
  },
})

type Props = {|
  intl: intlShape,
  visible: boolean,
  onPress: () => any,
  onRequestClose: () => any,
|}

const LedgerSwitchModal = ({
  intl,
  visible,
  onPress,
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
            onPress={() => ({})}
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
            onPress={() => ({})}
            title={intl.formatMessage(messages.bluetoothButton)}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </Modal>
  )
}

export default injectIntl((LedgerSwitchModal: ComponentType<Props>))
