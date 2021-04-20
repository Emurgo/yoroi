// @flow

/**
 * Step 6 for the Catalyst registration
 * Option to download the QR code
 */

import React, {useState} from 'react'
import {
  View,
  SafeAreaView,
  Clipboard,
  TouchableOpacity,
  Image,
} from 'react-native'
import {injectIntl, defineMessages} from 'react-intl'
import {connect} from 'react-redux'

import {Text, Button, ProgressStep} from '../UiKit'
import {withTitle} from '../../utils/renderUtils'
import {WALLET_ROOT_ROUTES} from '../../RoutesList'
import globalMessages, {confirmationMessages} from '../../i18n/global-messages'
import QRCode from 'react-native-qrcode-svg'
import copyImage from '../../assets/img/copyd.png'

import styles from './styles/Step6.style'

import type {ComponentType} from 'react'
import type {IntlShape} from 'react-intl'

import type {Navigation} from '../../types/navigation'

const messages = defineMessages({
  subTitle: {
    id: 'components.catalyst.step6.subTitle',
    defaultMessage: '!!!Backup Catalyst Code',
  },
  description: {
    id: 'components.catalyst.step6.description',
    defaultMessage:
      '!!!Backup this QR code or catalyst secret code. This will be required to use the catalyst App.',
  },
  note: {
    id: 'components.catalyst.step6.note',
    defaultMessage:
      '!!!Keep it — you won’t be able to access this code after tapping on Complete.',
  },
  secretCode: {
    id: 'components.catalyst.step6.secretCode',
    defaultMessage: '!!!Secret Code',
  },
})

const Step1 = ({intl, navigation, encryptedKey}) => {
  const [buttonDisabled, setButtonDisabled] = useState(true)

  setTimeout(() => {
    setButtonDisabled(false)
  }, 5000)

  const _copyKey = () => {
    Clipboard.setString(encryptedKey)
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ProgressStep currentStep={6} totalSteps={6} />
      <View style={styles.container}>
        <View>
          <Text style={styles.subTitle}>
            {intl.formatMessage(messages.subTitle)}
          </Text>
          <Text style={[styles.description, styles.mb40]}>
            {intl.formatMessage(messages.description)}
          </Text>
          <Text style={[styles.note, styles.mb40]}>
            {intl.formatMessage(messages.note)}
          </Text>
          <View style={[styles.qrCode, styles.mb40]}>
            <QRCode
              value={encryptedKey}
              size={140}
              backgroundColor="white"
              color="black"
            />
          </View>
          <View>
            <Text style={[styles.description, styles.mb16]}>
              {intl.formatMessage(messages.secretCode)}
            </Text>
            <View style={styles.secretCode}>
              <View style={styles.key}>
                <Text>{encryptedKey}</Text>
              </View>
              <View style={styles.copyButton}>
                <TouchableOpacity onPress={_copyKey}>
                  <Image source={copyImage} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        <Button
          onPress={() =>
            navigation.navigate(WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES)
          }
          title={intl.formatMessage(
            confirmationMessages.commonButtons.completeButton,
          )}
          disabled={buttonDisabled}
        />
      </View>
    </SafeAreaView>
  )
}

type ExternalProps = {|
  navigation: Navigation,
  route: Object, // TODO(navigation): type
  intl: IntlShape,
|}

export default injectIntl(
  connect(
    (state) => ({
      encryptedKey: state.voting.encryptedKey,
    }),
    {},
  )(
    withTitle((Step1: ComponentType<ExternalProps>), ({intl}) =>
      intl.formatMessage(globalMessages.votingTitle),
    ),
  ),
)
