import {
  GOVERNANCE_YOROI_DREP_ID_HEX,
  useDelegationCertificate,
  useGovernance,
} from '@yoroi/staking'
import {atoms as a, useTheme} from '@yoroi/theme'

import {useNavigation} from '@react-navigation/native'
import {StackNavigationProp} from '@react-navigation/stack'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  View,
  ViewProps,
} from 'react-native'

import {useBalances} from '~/features/Portfolio/common/hooks/useBalances'
import {useReviewTx} from '~/features/ReviewTx/common/ReviewTxProvider'
import {StakeRewardsWithdrawalOperation} from '~/features/ReviewTx/common/operations'
import {useGovernanceParticipation} from '~/features/Staking/Governance/common/helpers'
import {WithdrawGovernanceWarningModal} from '~/features/Staking/Governance/useCases/WithdrawGovernanceWarningModal/WithdrawGovernanceWarningModal'
import {PoolTransitionNotice} from '~/features/Staking/Staking/PoolTransition/PoolTransitionNotice'
import {usePoolTransition} from '~/features/Staking/Staking/PoolTransition/usePoolTransition'
import {useCreateWithdrawTx} from '~/features/Staking/hooks/useCreateWithdrawTx'
import {useIsOnline} from '~/features/WalletManager/hooks/useIsOnline'
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useSync} from '~/features/WalletManager/hooks/useSync'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {DashboardRoutes} from '~/kernel/navigation/types'
import {Banner} from '~/ui/Banner/Banner'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {isEmptyString} from '~/wallets/utils/string'
import {Amounts} from '~/wallets/utils/utils'

import {useStakingInfo} from '../../../Staking/hooks/useStakingInfo'
import {EpochProgress} from '../shared/EpochProgress'
import {NotDelegatedInfo} from '../shared/NotDelegatedInfo'
import {StakePoolInfos} from '../shared/StakePoolInfos'
import {UserSummary} from '../shared/UserSummary'

export const DashboardScreen = () => {
  const {atoms: ta} = useTheme()
  const screenHeight = Dimensions.get('window').height

  const strings = useStrings()
  const navigateTo = useNavigateTo()
  const {isPoolRetiring} = usePoolTransition()
  const {unsignedTxChanged} = useReviewTx()
  const {
    isPending: isWithdrawLoading,
    hasRewards,
    resolve: createWithdrawalTx,
  } = useCreateWithdrawTx({
    onError: () => navigateTo.failedTx(),
    onSuccess: (unsignedTx) => {
      unsignedTxChanged(unsignedTx)
      walletNavigateTo.navigateToTxReview({
        operations: [<StakeRewardsWithdrawalOperation key="0" />],
        context: 'withdraw rewards',
      })
    },
  })
  const {wallet, meta} = useSelectedWallet()
  const {isPending: isSyncing, sync} = useSync(wallet)
  const isOnline = useIsOnline(wallet)
  const {openModal, closeModal} = useModal()

  const balances = useBalances(wallet)
  const primaryAmount = Amounts.getAmount(
    balances,
    wallet.portfolioPrimaryTokenInfo.id,
  )
  const {
    stakingInfo,
    refetch: refetchStakingInfo,
    error,
    isLoading: isStakingInfoLoading,
  } = useStakingInfo(wallet)

  const walletNavigateTo = useWalletNavigation()
  const {isParticipating, isLoading: isGovernanceParticipationLoading} =
    useGovernanceParticipation()

  const {manager} = useGovernance()
  const createDelegationCertificate = useDelegationCertificate()

  const hasStakingKeyRegistered = stakingInfo?.status !== 'not-registered'
  const needsToRegisterStakingKey = !hasStakingKeyRegistered

  const createOnWithdraw =
    ({shouldDeregister}: {shouldDeregister: boolean}) =>
    () => {
      if (isGovernanceParticipationLoading) {
        return
      }
      if (!isParticipating) {
        const handleDelegateAndWithdraw = async () => {
          const stakingKey = wallet.getStakingKey()
          closeModal()

          const delegationCert = createDelegationCertificate({
            hash: GOVERNANCE_YOROI_DREP_ID_HEX,
            type: 'key',
            stakingKey,
          })

          // Combine certificates with stake registration if needed
          const stakeCert = needsToRegisterStakingKey
            ? manager.createStakeRegistrationCertificate(stakingKey)
            : null
          const certs =
            stakeCert !== null ? [stakeCert, delegationCert] : [delegationCert]

          let unsignedTx
          // Try to create combined tx with governance delegation + withdrawal
          try {
            unsignedTx = await wallet.createWithdrawalTx({
              shouldDeregister,
              addressMode: meta.addressMode,
              // @ts-ignore - governanceCertificates is a valid option but not in types yet
              governanceCertificates: certs,
            })
          } catch {
            // If withdrawal fails (e.g., no rewards), create governance-only tx
            unsignedTx = await wallet.createUnsignedGovernanceTx({
              addressMode: meta.addressMode,
              votingCertificates: certs,
            })
          }

          // Navigate to tx review
          unsignedTxChanged(unsignedTx)
          walletNavigateTo.navigateToTxReview({
            operations: [<StakeRewardsWithdrawalOperation key="0" />],
            // @ts-ignore - context shold  be updated
            context: 'withdraw rewards and delegate governance',
          })
        }
        openModal({
          title: strings.staking.withdrawWarningTitle,
          content: React.createElement(WithdrawGovernanceWarningModal.Content),
          footer: React.createElement(WithdrawGovernanceWarningModal.Footer, {
            onDelegateAndWithdraw: handleDelegateAndWithdraw,
          }),
          height: screenHeight * 0.7,
        })
        return
      }

      createWithdrawalTx({shouldDeregister})
    }

  return (
    <SafeArea
      edges={['bottom', 'left', 'right']}
      style={[a.flex_1, ta.bg_color_max]}
    >
      <View style={[a.flex_1]}>
        {isOnline && error && (
          <SyncErrorBanner showRefresh={!(isStakingInfoLoading || isSyncing)} />
        )}

        <ScrollView
          style={[a.flex_1]}
          contentContainerStyle={[a.px_lg, a.py_lg]}
          refreshControl={
            <RefreshControl
              onRefresh={() => {
                sync()
                refetchStakingInfo()
              }}
              refreshing={false}
            />
          }
        >
          {stakingInfo?.status !== 'staked' && (
            <>
              <NotDelegatedInfo />

              <Space.Height.xl />
            </>
          )}

          {isPoolRetiring && (
            <Row>
              <PoolTransitionNotice />

              <Space.Height.xl />
            </Row>
          )}

          <Row>
            <EpochInfo />

            <Space.Height.xl />
          </Row>

          <Row>
            {!stakingInfo ? (
              <ActivityIndicator size="large" color="black" />
            ) : stakingInfo.status === 'staked' ? (
              <UserSummary
                totalAdaSum={
                  !isEmptyString(primaryAmount.quantity)
                    ? new BigNumber(primaryAmount.quantity)
                    : null
                }
                totalRewards={new BigNumber(stakingInfo.rewards)}
                totalDelegated={new BigNumber(stakingInfo.amount)}
                ctaProps={{
                  onPress: createOnWithdraw({shouldDeregister: false}),
                  disabled: meta.isReadOnly || isWithdrawLoading || !hasRewards,
                }}
              />
            ) : (
              <UserSummary
                totalAdaSum={
                  !isEmptyString(primaryAmount.quantity)
                    ? new BigNumber(primaryAmount.quantity)
                    : null
                }
                totalRewards={null}
                totalDelegated={null}
              />
            )}

            <Space.Height.xl />
          </Row>

          {stakingInfo?.status === 'staked' && (
            <Row>
              <StakePoolInfos
                ctaProps={{
                  onPress: createOnWithdraw({shouldDeregister: true}),
                  disabled: meta.isReadOnly || isWithdrawLoading,
                }}
              />

              <Space.Height.xl />
            </Row>
          )}
        </ScrollView>

        <Actions>
          <Button
            onPress={navigateTo.stakingCenter}
            title={strings.dashboard.stakingCenterButton}
            disabled={meta.isReadOnly}
            testID="stakingCenterButton"
          />
        </Actions>
      </View>
    </SafeArea>
  )
}

