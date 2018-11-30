// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withState} from 'recompose'

import {Text, Button, Checkbox, Modal} from '../../UiKit'
import styles from './styles/MnemonicBackupImportanceModal.style'

import type {State} from '../../../state'
import type {SubTranslation} from '../../../l10n/typeHelpers'

const getTranslations = (state: State) =>
  state.trans.MnemonicBackupImportanceModal

type Props = {
  onConfirm: () => any,
  translations: SubTranslation<typeof getTranslations>,
  acceptedKeyStorage: boolean,
  acceptedNewDeviceRecovery: boolean,
  setAcceptedKeyStorage: (accepted: boolean) => any,
  setAcceptedNewDeviceRecovery: (accepted: boolean) => any,
  visible: boolean,
  onRequestClose: () => any,
}

const MnemonicBackupImportanceModal = ({
  onConfirm,
  translations,
  acceptedKeyStorage,
  setAcceptedKeyStorage,
  acceptedNewDeviceRecovery,
  setAcceptedNewDeviceRecovery,
  visible,
  onRequestClose,
}: Props) => (
  <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
    <Text style={styles.title}>{translations.title}</Text>
    <Checkbox
      style={styles.checkbox}
      onChange={setAcceptedKeyStorage}
      checked={acceptedKeyStorage}
      text={translations.keysStorageCheckbox}
    />
    <Checkbox
      style={styles.checkbox}
      onChange={setAcceptedNewDeviceRecovery}
      checked={acceptedNewDeviceRecovery}
      text={translations.newDeviceRecoveryCheckbox}
    />
    <Button
      disabled={!acceptedKeyStorage || !acceptedNewDeviceRecovery}
      onPress={onConfirm}
      title={translations.confirmationButton}
    />
  </Modal>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withState('acceptedKeyStorage', 'setAcceptedKeyStorage', false),
  withState('acceptedNewDeviceRecovery', 'setAcceptedNewDeviceRecovery', false),
)(MnemonicBackupImportanceModal)
