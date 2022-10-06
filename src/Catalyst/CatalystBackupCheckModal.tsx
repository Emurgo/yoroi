import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {Button, Checkbox, Modal, Spacer, Text} from '../components'
import globalMessages, {confirmationMessages} from '../i18n/global-messages'

type Props = {
  onConfirm: () => void
  visible: boolean
  onRequestClose: () => void
}

export const CatalystBackupCheckModal = ({onConfirm, visible, onRequestClose}: Props) => {
  const strings = useStrings()
  const [acceptedPin, setAcceptedPin] = useState(false)
  const [acceptedQrCode, setAcceptedQrCode] = useState(false)
  const [acceptedConsequences, setAcceptedConsequences] = useState(false)

  return (
    <Modal visible={visible} onRequestClose={() => onRequestClose()} showCloseIcon>
      <View style={{alignItems: 'center'}}>
        <Text style={styles.title}>{strings.pleaseConfirm}</Text>
      </View>

      <Spacer height={16} />

      <PinCheckbox onChange={setAcceptedPin} checked={acceptedPin} text={strings.pinCheckbox} />

      <Spacer height={16} />

      <QRCodeCheckbox onChange={setAcceptedQrCode} checked={acceptedQrCode} text={strings.qrCodeCheckbox} />

      <Spacer height={16} />

      <ConsequencesCheckbox
        onChange={setAcceptedConsequences}
        checked={acceptedConsequences}
        text={strings.consequencesCheckbox}
      />

      <Spacer height={16} />

      <Button
        disabled={!acceptedPin || !acceptedQrCode || !acceptedConsequences}
        onPress={() => onConfirm()}
        title={strings.continueButton}
      />
    </Modal>
  )
}

const PinCheckbox = Checkbox
const QRCodeCheckbox = Checkbox
const ConsequencesCheckbox = Checkbox

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

const useStrings = () => {
  const intl = useIntl()

  return {
    pleaseConfirm: intl.formatMessage(globalMessages.pleaseConfirm),
    pinCheckbox: intl.formatMessage(messages.pinCheckbox),
    qrCodeCheckbox: intl.formatMessage(messages.qrCodeCheckbox),
    consequencesCheckbox: intl.formatMessage(messages.consequencesCheckbox),
    continueButton: intl.formatMessage(confirmationMessages.commonButtons.continueButton),
  }
}
