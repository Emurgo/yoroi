import {useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, View, ViewProps} from 'react-native'
import QRCodeSVG from 'react-native-qrcode-svg'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, CopyButton, ProgressStep, Spacer, Text} from '../../components'
import {useAllowScreenshot} from '../../hooks/useAllowScreenShot'
import {confirmationMessages} from '../../kernel/i18n/global-messages'
import {useBlockGoBack} from '../../kernel/navigation'
import {Actions, Description, Title} from './components'
import {useCountdown} from './hooks'
import {VotingRegistrationBackupCheckModal} from './VotingRegistrationBackupCheckModal'

export const QrCode = ({onNext, votingKeyEncrypted}: {onNext: () => void; votingKeyEncrypted: string}) => {
  useBlockGoBack()
  useAllowScreenshot()
  const strings = useStrings()
  const styles = useStyles()

  const [showBackupWarningModal, setShowBackupWarningModal] = useState(false)
  const countdown = useCountdown()

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ProgressStep currentStep={6} totalSteps={6} />

      <ScrollView bounces={false} style={{paddingTop: 16}} contentContainerStyle={styles.contentContainer}>
        <Title>{strings.subTitle}</Title>

        <Spacer height={16} />

        <AlertBox>
          <Text>{strings.description}</Text>
        </AlertBox>

        <Spacer height={16} />

        <Description>{strings.description2}</Description>

        <Spacer height={16} />

        <Description>{strings.description3}</Description>

        <Spacer height={16} />

        <Text style={styles.note}>{strings.note}</Text>

        <Spacer height={32} />

        <QRCode text={votingKeyEncrypted} />

        <Spacer height={32} />

        <Text>{strings.secretCode}</Text>

        <SecretCodeBox>
          <Text style={{flex: 1}}>{votingKeyEncrypted}</Text>

          <Spacer width={16} />

          <CopyButton value={votingKeyEncrypted} />
        </SecretCodeBox>
      </ScrollView>

      <Actions>
        <Button
          onPress={() => setShowBackupWarningModal(true)}
          title={countdown !== 0 ? countdown.toString() : strings.completeButton}
          disabled={countdown !== 0}
        />
      </Actions>

      <VotingRegistrationBackupCheckModal
        visible={showBackupWarningModal}
        onRequestClose={() => setShowBackupWarningModal(false)}
        onConfirm={() => onNext()}
      />
    </SafeAreaView>
  )
}

const AlertBox = (props: ViewProps) => {
  const styles = useStyles()
  return <View {...props} style={styles.alertBox} />
}
const QRCode = ({text}: {text: string}) => {
  const styles = useStyles()
  return (
    <View style={styles.qrCodeBackground}>
      <QRCodeSVG value={text} size={140} backgroundColor="white" color="black" />
    </View>
  )
}
const SecretCodeBox = (props: ViewProps) => {
  const styles = useStyles()
  return <View {...props} style={styles.secretCodeBox} />
}

const messages = defineMessages({
  subTitle: {
    id: 'components.catalyst.step6.subTitle',
    defaultMessage: '!!!Backup Catalyst Code',
  },
  description: {
    id: 'components.catalyst.step6.description',
    defaultMessage: '!!!Please take a screenshot of this QR code.',
  },
  description2: {
    id: 'components.catalyst.step6.description2',
    defaultMessage:
      '!!!We strongly recommend you to save your Catalyst secret code in ' +
      'plain text too, so that you can re-create your QR code if necessary.',
  },
  description3: {
    id: 'components.catalyst.step6.description3',
    defaultMessage:
      '!!!Then, send the QR code to an external device, as you will need to' +
      'scan it with your phone using the Catalyst mobile app.',
  },
  note: {
    id: 'components.catalyst.step6.note',
    defaultMessage: '!!!Keep it — you won’t be able to access this code after tapping on Complete.',
  },
  secretCode: {
    id: 'components.catalyst.step6.secretCode',
    defaultMessage: '!!!Secret Code',
  },
})

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: color.gray_cmin,
    },
    alertBox: {
      ...atoms.p_lg,
      backgroundColor: 'rgba(255, 16, 81, 0.06)',
      borderRadius: 8,
    },
    contentContainer: {
      ...atoms.px_lg,
    },
    note: {
      color: color.gray_c900,
      fontWeight: 'bold',
    },
    qrCodeBackground: {
      borderRadius: 8,
      ...atoms.p_lg,
      backgroundColor: color.gray_c50,
      alignSelf: 'center',
    },
    secretCodeBox: {
      backgroundColor: color.gray_c50,
      borderRadius: 8,
      ...atoms.p_lg,
      flexDirection: 'row',
    },
  })

  return styles
}

const useStrings = () => {
  const intl = useIntl()

  return {
    subTitle: intl.formatMessage(messages.subTitle),
    description: intl.formatMessage(messages.description),
    description2: intl.formatMessage(messages.description2),
    description3: intl.formatMessage(messages.description3),
    note: intl.formatMessage(messages.note),
    secretCode: intl.formatMessage(messages.secretCode),
    completeButton: intl.formatMessage(confirmationMessages.commonButtons.completeButton),
  }
}
