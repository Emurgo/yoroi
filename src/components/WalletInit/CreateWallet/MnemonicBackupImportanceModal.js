// @flow

import React from 'react'
import {type IntlShape, defineMessages, injectIntl} from 'react-intl'

import {Button, Checkbox, Modal, Text} from '../../UiKit'
import styles from './styles/MnemonicBackupImportanceModal.style'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.createwallet.mnemonicbackupimportancemodal.title',
    defaultMessage: '!!!Recovery phrase',
  },
  keysStorageCheckbox: {
    id: 'components.walletinit.createwallet.mnemonicbackupimportancemodal.keysStorageCheckbox',
    defaultMessage:
      '!!!I understand that my secret keys are held securely on this device only, not on the company`s servers',
  },
  newDeviceRecoveryCheckbox: {
    id: 'components.walletinit.createwallet.mnemonicbackupimportancemodal.newDeviceRecoveryCheckbox',
    defaultMessage:
      '!!!I understand that if this application is moved to another device ' +
      'or deleted, my money can be only recovered with the backup phrase that ' +
      'I have written down and saved in a secure place.',
  },
  confirmationButton: {
    id: 'components.walletinit.createwallet.mnemonicbackupimportancemodal.confirmationButton',
    defaultMessage: '!!!I understand',
  },
})

type Props = {
  onConfirm: () => any,
  intl: IntlShape,
  visible: boolean,
  onRequestClose: () => any,
}

const MnemonicBackupImportanceModal = ({onConfirm, intl, visible, onRequestClose}: Props) => {
  const [acceptedKeyStorage, setAcceptedKeyStorage] = React.useState(false)
  const [acceptedNewDeviceRecovery, setAcceptedNewDeviceRecovery] = React.useState(false)

  return (
    <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
      <Text style={styles.title}>{intl.formatMessage(messages.title)}</Text>
      <Checkbox
        style={styles.checkbox}
        onChange={setAcceptedKeyStorage}
        checked={acceptedKeyStorage}
        text={intl.formatMessage(messages.keysStorageCheckbox)}
        testID="mnemonicBackupImportanceModal::checkBox1"
      />
      <Checkbox
        style={styles.checkbox}
        onChange={setAcceptedNewDeviceRecovery}
        checked={acceptedNewDeviceRecovery}
        text={intl.formatMessage(messages.newDeviceRecoveryCheckbox)}
        testID="mnemonicBackupImportanceModal::checkBox2"
      />
      <Button
        disabled={!acceptedKeyStorage || !acceptedNewDeviceRecovery}
        onPress={onConfirm}
        title={intl.formatMessage(messages.confirmationButton)}
        testID="mnemonicBackupImportanceModal::confirm"
      />
    </Modal>
  )
}

export default injectIntl(MnemonicBackupImportanceModal)
