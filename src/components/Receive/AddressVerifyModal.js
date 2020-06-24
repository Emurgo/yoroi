// @flow

import React from 'react'
import {View, ScrollView, ActivityIndicator} from 'react-native'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {Text, Button, Modal} from '../UiKit'
import {confirmationMessages} from '../../i18n/global-messages'
import HWInstructions from '../Ledger/HWInstructions'

import styles from './styles/AddressVerifyModal.style'

import type {ComponentType} from 'react'

const messages = defineMessages({
  title: {
    id: 'components.receive.addressverifymodal.title',
    defaultMessage: '!!!Verify Address on Ledger',
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
  useUSB: boolean,
|}

const AddressVerifyModal = ({
  intl,
  visible,
  onConfirm,
  onRequestClose,
  address,
  path,
  isWaiting,
  useUSB,
}: Props) => (
  <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
    <ScrollView style={styles.scrollView}>
      <View style={styles.heading}>
        <Text style={styles.title}>{intl.formatMessage(messages.title)}</Text>
      </View>
      <HWInstructions useUSB={useUSB} />
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
      <Button
        onPress={onConfirm}
        title={intl.formatMessage(
          confirmationMessages.commonButtons.confirmButton,
        )}
        style={styles.button}
        disabled={isWaiting}
      />
      {isWaiting && <ActivityIndicator />}
    </ScrollView>
  </Modal>
)

export default injectIntl((AddressVerifyModal: ComponentType<Props>))
