// @flow

import React from 'react'
import {View, ScrollView, Platform} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {Text, Button, Modal, BulletPointItem} from '../UiKit'
import {ledgerMessages, confirmationMessages} from '../../i18n/global-messages'

import styles from './styles/AddressVerifyModal.style'

import type {ComponentType} from 'react'

const messages = defineMessages({
  title: {
    id: 'components.receive.addressverifymodal.title',
    defaultMessage: '!!!Verify Address on Ledger',
  },
  beforeConfirm: {
    id: 'components.send.confirmscreen.beforeConfirm',
    defaultMessage:
      '!!!Before tapping on confirm, please follow these instructions:',
  },
})

type Props = {|
  intl: intlShape,
  visible: boolean,
  onConfirm: () => void,
  onRequestClose: () => any,
|}

const AddressVerifyModal = ({
  intl,
  visible,
  onConfirm,
  onRequestClose,
}: Props) => {
  const rows: Array<string> = []
  if (Platform.OS === 'android') {
    rows.push(intl.formatMessage(ledgerMessages.enableLocation))
  }
  rows.push(
    intl.formatMessage(ledgerMessages.enableTransport),
    intl.formatMessage(ledgerMessages.enterPin),
    intl.formatMessage(ledgerMessages.openApp),
  )
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
            {intl.formatMessage(messages.beforeConfirm)}
          </Text>
          {rows.map((row, i) => (
            <BulletPointItem textRow={row} key={i} style={styles.paragraph} />
          ))}
          <Button
            block
            onPress={onConfirm}
            title={intl.formatMessage(
              confirmationMessages.commonButtons.confirmButton,
            )}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </Modal>
  )
}

export default injectIntl((AddressVerifyModal: ComponentType<Props>))
