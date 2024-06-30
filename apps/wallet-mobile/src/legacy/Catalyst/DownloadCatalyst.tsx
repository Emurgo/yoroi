/* eslint-disable @typescript-eslint/no-explicit-any */
import {useCatalyst} from '@yoroi/staking'
import {useTheme} from '@yoroi/theme'
import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, Linking, ScrollView, StyleSheet, TouchableOpacity, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import appstoreBadge from '../../assets/img/app-store-badge.png'
import playstoreBadge from '../../assets/img/google-play-badge.png'
import AppDownload from '../../assets/img/pic-catalyst-step1.png'
import {Button, ProgressStep, Spacer, StandardModal, Text} from '../../components'
import {Space} from '../../components/Space/Space'
import {useSelectedWallet} from '../../features/WalletManager/common/hooks/useSelectedWallet'
import globalMessages, {confirmationMessages} from '../../kernel/i18n/global-messages'
import {useStakingInfo} from '../Dashboard/StakePoolInfos'
import {Actions, Row} from './components'
import {useCatalystCurrentFund} from './useCatalystCurrentFund'

type Props = {
  onNext: () => void
}
export const DownloadCatalyst = ({onNext}: Props) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {stakingInfo} = useStakingInfo(wallet, {suspense: true})
  const [showModal, setShowModal] = useState<boolean>(stakingInfo?.status === 'not-registered')
  const styles = useStyles()
  const {fund} = useCatalystCurrentFund()
  const intl = useIntl()

  const formatDate = React.useCallback(
    (date: Date) =>
      intl.formatDate(date, {
        dateStyle: 'short',
        timeStyle: 'medium',
        hour12: false,
      }),
    [intl],
  )

  const fundName = fund.info.fundName
  const registrationStart = `${formatDate(fund.info.snapshotStart)}: ${strings.registrationStart}`
  const votingStart = `${formatDate(fund.info.votingStart)}: ${strings.votingStart}`
  const votingEnd = `${formatDate(fund.info.votingEnd)}: ${strings.votingEnd}`
  const votingResults = `${formatDate(fund.info.tallyingEnd)}: ${strings.votingResults}`

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <ProgressStep currentStep={1} totalSteps={6} />

      <ScrollView bounces={false} contentContainerStyle={styles.contentContainer}>
        <Spacer height={48} />

        <Text>{strings.subTitle}</Text>

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

          <Space height="lg" />

          <Text style={styles.fundName}>{fundName} </Text>

          <Text>{registrationStart}</Text>

          <Text>{votingStart}</Text>

          <Text>{votingEnd}</Text>

          <Text>{votingResults}</Text>
        </Tip>
      </ScrollView>

      <Actions>
        <Button onPress={onNext} title={strings.continueButton} disabled={fund.status.registration !== 'running'} />
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

const Tip = (props: ViewProps) => {
  const styles = useStyles()
  return <View {...props} style={styles.tip} />
}

const PlayStoreButton = () => {
  const {config} = useCatalyst()
  const openPlayStore = async () => {
    await Linking.openURL(config.apps.android)
  }

  return (
    <TouchableOpacity onPress={() => openPlayStore()}>
      <Image source={playstoreBadge} />
    </TouchableOpacity>
  )
}

const AppStoreButton = () => {
  const {config} = useCatalyst()
  const openAppStore = async () => {
    await Linking.openURL(config.apps.ios)
  }

  return (
    <TouchableOpacity onPress={() => openAppStore()}>
      <Image source={appstoreBadge} />
    </TouchableOpacity>
  )
}

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
  registrationStart: {
    id: 'catalyst.registration.start',
    defaultMessage: '!!!Registration start',
  },
  votingStart: {
    id: 'catalyst.voting.start',
    defaultMessage: '!!!Voting start',
  },
  votingEnd: {
    id: 'catalyst.voting.end',
    defaultMessage: '!!!Voting end',
  },
  votingResults: {
    id: 'catalyst.voting.results',
    defaultMessage: '!!!Results',
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
    registrationStart: intl.formatMessage(messages.registrationStart),
    votingStart: intl.formatMessage(messages.votingStart),
    votingEnd: intl.formatMessage(messages.votingEnd),
    votingResults: intl.formatMessage(messages.votingResults),
  }
}

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: color.gray_cmin,
    },
    contentContainer: {
      ...atoms.px_lg,
      alignItems: 'center',
    },
    tip: {
      ...atoms.px_xl,
    },
    fundName: {
      ...atoms.body_1_lg_medium,
    },
  })

  return styles
}
