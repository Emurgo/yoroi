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

import {useCatalystCurrentFund} from '~/features/Discover/common/hooks'
import {useStakingInfo} from '~/features/Portfolio/common/hooks/useStakingInfo'
import {useNavigateTo} from '~/features/RegisterCatalyst/common/navigation'
import {useStrings} from '~/features/RegisterCatalyst/common/useStrings'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {Button} from '~/ui/Button/Button'
import {CatalystStep1} from '~/ui/CatalystStep1Illustration/CatalystStep1Illustration'
import {Actions, Row, Stepper} from '~/ui/common/components'
import {useModal} from '~/ui/Modal/ModalContext'
import {Space} from '~/ui/Space/Space'
import appstoreBadge from '~/assets/img/app-store-badge.png'
import playstoreBadge from '~/assets/img/google-play-badge.png'

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
      style={[{backgroundColor: p.bg_color_max}, a.px_lg, a.pb_lg]}
    >
      <Stepper title={strings.title} currentStep={1} totalSteps={3} />

      <ScrollView bounces={false} contentContainerStyle={[a.align_center]}>
        <CatalystStep1 />

        <Space.Height.lg />

        <Text style={[a.body_1_lg_regular]}>
          {strings.downloadCatalystAppDescription}
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
          <Button title={strings.next} onPress={onNext} />
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
        {strings.catalystWarning}
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
