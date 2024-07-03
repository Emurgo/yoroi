import {useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet, View} from 'react-native'

import {Button, Checkbox} from '../../components'
import {Space} from '../../components/Space/Space'
import globalMessages, {confirmationMessages} from '../../kernel/i18n/global-messages'

type Props = {
  onConfirm: () => void
}

export const VotingRegistrationBackupCheckModal = ({onConfirm}: Props) => {
  const strings = useStrings()
  const styles = useStyles()
  const [acceptedPin, setAcceptedPin] = useState(false)
  const [acceptedQrCode, setAcceptedQrCode] = useState(false)
  const [acceptedConsequences, setAcceptedConsequences] = useState(false)

  return (
    <View style={styles.container}>
      <PinCheckbox onChange={setAcceptedPin} checked={acceptedPin} text={strings.pinCheckbox} />

      <Space height="md" />

      <QRCodeCheckbox onChange={setAcceptedQrCode} checked={acceptedQrCode} text={strings.qrCodeCheckbox} />

      <Space height="md" />

      <ConsequencesCheckbox
        onChange={setAcceptedConsequences}
        checked={acceptedConsequences}
        text={strings.consequencesCheckbox}
      />

      <Space height="md" />

      <Space fill />

      <Button
        disabled={!acceptedPin || !acceptedQrCode || !acceptedConsequences}
        onPress={() => onConfirm()}
        title={strings.continueButton}
      />
    </View>
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

const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...atoms.px_lg,
      flex: 1,
    },
  })

  return styles
}

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
