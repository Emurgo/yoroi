import Clipboard from '@react-native-community/clipboard'
import {useFocusEffect, useNavigation} from '@react-navigation/native'
import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {
  ActivityIndicator,
  Image,
  NativeModules,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import QRCodeSVG from 'react-native-qrcode-svg'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useSelector} from 'react-redux'

import copyImage from '../../legacy/assets/img/copyd.png'
import {confirmationMessages} from '../../legacy/i18n/global-messages'
import {WALLET_ROOT_ROUTES} from '../../legacy/RoutesList'
import {encryptedKeySelector} from '../../legacy/selectors'
import {COLORS} from '../../legacy/styles/config'
import {Button, ProgressStep, Spacer, Text} from '../components'
import {CatalystBackupCheckModal} from './CatalystBackupCheckModal'
import {Actions, Description, Title} from './components'

const {FlagSecure} = NativeModules

export const Step6 = () => {
  const strings = useStrings()
  const encryptedKey = useSelector(encryptedKeySelector)
  const navigation = useNavigation()
  const [countDown, setCountDown] = useState<number>(5)

  useEffect(() => {
    countDown > 0 && setTimeout(() => setCountDown(countDown - 1), 1000)
  }, [countDown])

  const [showBackupWarningModal, setShowBackupWarningModal] = useState<boolean>(false)

  useFocusEffect(
    // eslint-disable-next-line consistent-return
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        FlagSecure.deactivate()

        return () => {
          FlagSecure.activate()
        }
      }
    }, []),
  )

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ProgressStep currentStep={6} totalSteps={6} />

      <ScrollView bounces={false} contentContainerStyle={styles.contentContainer}>
        <Spacer height={48} />

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

        {encryptedKey ? <QRCode text={encryptedKey} /> : <ActivityIndicator size={'large'} color={'black'} />}

        <Spacer height={32} />

        <Text>{strings.secretCode}</Text>

        <SecretCodeBox>
          <Text style={{flex: 1}}>{encryptedKey}</Text>
          <Spacer width={16} />
          <CopyButton text={encryptedKey || ''} />
        </SecretCodeBox>
      </ScrollView>

      <Actions>
        <Button
          onPress={() => setShowBackupWarningModal(true)}
          title={countDown !== 0 ? countDown.toString() : strings.completeButton}
          disabled={countDown !== 0}
        />
      </Actions>

      <CatalystBackupCheckModal
        visible={showBackupWarningModal}
        onRequestClose={() => setShowBackupWarningModal(false)}
        onConfirm={() => navigation.navigate(WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES)}
      />
    </SafeAreaView>
  )
}

const AlertBox = (props) => <View {...props} style={styles.alertBox} />
const QRCode = ({text}: {text: string}) => (
  <View style={styles.qrCodeBackground}>
    <QRCodeSVG value={text} size={140} backgroundColor="white" color="black" />
  </View>
)
const SecretCodeBox = (props) => <View {...props} style={styles.secretCodeBox} />
const CopyButton = ({text}: {text: string}) => (
  <TouchableOpacity style={{justifyContent: 'center', alignItems: 'center'}} onPress={() => Clipboard.setString(text)}>
    <Image source={copyImage} />
  </TouchableOpacity>
)

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

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: 'white',
  },
  alertBox: {
    padding: 16,
    backgroundColor: COLORS.BACKGROUND_LIGHT_RED,
    borderRadius: 8,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  note: {
    color: '#242838',
    fontWeight: 'bold',
  },
  qrCodeBackground: {
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#F0F3F5',
    alignSelf: 'center',
  },
  secretCodeBox: {
    backgroundColor: '#F0F3F5',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
  },
})

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
