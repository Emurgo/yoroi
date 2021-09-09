// @flow

import React, {useState} from 'react'
import {StyleSheet, View} from 'react-native'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import {Text, Button, Checkbox, Modal, Spacer} from '../UiKit'
import globalMessages, {confirmationMessages} from '../../i18n/global-messages'

const messages = defineMessages({
  pinCheckbox: {
    id: 'components.catalyst.catalystbackupcheckmodal.pinCheckbox',
    defaultMessage: '!!!I have written down my Catalyst PIN which I obtained in previous steps.',
  },
  qrCodeCheckbox: {
    id: 'components.catalyst.catalystbackupcheckmodal.qrCodeCheckbox',
    defaultMessage: '!!!I have taken a screenshot of my QR code and saved my Catalyst secret code as a fallback.',
  },
  consequencesCheckbox: {
    id: 'components.catalyst.catalystbackupcheckmodal.consequencesCheckbox',
    defaultMessage:
      '!!!I understand that if I did not save my Catalyst PIN and QR code ' +
      '(or secret code) I will not be able to register and vote for Catalyst' +
      'proposals.',
  },
})

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    lineHeight: 22,
    fontWeight: 'bold',
  },
})

type Props = {
  onConfirm: () => void,
  intl: IntlShape,
  visible: boolean,
  onRequestClose: () => void,
}

const CatalystBackupCheckModal = ({onConfirm, intl, visible, onRequestClose}: Props) => {
  const [acceptedPin, setAcceptedPin] = useState(false)
  const [acceptedQrCode, setAcceptedQrCode] = useState(false)
  const [acceptedConsequences, setAcceptedConsequences] = useState(false)

  return (
    <Modal visible={visible} onRequestClose={() => onRequestClose()} showCloseIcon>
      <View style={{alignItems: 'center'}}>
        <Text style={styles.title}>{intl.formatMessage(globalMessages.pleaseConfirm)}</Text>
      </View>

      <Spacer height={16} />

      <PinCheckbox onChange={setAcceptedPin} checked={acceptedPin} text={intl.formatMessage(messages.pinCheckbox)} />

      <Spacer height={16} />

      <QRCodeCheckbox
        onChange={setAcceptedQrCode}
        checked={acceptedQrCode}
        text={intl.formatMessage(messages.qrCodeCheckbox)}
      />

      <Spacer height={16} />

      <ConsequencesCheckbox
        onChange={setAcceptedConsequences}
        checked={acceptedConsequences}
        text={intl.formatMessage(messages.consequencesCheckbox)}
      />

      <Spacer height={16} />

      <Button
        disabled={!acceptedPin || !acceptedQrCode || !acceptedConsequences}
        onPress={() => onConfirm()}
        title={intl.formatMessage(confirmationMessages.commonButtons.continueButton)}
      />
    </Modal>
  )
}

export default injectIntl(CatalystBackupCheckModal)

const PinCheckbox = Checkbox
const QRCodeCheckbox = Checkbox
const ConsequencesCheckbox = Checkbox
