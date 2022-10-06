import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'

import {Button, Checkbox, Modal, Text} from '../../components'
import {spacing} from '../../theme'

type Props = {
  onConfirm: () => void
  visible: boolean
  onRequestClose: () => void
}

export const MnemonicBackupImportanceModal = ({onConfirm, visible, onRequestClose}: Props) => {
  const strings = useStrings()
  const [acceptedKeyStorage, setAcceptedKeyStorage] = React.useState(false)
  const [acceptedNewDeviceRecovery, setAcceptedNewDeviceRecovery] = React.useState(false)

  return (
    <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
      <Text style={styles.title}>{strings.title}</Text>
      <Checkbox
        style={styles.checkbox}
        onChange={setAcceptedKeyStorage}
        checked={acceptedKeyStorage}
        text={strings.keysStorageCheckbox}
        testID="mnemonicBackupImportanceModal::checkBox1"
      />
      <Checkbox
        style={styles.checkbox}
        onChange={setAcceptedNewDeviceRecovery}
        checked={acceptedNewDeviceRecovery}
        text={strings.newDeviceRecoveryCheckbox}
        testID="mnemonicBackupImportanceModal::checkBox2"
      />
      <Button
        disabled={!acceptedKeyStorage || !acceptedNewDeviceRecovery}
        onPress={onConfirm}
        title={strings.confirmationButton}
        testID="mnemonicBackupImportanceModal::confirm"
      />
    </Modal>
  )
}

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

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
    keysStorageCheckbox: intl.formatMessage(messages.keysStorageCheckbox),
    newDeviceRecoveryCheckbox: intl.formatMessage(messages.newDeviceRecoveryCheckbox),
    confirmationButton: intl.formatMessage(messages.confirmationButton),
  }
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    color: '#163fa0',
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
    marginBottom: spacing.paragraphBottomMargin,
  },
  checkbox: {
    marginBottom: spacing.paragraphBottomMargin,
  },
})
