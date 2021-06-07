// @flow

import React, {useState} from 'react'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import {Text, Button, Checkbox, Modal} from '../UiKit'
import globalMessages, {confirmationMessages} from '../../i18n/global-messages'

import styles from './styles/CatalystBackupCheckModal.style'

const messages = defineMessages({
  pinCheckbox: {
    id: 'components.catalyst.catalystbackupcheckmodal.pinCheckbox',
    defaultMessage:
      '!!!I have written down my Catalyst PIN which I obtained in previous steps.',
  },
  qrCodeCheckbox: {
    id: 'components.catalyst.catalystbackupcheckmodal.qrCodeCheckbox',
    defaultMessage:
      '!!!I have taken a screenshot of my QR code and saved my ' +
      'Catalyst secret code as a fallback.',
  },
  consequencesCheckbox: {
    id: 'components.catalyst.catalystbackupcheckmodal.consequencesCheckbox',
    defaultMessage:
      '!!!I understand that if I did not save my Catalyst PIN and QR code ' +
      '(or secret code) I will not be able to register and vote for Catalyst' +
      'proposals.',
  },
})

type Props = {|
  onConfirm: () => void,
  intl: IntlShape,
  visible: boolean,
  onRequestClose: () => void,
|}

const CatalystBackupCheckModal = ({
  onConfirm,
  intl,
  visible,
  onRequestClose,
}: Props) => {
  const [acceptedPin, setAcceptedPin] = useState<boolean>(false)
  const [acceptedQrCode, setAcceptedQrCode] = useState<boolean>(false)
  const [acceptedConsequences, setAcceptedConsequences] = useState<boolean>(
    false,
  )
  return (
    <Modal visible={visible} onRequestClose={onRequestClose} showCloseIcon>
      <Text style={styles.title}>
        {intl.formatMessage(globalMessages.pleaseConfirm)}
      </Text>
      <Checkbox
        style={styles.checkbox}
        onChange={(value) => setAcceptedPin(value)}
        checked={acceptedPin}
        text={intl.formatMessage(messages.pinCheckbox)}
      />
      <Checkbox
        style={styles.checkbox}
        onChange={(value) => setAcceptedQrCode(value)}
        checked={acceptedQrCode}
        text={intl.formatMessage(messages.qrCodeCheckbox)}
      />
      <Checkbox
        style={styles.checkbox}
        onChange={(value) => setAcceptedConsequences(value)}
        checked={acceptedConsequences}
        text={intl.formatMessage(messages.consequencesCheckbox)}
      />
      <Button
        disabled={!acceptedPin || !acceptedQrCode || !acceptedConsequences}
        onPress={onConfirm}
        title={intl.formatMessage(
          confirmationMessages.commonButtons.continueButton,
        )}
      />
    </Modal>
  )
}

export default injectIntl(CatalystBackupCheckModal)
