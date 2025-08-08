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
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import appstoreBadge from '~/assets/img/app-store-badge.png'
import playstoreBadge from '~/assets/img/google-play-badge.png'
import {useCatalystCurrentFund} from '~/features/Discover/common/hooks'
import {useStakingInfo} from '~/features/Portfolio/common/hooks/useStakingInfo'
import {useNavigateTo} from '~/features/RegisterCatalyst/common/navigation'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {CatalystStep1} from '~/ui/CatalystStep1Illustration/CatalystStep1Illustration'
import {Actions, Row, Stepper} from '~/ui/common/components'
import {useModal} from '~/ui/Modal/ModalContext'
import {Space} from '~/ui/Space/Space'

export const DownloadCatalystAppScreen = () => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {stakingInfo} = useStakingInfo(wallet, {suspense: true})
  const {openModal, closeModal} = useModal()
  const {palette: p} = useTheme()
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
        title: strings.registerCatalyst.title,
        content: <WarningModal />,
        footer: (
          <Button
            title={strings.registerCatalyst.confirm}
            onPress={closeModal}
          />
        ),
        height: 300,
      })
  }, [
    closeModal,
    openModal,
    stakingInfo?.status,
    strings.registerCatalyst.title,
    strings.registerCatalyst.confirm,
  ])

  const fundName = fund.info.fundName
  const registrationStart = `${formatDate(fund.info.snapshotStart)}: ${strings.registerCatalyst.snapshotStart}`
  const votingStart = `${formatDate(fund.info.votingStart)}: ${strings.registerCatalyst.votingStart}`
  const votingEnd = `${formatDate(fund.info.votingEnd)}: ${strings.registerCatalyst.votingEnd}`
  const votingResults = `${formatDate(fund.info.tallyingEnd)}: ${strings.registerCatalyst.votingResults}`

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[{backgroundColor: p.bg_color_max}, a.px_lg, a.pb_lg]}
    >
      <Stepper
        title={strings.registerCatalyst.title}
        currentStep={1}
        totalSteps={3}
      />

      <ScrollView bounces={false} contentContainerStyle={[a.align_center]}>
        <CatalystStep1 />

        <Space.Height.lg />

        <Text style={[a.body_1_lg_regular]}>
          {strings.registerCatalyst.step2Description}
        </Text>

        <Space.Height.lg />

        <Row>
          <PlayStoreButton />
          <Space.Width.md />
          <AppStoreButton />
        </Row>

        <Space.Height.xl />

        <FundInfo>
          <FundName>{fundName}</FundName>
          <FundText>{registrationStart}</FundText>
          <FundText>{votingStart}</FundText>
          <FundText>{votingEnd}</FundText>
          <FundText>{votingResults}</FundText>
        </FundInfo>

        <Space.Height.xl />

        <Actions>
          <Button title={strings.registerCatalyst.confirm} onPress={onNext} />
        </Actions>
      </ScrollView>
    </SafeAreaView>
  )
}

const FundInfo = ({children}: {children: React.ReactNode}) => {
  return <View style={[a.self_start]}>{children}</View>
}

const FundName = ({children}: {children: React.ReactNode}) => {
  const {palette: p} = useTheme()
  return <Text style={[{color: p.text_gray_medium}]}>{children}</Text>
}

const FundText = ({children}: {children: React.ReactNode}) => {
  const {palette: p} = useTheme()
  return <Text style={[{color: p.text_gray_medium}]}>{children}</Text>
}

const WarningModal = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  return (
    <View style={[a.px_lg, a.flex_1]}>
      <Text style={[a.body_1_lg_regular, {color: p.text_gray_medium}]}>
        {strings.registerCatalyst.tip}
      </Text>
    </View>
  )
}

const PlayStoreButton = () => {
  const openPlayStore = async () => {
    const url =
      Platform.OS === 'android'
        ? 'market://details?id=io.emurgo.catalyst'
        : 'https://play.google.com/store/apps/details?id=io.emurgo.catalyst'
    await Linking.openURL(url)
  }

  return (
    <TouchableOpacity onPress={openPlayStore}>
      <Image source={playstoreBadge} />
    </TouchableOpacity>
  )
}

const AppStoreButton = () => {
  const openAppStore = async () => {
    const url =
      Platform.OS === 'ios'
        ? 'https://apps.apple.com/app/catalyst-voting/id1506091890'
        : 'https://apps.apple.com/app/catalyst-voting/id1506091890'
    await Linking.openURL(url)
  }

  return (
    <TouchableOpacity onPress={openAppStore}>
      <Image source={appstoreBadge} />
    </TouchableOpacity>
  )
}

const createPin = () => cryptoRandomString({length: 4, type: 'numeric'})
