import {useCatalyst} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'
import {useSelectedWallet} from '@yoroi/wallet-manager'

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
import {
  Actions,
  Row,
  Stepper,
} from '~/features/RegisterCatalyst/common/components'
import {useCatalystCurrentFund} from '~/features/RegisterCatalyst/common/hooks'
import {useStakingInfo} from '~/features/Staking/hooks/useStakingInfo'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {CatalystStep1} from '~/ui/CatalystStep1Illustration/CatalystStep1Illustration'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'

import {useNavigateTo} from '../../common/navigation'

export const DownloadCatalystAppScreen = () => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {stakingInfo} = useStakingInfo(wallet)
  const {openModal, closeModal} = useModal()
  const {palette: p, atoms: ta} = useTheme()
  const {fund} = useCatalystCurrentFund()
  const intl = useIntl()
  const navigateTo = useNavigateTo()
  const {pinChanged, reset: resetCatalyst} = useCatalyst()
  const hasShownModal = React.useRef(false)

  const onNext = () => {
    resetCatalyst()
    const pin = randomPin()
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
    if (stakingInfo?.status === 'not-registered' && !hasShownModal.current) {
      hasShownModal.current = true
      openModal({
        title: strings.registerCatalyst.title,
        content: (
          <Modal.Content>
            <WarningModal />
          </Modal.Content>
        ),
        footer: (
          <Modal.Footer>
            <Button
              title={strings.registerCatalyst.confirm}
              onPress={closeModal}
            />
          </Modal.Footer>
        ),
        height: 300,
      })
    }
  }, [
    closeModal,
    openModal,
    stakingInfo?.status,
    strings.registerCatalyst.confirm,
    strings.registerCatalyst.title,
  ])

  const fundName = fund?.info.fundName
  const registrationStart = fund?.info.snapshotStart
    ? `${formatDate(fund?.info.snapshotStart)}: ${strings.registerCatalyst.snapshotStart}`
    : ''
  const votingStart = fund?.info.votingStart
    ? `${formatDate(fund.info.votingStart)}: ${strings.registerCatalyst.votingStart}`
    : ''
  const votingEnd = fund?.info.votingEnd
    ? `${formatDate(fund.info.votingEnd)}: ${strings.registerCatalyst.votingEnd}`
    : ''
  const votingResults = fund?.info.tallyingEnd
    ? `${formatDate(fund.info.tallyingEnd)}: ${strings.registerCatalyst.votingResults}`
    : ''

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[{flex: 1}, {backgroundColor: p.bg_color_max}, a.px_lg, a.pb_lg]}
    >
      <Stepper
        title={strings.registerCatalyst.title}
        currentStep={1}
        totalSteps={3}
      />

      <ScrollView bounces={false} contentContainerStyle={[a.align_center]}>
        <CatalystStep1 />

        <Space.Height.lg />

        <Text style={[a.body_1_lg_medium, ta.text_gray_medium]}>
          {strings.registerCatalyst.subTitle}
        </Text>

        <Space.Height.lg />

        <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>
          {strings.registerCatalyst.tip}
        </Text>

        <Space.Height.xl />

        <Row>
          <PlayStoreButton />
          <Space.Width._2xl />
          <AppStoreButton />
        </Row>

        <Space.Height.xl />

        <FundInfo>
          <FundName>{fundName}</FundName>
          <Space.Height.sm />
          <FundText>{registrationStart}</FundText>

          <FundText>{votingStart}</FundText>

          <FundText>{votingEnd}</FundText>

          <FundText>{votingResults}</FundText>
        </FundInfo>

        <Space.Height.lg />
      </ScrollView>

      <Actions>
        <Button title={strings.registerCatalyst.continue} onPress={onNext} />
      </Actions>
    </SafeAreaView>
  )
}

const FundInfo = ({children}: {children: React.ReactNode}) => {
  return <View style={[a.self_start]}>{children}</View>
}

const FundName = ({children}: {children: React.ReactNode}) => {
  const {atoms: ta} = useTheme()
  return (
    <Text style={[a.body_2_md_medium, ta.text_gray_medium]}>{children}</Text>
  )
}

const FundText = ({children}: {children: React.ReactNode}) => {
  const {atoms: ta} = useTheme()
  return (
    <Text style={[a.body_2_md_regular, ta.text_gray_medium]}>{children}</Text>
  )
}

const WarningModal = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  return (
    <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
      {strings.registerCatalyst.tip}
    </Text>
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
        : 'https://play.google.com/store/apps/details?id=io.iohk.vitvoting&pcampaignid=web_share'
    await Linking.openURL(url)
  }

  return (
    <TouchableOpacity onPress={openAppStore}>
      <Image source={appstoreBadge} />
    </TouchableOpacity>
  )
}

const randomPin = () => {
  return Math.floor(Math.random() * 10_000)
    .toString()
    .padStart(4, '0')
}
