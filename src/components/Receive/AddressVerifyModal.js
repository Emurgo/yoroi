// @flow

import React from 'react'
import {View, ScrollView, Platform, ActivityIndicator} from 'react-native'
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
  afterConfirm: {
    id: 'components.receive.addressverifymodal.afterConfirm',
    defaultMessage:
      '!!!Once you tap on confirm, validate the address on your Ledger ' +
      'device, making sure both the path and the address match what is shown ' +
      'below:',
  },
})

type Props = {|
  intl: intlShape,
  visible: boolean,
  onConfirm: () => void,
  onRequestClose: () => any,
  address: string,
  path: string,
  isWaiting: boolean,
|}

const AddressVerifyModal = ({
  intl,
  visible,
  onConfirm,
  onRequestClose,
  address,
  path,
  isWaiting,
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
      <View style={styles.heading}>
        <Text style={styles.title}>{intl.formatMessage(messages.title)}</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.paragraph}>
          {intl.formatMessage(messages.beforeConfirm)}
        </Text>
        {rows.map((row, i) => (
          <BulletPointItem textRow={row} key={i} style={styles.paragraph} />
        ))}
      </ScrollView>
      <Text style={styles.paragraph}>
        {intl.formatMessage(messages.afterConfirm)}
      </Text>
      <View style={styles.addressDetailsView}>
        <Text secondary style={styles.paragraph}>
          {address}
        </Text>
        <Text secondary style={styles.paragraph}>
          {path}
        </Text>
      </View>
      {/* </ScrollView> */}
      <Button
        onPress={onConfirm}
        title={intl.formatMessage(
          confirmationMessages.commonButtons.confirmButton,
        )}
        style={styles.button}
        disabled={isWaiting}
      />
      {isWaiting && <ActivityIndicator />}
    </Modal>
  )
}

export default injectIntl((AddressVerifyModal: ComponentType<Props>))
