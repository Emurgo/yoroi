/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, Linking, ScrollView, StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import appstoreBadge from '../assets/img/app-store-badge.png'
import playstoreBadge from '../assets/img/google-play-badge.png'
import AppDownload from '../assets/img/pic-catalyst-step1.png'
import {Button, ProgressStep, Spacer, StandardModal, Text} from '../components'
import {useStakingInfo} from '../Dashboard/StakePoolInfos'
import {useSelectedWallet} from '../features/WalletManager/Context'
import globalMessages, {confirmationMessages} from '../i18n/global-messages'
import {Logger} from '../legacy/logging'
import {Actions, Row} from './components'

type Props = {
  onNext: () => void
}
export const DownloadCatalyst = ({onNext}: Props) => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const {stakingInfo} = useStakingInfo(wallet, {suspense: true})
  const [showModal, setShowModal] = useState<boolean>(stakingInfo?.status === 'not-registered')

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ProgressStep currentStep={1} totalSteps={6} />

      <ScrollView bounces={false} contentContainerStyle={styles.contentContainer}>
        <Spacer height={48} />

        <Text style={styles.text}>{strings.subTitle}</Text>

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
          <Text>{strings.tip}</Text>
        </Tip>
      </ScrollView>

      <Actions>
        <Button onPress={() => onNext()} title={strings.continueButton} />
      </Actions>

      <StandardModal
        visible={showModal}
        title={strings.attention}
        onRequestClose={() => setShowModal(false)}
        primaryButton={{
          label: strings.iUnderstandButton,
          onPress: () => setShowModal(false),
        }}
        showCloseIcon
      >
        <Text>{strings.stakingKeyNotRegistered}</Text>
      </StandardModal>
    </SafeAreaView>
  )
}

const Tip = (props: ViewProps) => <View {...props} style={styles.tip} />

const PlayStoreButton = () => {
  const openPlayStore = async () => {
    try {
      await Linking.openURL('https://play.google.com/store/apps/details?id=io.iohk.vitvoting')
    } catch (e) {
      Logger.error(e as any)
    }
  }

  return (
    <TouchableOpacity onPress={() => openPlayStore()}>
      <Image source={playstoreBadge} />
    </TouchableOpacity>
  )
}

const AppStoreButton = () => {
  const openAppStore = async () => {
    try {
      await Linking.openURL('https://apps.apple.com/kg/app/catalyst-voting/id1517473397')
    } catch (e) {
      Logger.error(e as any)
    }
  }

  return (
    <TouchableOpacity onPress={() => openAppStore()}>
      <Image source={appstoreBadge} />
    </TouchableOpacity>
  )
}

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

const useStrings = () => {
  const intl = useIntl()

  return {
    subTitle: intl.formatMessage(messages.subTitle),
    stakingKeyNotRegistered: intl.formatMessage(messages.stakingKeyNotRegistered),
    tip: intl.formatMessage(messages.tip),
    continueButton: intl.formatMessage(confirmationMessages.commonButtons.continueButton),
    iUnderstandButton: intl.formatMessage(confirmationMessages.commonButtons.iUnderstandButton),
    attention: intl.formatMessage(globalMessages.attention),
  }
}
