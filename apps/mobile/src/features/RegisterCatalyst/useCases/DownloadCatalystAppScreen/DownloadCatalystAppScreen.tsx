import {useCatalyst} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'
import cryptoRandomString from 'crypto-random-string'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import appstoreBadge from '../../../../assets/img/app-store-badge.png'
import playstoreBadge from '../../../../assets/img/google-play-badge.png'
import {useStakingInfo} from '../../../../legacy/Dashboard/StakePoolInfos'
import {Button} from '../../../../ui/Button/Button'
import {useModal} from '../../../../ui/Modal/ModalContext'
import {Space} from '../../../../ui/Space/Space'
import {CatalystStep1} from '../../../ui/CatalystStep1Illustration/CatalystStep1Illustration'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {useNavigateTo} from '../../CatalystNavigator'
import {Actions, Row, Stepper} from '../../common/components'
import {useCatalystCurrentFund} from '../../common/hooks'
import {useStrings} from '../../common/strings'

export const DownloadCatalystAppScreen = () => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {stakingInfo} = useStakingInfo(wallet, {suspense: true})
  const {openModal, closeModal} = useModal()
  const {color} = useTheme()
  const {fund} = useCatalystCurrentFund()
  const intl = useIntl()
  const navigateTo = useNavigateTo()
  const {pinChanged, reset: resetCatalyst} = useCatalyst()

  const onNext = () => {
    resetCatalyst()
    const pin = createPin()
    pinChanged(pin)
    navigateTo.displayPin()
  }

  const formatDate = React.useCallback(
    (date: Date) =>
      intl.formatDate(date, {
        dateStyle: 'short',
        timeStyle: 'medium',
        hour12: false,
      }),
    [intl],
  )

  React.useEffect(() => {
    if (stakingInfo?.status === 'not-registered')
      openModal({
        title: strings.attention,
        content: <WarningModal />,
        footer: (
          <Button title={strings.iUnderstandButton} onPress={closeModal} />
        ),
        height: 300,
      })
  }, [
    closeModal,
    openModal,
    stakingInfo?.status,
    strings.attention,
    strings.iUnderstandButton,
  ])

  const fundName = fund.info.fundName
  const registrationStart = `${formatDate(fund.info.snapshotStart)}: ${strings.snapshotStart}`
  const votingStart = `${formatDate(fund.info.votingStart)}: ${strings.votingStart}`
  const votingEnd = `${formatDate(fund.info.votingEnd)}: ${strings.votingEnd}`
  const votingResults = `${formatDate(fund.info.tallyingEnd)}: ${strings.votingResults}`

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[
        styles.safeAreaView,
        {backgroundColor: color.bg_color_max},
        a.px_lg,
        a.pb_lg,
      ]}
    >
      <Stepper title={strings.title} currentStep={1} totalSteps={3} />

      <ScrollView
        bounces={false}
        contentContainerStyle={[styles.contentContainer, a.align_center]}
      >
        <CatalystStep1 />

        <Space height="lg" />

        <Text style={[styles.subTitle, {color: color.text_gray_medium}]}>
          {strings.subTitle}
        </Text>

        <Text style={[styles.tip, {color: color.text_gray_medium}]}>
          {strings.tip}
        </Text>

        <Space height="lg" />

        <Row>
          <AppStoreButton />

          <Space width="lg" />

          <PlayStoreButton />
        </Row>

        <Space height="lg" />

        <FundInfo>
          <FundName>{fundName}</FundName>

          <FundText>{registrationStart}</FundText>

          <FundText>{votingStart}</FundText>

          <FundText>{votingEnd}</FundText>

          <FundText>{votingResults}</FundText>
        </FundInfo>
      </ScrollView>

      <Actions>
        <Button onPress={onNext} title={strings.continueButton} />
      </Actions>
    </SafeAreaView>
  )
}

const FundInfo = ({children}: {children: React.ReactNode}) => {
  const {color} = useTheme()
  return <View style={[styles.fundInfo, a.self_start]}>{children}</View>
}
const FundName = ({children}: {children: React.ReactNode}) => {
  const {color} = useTheme()
  return (
    <Text style={[styles.fundName, {color: color.text_gray_medium}]}>
      {children}
    </Text>
  )
}
const FundText = ({children}: {children: React.ReactNode}) => {
  const {color} = useTheme()
  return (
    <Text style={[styles.fundText, {color: color.text_gray_medium}]}>
      {children}
    </Text>
  )
}

const WarningModal = () => {
  const strings = useStrings()
  const {color} = useTheme()

  return (
    <View style={[styles.modal, a.px_lg, a.flex_1]}>
      <Text style={[styles.text, {color: color.text_gray_medium}]}>
        {strings.stakingKeyNotRegistered}
      </Text>

      <Space height="md" />

      <Space fill />

      {Platform.OS === 'android' && <Space height="lg" />}
    </View>
  )
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

const createPin = () => cryptoRandomString({length: 4, type: 'numeric'})

const styles = StyleSheet.create({
  safeAreaView: {},
  modal: {},
  contentContainer: {},
  tip: {},
  fundInfo: {},
  fundName: {},
  fundText: {},
  text: {
    ...a.body_1_lg_regular,
  },
  subTitle: {
    ...a.heading_3_medium,
    ...a.text_center,
  },
})
