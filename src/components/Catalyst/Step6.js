// @flow

/**
 * Step 6 for the Catalyst registration
 * Option to download the QR code
 */

import React, {useEffect, useState} from 'react'
import {
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  NativeModules,
  Platform,
} from 'react-native'
import Clipboard from '@react-native-community/clipboard'
import QRCode from 'react-native-qrcode-svg'
import {injectIntl, defineMessages} from 'react-intl'
import {connect} from 'react-redux'
import {useFocusEffect} from '@react-navigation/native'

import CatalystBackupCheckModal from './CatalystBackupCheckModal'
import {Text, Button, ProgressStep} from '../UiKit'
import {withTitle} from '../../utils/renderUtils'
import {WALLET_ROOT_ROUTES} from '../../RoutesList'
import globalMessages, {confirmationMessages} from '../../i18n/global-messages'
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
    defaultMessage:
      '!!!Keep it — you won’t be able to access this code after tapping on Complete.',
  },
  secretCode: {
    id: 'components.catalyst.step6.secretCode',
    defaultMessage: '!!!Secret Code',
  },
})

const {FlagSecure} = NativeModules

type Props = {|
  navigation: Navigation,
  route: Object, // TODO(navigation): type
  encryptedKey?: string,
|}

type HOCProps = {
  intl: IntlShape,
  encryptedKey: string,
}

const Step6 = ({intl, navigation, encryptedKey}: HOCProps & Props) => {
  const [countDown, setCountDown] = useState<number>(5)

  useEffect(
    () => {
      countDown > 0 && setTimeout(() => setCountDown(countDown - 1), 1000)
    },
    [countDown],
  )

  const [showBackupWarningModal, setShowBackupWarningModal] = useState<boolean>(
    false,
  )

  if (Platform.OS === 'android') {
    useFocusEffect(
      React.useCallback(() => {
        // enable screenshots
        FlagSecure.deactivate()

        return () => {
          // disable screenshots
          // recall: this clean up function returned by useFocusEffect is run
          // automatically by react on blur
          FlagSecure.activate()
        }
      }, []),
    )
  }

  const _copyKey = () => {
    Clipboard.setString(encryptedKey)
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ProgressStep currentStep={6} totalSteps={6} />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
          <Text style={styles.subTitle}>
            {intl.formatMessage(messages.subTitle)}
          </Text>
          <View style={[styles.alertBlock, styles.mb16]}>
            <Text style={styles.description}>
              {intl.formatMessage(messages.description)}
            </Text>
          </View>
          <Text style={[styles.description, styles.mb16]}>
            {intl.formatMessage(messages.description2)}
          </Text>
          <Text style={[styles.description, styles.mb16]}>
            {intl.formatMessage(messages.description3)}
          </Text>
          <Text style={[styles.note, styles.mb40]}>
            {intl.formatMessage(messages.note)}
          </Text>
          {/* for some reason style arrays have issues in current flow version.
             so a regular object spread has been used here */}
          <View style={{...styles.qrCode, ...styles.mb40}}>
            <View style={styles.qrCodeBackground}>
              <QRCode
                value={encryptedKey}
                size={140}
                backgroundColor="white"
                color="black"
              />
            </View>
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
        </ScrollView>
        <Button
          onPress={() => setShowBackupWarningModal(true)}
          title={
            // prettier-ignore
            countDown !== 0
              ? countDown.toString()
              : intl.formatMessage(
                confirmationMessages.commonButtons.completeButton,
              )
          }
          disabled={countDown !== 0}
        />
        <CatalystBackupCheckModal
          visible={showBackupWarningModal}
          onRequestClose={() => setShowBackupWarningModal(false)}
          onConfirm={() =>
            navigation.navigate(WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES)
          }
        />
      </View>
    </SafeAreaView>
  )
}

export default (injectIntl(
  connect(
    (state) => ({
      encryptedKey: state.voting.encryptedKey,
    }),
    {},
    (state, dispatchProps, ownProps) => ({
      ...state,
      ...dispatchProps,
      ...ownProps,
    }),
  )(
    withTitle(Step6, ({intl}: {intl: IntlShape}) =>
      intl.formatMessage(globalMessages.votingTitle),
    ),
  ),
): ComponentType<Props>)
