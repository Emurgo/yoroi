// @flow

import React from 'react'
import {compose} from 'redux'
import {withStateHandlers} from 'recompose'
import {injectIntl, defineMessages} from 'react-intl'

import {Text, Button, Checkbox, Modal} from '../../UiKit'
import styles from './styles/MnemonicBackupImportanceModal.style'

const messages = defineMessages({
  title: {
    id:
      'components.walletinit.createwallet.mnemonicbackupimportancemodal.title',
    defaultMessage: '!!!Recovery phrase',
  },
  keysStorageCheckbox: {
    id:
      'components.walletinit.createwallet.mnemonicbackupimportancemodal.keysStorageCheckbox',
    defaultMessage:
      '!!!I understand that my secret keys are held securely ' +
      'on this device only, not on the company`s servers',
  },
  newDeviceRecoveryCheckbox: {
    /* eslint-disable max-len */
    id:
      'components.walletinit.createwallet.mnemonicbackupimportancemodal.newDeviceRecoveryCheckbox',
    defaultMessage:
      '!!!I understand that if this application is moved to another device ' +
      'or deleted, my money can be only recovered with the backup phrase that ' +
      'I have written down and saved in a secure place.',
  },
  confirmationButton: {
    id:
      'components.walletinit.createwallet.mnemonicbackupimportancemodal.confirmationButton',
    defaultMessage: '!!!I understand',
  },
})

type Props = {
  onConfirm: () => any,
  intl: any,
  acceptedKeyStorage: boolean,
  acceptedNewDeviceRecovery: boolean,
  setAcceptedKeyStorage: (accepted: boolean) => any,
  setAcceptedNewDeviceRecovery: (accepted: boolean) => any,
  visible: boolean,
  onRequestClose: () => any,
}

const MnemonicBackupImportanceModal = ({
  onConfirm,
  intl,
  acceptedKeyStorage,
  setAcceptedKeyStorage,
  acceptedNewDeviceRecovery,
  setAcceptedNewDeviceRecovery,
  visible,
  onRequestClose,
}: Props) => (
  <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
    <Text style={styles.title}>{intl.formatMessage(messages.title)}</Text>
    <Checkbox
      style={styles.checkbox}
      onChange={setAcceptedKeyStorage}
      checked={acceptedKeyStorage}
      text={intl.formatMessage(messages.keysStorageCheckbox)}
    />
    <Checkbox
      style={styles.checkbox}
      onChange={setAcceptedNewDeviceRecovery}
      checked={acceptedNewDeviceRecovery}
      text={intl.formatMessage(messages.newDeviceRecoveryCheckbox)}
    />
    <Button
      disabled={!acceptedKeyStorage || !acceptedNewDeviceRecovery}
      onPress={onConfirm}
      title={intl.formatMessage(messages.confirmationButton)}
    />
  </Modal>
)

export default injectIntl(
  compose(
    withStateHandlers(
      {
        acceptedKeyStorage: false,
        acceptedNewDeviceRecovery: false,
      },
      {
        setAcceptedKeyStorage: (state) => (value) => ({
          acceptedKeyStorage: value,
        }),
        setAcceptedNewDeviceRecovery: (state) => (value) => ({
          acceptedNewDeviceRecovery: value,
        }),
      },
    ),
  )(MnemonicBackupImportanceModal),
)
