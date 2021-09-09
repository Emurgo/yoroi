// @flow

/**
 * Step 1 for the Catalyst registration - landing
 */

import React, {useEffect, useState} from 'react'
import {View, ScrollView, Image, TouchableOpacity, Linking, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {injectIntl, defineMessages} from 'react-intl'
import {useSelector, useDispatch} from 'react-redux'

import {generateVotingKeys} from '../../actions/voting'
import {fetchUTXOs} from '../../actions/utxo'
import {Text, Button, ProgressStep, Spacer} from '../UiKit'
import StandardModal from '../Common/StandardModal'
import {CATALYST_ROUTES} from '../../RoutesList'
import globalMessages, {confirmationMessages} from '../../i18n/global-messages'
import AppDownload from '../../assets/img/pic-catalyst-step1.png'
import playstoreBadge from '../../assets/img/google-play-badge.png'
import appstoreBadge from '../../assets/img/app-store-badge.png'
import {isDelegatingSelector} from '../../selectors'
import {Actions, Row} from './components'

import type {IntlShape} from 'react-intl'

import {useNavigation} from '@react-navigation/native'

const messages = defineMessages({
  subTitle: {
    id: 'components.catalyst.step1.subTitle',
    defaultMessage: '!!!Before you begin, make sure to download the Catalyst Voting App.',
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

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: '#38393D',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tip: {
    paddingHorizontal: 24,
  },
})

type Props = {
  intl: IntlShape,
}

const Step1 = ({intl}: Props) => {
  const navigation = useNavigation()
  const isDelegating = useSelector(isDelegatingSelector)
  const [showModal, setShowModal] = useState<boolean>(!isDelegating)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchUTXOs())
    dispatch(generateVotingKeys())
  }, [dispatch])

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ProgressStep currentStep={1} totalSteps={6} />

      <ScrollView bounces={false} contentContainerStyle={styles.contentContainer}>
        <Spacer height={48} />

        <Text style={styles.text}>{intl.formatMessage(messages.subTitle)}</Text>

        <Spacer height={48} />

        <Image source={AppDownload} />

        <Spacer height={48} />

        <Row>
          <AppStoreButton />
          <Spacer width={16} />
          <PlayStoreButton />
        </Row>

        <Spacer height={48} />

        <Tip>
          <Text>{intl.formatMessage(messages.tip)}</Text>
        </Tip>
      </ScrollView>

      <Actions>
        <Button
          onPress={() => navigation.navigate(CATALYST_ROUTES.STEP2)}
          title={intl.formatMessage(confirmationMessages.commonButtons.continueButton)}
        />
      </Actions>

      <StandardModal
        visible={showModal}
        title={intl.formatMessage(globalMessages.attention)}
        onRequestClose={() => setShowModal(false)}
        primaryButton={{
          label: intl.formatMessage(confirmationMessages.commonButtons.iUnderstandButton),
          onPress: () => setShowModal(false),
        }}
        showCloseIcon
      >
        <Text>{intl.formatMessage(messages.stakingKeyNotRegistered)}</Text>
      </StandardModal>
    </SafeAreaView>
  )
}

export default injectIntl(Step1)

const Tip = (props) => <View {...props} style={styles.tip} />

const PlayStoreButton = () => {
  const openPlayStore = () => Linking.openURL('https://play.google.com/store/apps/details?id=io.iohk.vitvoting')

  return (
    <TouchableOpacity onPress={() => openPlayStore()}>
      <Image source={playstoreBadge} />
    </TouchableOpacity>
  )
}

const AppStoreButton = () => {
  const openAppStore = () => Linking.openURL('https://apps.apple.com/kg/app/catalyst-voting/id1517473397')

  return (
    <TouchableOpacity onPress={() => openAppStore()}>
      <Image source={appstoreBadge} />
    </TouchableOpacity>
  )
}
