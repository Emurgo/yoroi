import {useCatalyst} from '@yoroi/staking'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import appstoreBadge from '../../../../assets/img/app-store-badge.png'
import playstoreBadge from '../../../../assets/img/google-play-badge.png'
import {Button, useModal} from '../../../../components'
import {Space} from '../../../../components/Space/Space'
import {useStakingInfo} from '../../../../legacy/Dashboard/StakePoolInfos'
import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {Actions, Row, Stepper} from '../../common/components'
import {useCatalystCurrentFund} from '../../common/hooks'
import {useStrings} from '../../common/strings'
import {CatalystStep1} from '../../illustrations/CatalystStep1'

type Props = {
  onNext: () => void
}
export const DownloadCatalyst = ({onNext}: Props) => {
  const strings = useStrings()
  const {wallet} = useSelectedWallet()
  const {stakingInfo} = useStakingInfo(wallet, {suspense: true})
  const {openModal} = useModal()
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

  React.useEffect(() => {
    if (stakingInfo?.status !== 'not-registered') {
      openModal(strings.attention, <WarningModal />, 270)
    }
  }, [openModal, stakingInfo?.status, strings.attention])

  const fundName = fund.info.fundName
  const registrationStart = `${formatDate(fund.info.snapshotStart)}: ${strings.registrationStart}`
  const votingStart = `${formatDate(fund.info.votingStart)}: ${strings.votingStart}`
  const votingEnd = `${formatDate(fund.info.votingEnd)}: ${strings.votingEnd}`
  const votingResults = `${formatDate(fund.info.tallyingEnd)}: ${strings.votingResults}`

  const disabled = wallet.isMainnet && fund.status.registration !== 'running'

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <Stepper title={strings.title} currentStep={1} totalSteps={4} />

      <ScrollView bounces={false} contentContainerStyle={styles.contentContainer}>
        <CatalystStep1 />

        <Space height="lg" />

        <Text style={styles.subTitle}>{strings.subTitle}</Text>

        <Text style={styles.tip}>{strings.tip}</Text>

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
        <Button shelleyTheme onPress={onNext} title={strings.continueButton} disabled={disabled} />
      </Actions>
    </SafeAreaView>
  )
}

const FundInfo = ({children}: {children: React.ReactNode}) => {
  const styles = useStyles()
  return <View style={styles.fundInfo}>{children}</View>
}
const FundName = ({children}: {children: React.ReactNode}) => {
  const styles = useStyles()
  return <Text style={styles.fundName}>{children}</Text>
}
const FundText = ({children}: {children: React.ReactNode}) => {
  const styles = useStyles()
  return <Text style={styles.fundText}>{children}</Text>
}

const WarningModal = () => {
  const strings = useStrings()
  const styles = useStyles()
  const {closeModal} = useModal()

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{strings.stakingKeyNotRegistered}</Text>

      <Space height="md" />

      <Space fill />

      <Button shelleyTheme title={strings.iUnderstandButton} onPress={closeModal} textStyles={styles.button} />
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

const useStyles = () => {
  const {color, atoms} = useTheme()
  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: color.gray_cmin,
    },
    container: {
      flex: 1,
    },
    contentContainer: {
      ...atoms.p_lg,
      alignItems: 'center',
    },
    tip: {
      color: color.gray_c600,
      ...atoms.body_1_lg_regular,
      textAlign: 'center',
    },
    fundInfo: {
      alignSelf: 'flex-start',
    },
    fundName: {
      color: color.gray_c900,
      ...atoms.body_1_lg_medium,
    },
    fundText: {
      color: color.gray_c600,
      ...atoms.body_1_lg_regular,
    },
    text: {
      color: color.gray_c600,
      ...atoms.body_1_lg_regular,
    },
    button: {
      ...atoms.button_1_lg,
    },
    subTitle: {
      textAlign: 'center',
      ...atoms.heading_3_medium,
      color: color.gray_c900,
    },
  })

  return styles
}
