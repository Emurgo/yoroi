// @flow

/**
 * Step 1 for the Catalyst registration - landing
 */

import React, {useEffect} from 'react'
import {View, SafeAreaView, Image} from 'react-native'
import {injectIntl, defineMessages} from 'react-intl'
import {connect} from 'react-redux'

import {generateVotingKeys} from '../../actions/voting'
import {fetchUTXOs} from '../../actions/utxo'
import {Text, Button, ProgressStep} from '../UiKit'
import {withTitle} from '../../utils/renderUtils'
import {CATALYST_ROUTES} from '../../RoutesList'
import globalMessages, {confirmationMessages} from '../../i18n/global-messages'
import AppDownload from '../../assets/img/pic-catalyst-step1.png'
import playstoreBadge from '../../assets/img/google-play-badge.png'
import appstoreBadge from '../../assets/img/app-store-badge.png'

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
})

const Step1 = ({intl, generateVotingKeys, navigation, fetchUTXOs}) => {
  useEffect(() => {
    fetchUTXOs()
    generateVotingKeys()
  }, [])

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ProgressStep currentStep={1} totalSteps={6} />
      <View style={styles.container}>
        <View style={styles.description}>
          <Text style={styles.text}>
            {intl.formatMessage(messages.subTitle)}
          </Text>
        </View>
        <View style={styles.images}>
          <View style={styles.mb40}>
            <Image source={AppDownload} />
          </View>
          <View style={styles.buttons}>
            <Image style={styles.iOS} source={appstoreBadge} />
            <Image source={playstoreBadge} />
          </View>
        </View>
        <Button
          onPress={() => navigation.navigate(CATALYST_ROUTES.STEP2)}
          title={intl.formatMessage(
            confirmationMessages.commonButtons.continueButton,
          )}
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
    (_state) => ({}),
    {
      generateVotingKeys,
      fetchUTXOs,
    },
  )(
    withTitle((Step1: ComponentType<ExternalProps>), ({intl}) =>
      intl.formatMessage(globalMessages.votingTitle),
    ),
  ),
)
