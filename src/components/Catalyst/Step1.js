// @flow

/**
 * Step 1 for the Catalyst registration - landing
 */

import React, {useEffect, useState} from 'react'
import {
  View,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native'
import {injectIntl, defineMessages} from 'react-intl'
import {connect} from 'react-redux'

import {generateVotingKeys} from '../../actions/voting'
import {fetchUTXOs} from '../../actions/utxo'
import {Text, Button, ProgressStep} from '../UiKit'
import StandardModal from '../Common/StandardModal'
import {withTitle} from '../../utils/renderUtils'
import {CATALYST_ROUTES} from '../../RoutesList'
import globalMessages, {confirmationMessages} from '../../i18n/global-messages'
import AppDownload from '../../assets/img/pic-catalyst-step1.png'
import playstoreBadge from '../../assets/img/google-play-badge.png'
import appstoreBadge from '../../assets/img/app-store-badge.png'
import {isDelegatingSelector} from '../../selectors'

import styles from './styles/Step1.style'

import type {ComponentType} from 'react'
import type {IntlShape} from 'react-intl'

import type {Navigation} from '../../types/navigation'

const messages = defineMessages({
  subTitle: {
    id: 'components.catalyst.step1.subTitle',
    defaultMessage:
      '!!!Before you begin, make sure to download the Catalyst Voting App.',
  },
  stakingKeyNotRegistered: {
    id: 'components.catalyst.step1.stakingKeyNotRegistered',
    defaultMessage:
      '!!!Catalyst voting rewards are sent to delegation accounts and your ' +
      'wallet does not seem to have a registered delegation certificate. If ' +
      'you want to receive voting rewards, you need to delegate your funds first.',
  },
  tip: {
    id: 'components.catalyst.step1.tip',
    defaultMessage:
      '!!!Tip: Make sure you know how to take a screenshot with your device, ' +
      'so that you can backup your catalyst QR code.',
  },
})

const WarningModalBody = ({intl}: {intl: IntlShape}) => (
  <View>
    <Text>{intl.formatMessage(messages.stakingKeyNotRegistered)}</Text>
  </View>
)

const Step1 = ({
  intl,
  generateVotingKeys,
  navigation,
  fetchUTXOs,
  isDelegating,
}) => {
  const [showModal, setShowModal] = useState<boolean>(!isDelegating)

  useEffect(() => {
    fetchUTXOs()
    generateVotingKeys()
  }, [])

  const openAndroidStore = () => {
    Linking.openURL(
      'https://play.google.com/store/apps/details?id=io.iohk.vitvoting',
    )
  }
  const openAppStore = () => {
    Linking.openURL(
      'https://apps.apple.com/kg/app/catalyst-voting/id1517473397',
    )
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ProgressStep currentStep={1} totalSteps={6} />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContentContainer}>
          <View style={[styles.description, styles.mb40]}>
            <Text style={styles.text}>
              {intl.formatMessage(messages.subTitle)}
            </Text>
          </View>
          <View style={styles.images}>
            <View style={styles.mb40}>
              <Image source={AppDownload} />
            </View>
            <View style={[styles.buttons, styles.mb40]}>
              <TouchableOpacity onPress={() => openAppStore()}>
                <Image style={styles.iOS} source={appstoreBadge} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openAndroidStore()}>
                <Image source={playstoreBadge} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.description}>
            <Text style={styles.tip}>{intl.formatMessage(messages.tip)}</Text>
          </View>
        </ScrollView>
        <Button
          onPress={() => navigation.navigate(CATALYST_ROUTES.STEP2)}
          title={intl.formatMessage(
            confirmationMessages.commonButtons.continueButton,
          )}
        />
      </View>
      <StandardModal
        visible={showModal}
        title={intl.formatMessage(globalMessages.attention)}
        children={<WarningModalBody intl={intl} />}
        onRequestClose={() => setShowModal(false)}
        primaryButton={{
          label: intl.formatMessage(
            confirmationMessages.commonButtons.iUnderstandButton,
          ),
          onPress: () => setShowModal(false),
        }}
        showCloseIcon
      />
    </SafeAreaView>
  )
}

type Props = {|
  navigation: Navigation,
  route: Object, // TODO(navigation): type
  intl: IntlShape,
  generateVotingKeys: () => void,
  fetchUTXOs: () => Promise<void>,
  isDelegating: boolean,
|}

export default injectIntl(
  connect(
    (state) => ({
      isDelegating: isDelegatingSelector(state),
    }),
    {
      generateVotingKeys,
      fetchUTXOs,
    },
  )(
    withTitle((Step1: ComponentType<Props>), ({intl}: {intl: IntlShape}) =>
      intl.formatMessage(globalMessages.votingTitle),
    ),
  ),
)