export const useNavigateTo = () => {
  const navigation = useNavigation<StackNavigationProp<DashboardRoutes>>()
  const strings = useStrings()

  return {
    stakingCenter: () =>
      navigation.navigate('staking-center', {screen: 'staking-center-main'}),
    submittedTx: () =>
      navigation.navigate('staking-submitted-tx', {
        title: strings.staking.submittedTxTitle,
        message: strings.staking.submittedTxText,
        buttonTitle: strings.staking.submittedTxButton,
      }),
    failedTx: () =>
      navigation.navigate('staking-failed-tx', {
        title: strings.staking.failedTxTitle,
        message: strings.staking.failedTxText,
        buttonTitle: strings.staking.failedTxButton,
      }),
  }
}

const SyncErrorBanner = ({showRefresh}: {showRefresh: boolean}) => {
  const strings = useStrings()

  return (
    <Banner
      error
      text={
        showRefresh
          ? strings.transactions.syncErrorBannerTextWithRefresh
          : strings.transactions.syncErrorBannerTextWithoutRefresh
      }
    />
  )
}

const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = React.useState(() => Date.now())
  React.useEffect(() => {
    const id = setInterval(() => setCurrentTime(Date.now()), 1000)

    return () => clearInterval(id)
  }, [])

  return currentTime
}

const EpochInfo = () => {
  const currentTime = useCurrentTime()
  const {networkManager} = useSelectedNetwork()
  const {epoch} = networkManager.epoch.info(new Date(currentTime))
  const {
    timeRemaining: {days, hours, minutes, seconds},
    progress,
  } = networkManager.epoch.progress(new Date(currentTime))

  const leftPadDate = (num: number) => {
    if (num < 10) return `0${num}`
    return num.toString()
  }

  return (
    <EpochProgress
      percentage={Math.floor(progress)}
      currentEpoch={epoch}
      endTime={{
        d: leftPadDate(days),
        h: leftPadDate(hours),
        m: leftPadDate(minutes),
        s: leftPadDate(seconds),
      }}
    />
  )
}

const Actions = (props: ViewProps) => {
  const {palette: p} = useTheme()
  return (
    <View
      {...props}
      style={[
        a.flex_row,
        a.p_lg,
        {borderTopWidth: 1, borderTopColor: p.gray_200},
      ]}
    />
  )
}

const Row = (props: ViewProps) => {
  return <View {...props} style={[a.flex_1]} />
}
