import {isNonNullable, isString} from '@yoroi/common'
import {
  GOVERNANCE_YOROI_DREP_ID_HEX,
  useDelegationCertificate,
  useGovernance,
  useLatestGovernanceAction,
  useStakingKeyState,
} from '@yoroi/staking'
import {ThemedPalette, atoms as a, useTheme} from '@yoroi/theme'

import {NotEnoughMoneyToSendError} from '@emurgo/yoroi-lib/dist/errors'
import * as React from 'react'
import {Text, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {useRemoteConfig} from '~/features/RemoteConfig/hooks/useRemoteConfig'
import {GovernanceStatusCard} from '~/features/Staking/Governance/common/GovernanceStatusCard/GovernanceStatusCard'
import {LearnMoreLink} from '~/features/Staking/Governance/common/LearnMoreLink/LearnMoreLink'
import {OtherDrepCard} from '~/features/Staking/Governance/common/OtherDrepCard/OtherDrepCard'
import {YoroiDrepCard} from '~/features/Staking/Governance/common/YoroiDrepCard/YoroiDrepCard'
import {formatDrepHashToCIP129Format} from '~/features/Staking/Governance/common/drep'
import {useStakingInfo} from '~/features/Staking/hooks/useStakingInfo'
import {useStakingKey} from '~/features/Staking/hooks/useStakingKey'
import {useTransactionInfos} from '~/features/Transactions/hooks/useTransactionInfos'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useWalletEvent} from '~/features/WalletManager/hooks/useWalletEvent'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Space} from '~/ui/Space/Space'
import {TransactionInfo} from '~/wallets/types/other'

import {Action} from '../../common/Action/Action'
import {mapStakingKeyStateToGovernanceAction} from '../../common/helpers'
import {useNavigateTo} from '../../common/navigation'
import {useGovernanceVoteFlow} from '../../common/useGovernanceVoteFlow'
import {GovernanceVote} from '../../types'

export const HomeScreen = () => {
  const {wallet} = useSelectedWallet()
  const txInfos = useTransactionInfos({wallet})
  const [
    isPendingRefetchAfterTxConfirmation,
    setIsPendingRefetchAfterTxConfirmation,
  ] = React.useState(false)

  const stakingKeyHash = useStakingKey(wallet)
  const {data: stakingStatus, refetch: refetchStakingKeyState} =
    useStakingKeyState(stakingKeyHash)

  useWalletEvent(wallet, 'utxos', refetchStakingKeyState)

  const {data: lastSubmittedTx, isLoading} = useLatestGovernanceAction(
    wallet.id,
  )

  const submittedTxId = lastSubmittedTx?.txID

  const isTxPending =
    isString(submittedTxId) && !isTxConfirmed(submittedTxId, txInfos)

  React.useEffect(() => {
    if (!isTxPending && submittedTxId !== undefined) {
      setIsPendingRefetchAfterTxConfirmation(true)
      refetchStakingKeyState().finally(() =>
        setIsPendingRefetchAfterTxConfirmation(false),
      )
    }
  }, [
    isTxPending,
    submittedTxId,
    refetchStakingKeyState,
    setIsPendingRefetchAfterTxConfirmation,
  ])

  const txPendingDisplayed = isTxPending || isPendingRefetchAfterTxConfirmation

  if (isLoading) return null

  if (txPendingDisplayed && isNonNullable(lastSubmittedTx)) {
    if (lastSubmittedTx.kind === 'delegate-to-drep') {
      const action: GovernanceVote = {
        kind: 'delegate',
        hash: lastSubmittedTx.hash,
        type: lastSubmittedTx.type,
      }
      return <ParticipatingInGovernanceVariant action={action} isTxPending />
    }
    if (lastSubmittedTx.kind === 'vote' && lastSubmittedTx.vote === 'abstain') {
      const action: GovernanceVote = {kind: 'abstain'}
      return <ParticipatingInGovernanceVariant action={action} isTxPending />
    }

    if (
      lastSubmittedTx.kind === 'vote' &&
      lastSubmittedTx.vote === 'no-confidence'
    ) {
      const action: GovernanceVote = {kind: 'no-confidence'}
      return <ParticipatingInGovernanceVariant action={action} isTxPending />
    }
  }

  const action = stakingStatus
    ? mapStakingKeyStateToGovernanceAction(stakingStatus)
    : null
  if (action !== null) {
    return <ParticipatingInGovernanceVariant action={action} />
  }
  return <NeverParticipatedInGovernanceVariant />
}

const ParticipatingInGovernanceVariant = ({
  action,
  isTxPending = false,
}: {
  action: GovernanceVote
  isTxPending?: boolean
}) => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const navigateTo = useNavigateTo()

  const displayedHash =
    action.kind === 'delegate'
      ? formatDrepHashToCIP129Format(action.hash, action.type)
      : null
  const isDelegatingToYoroiDrep =
    action.kind === 'delegate' && action.hash === GOVERNANCE_YOROI_DREP_ID_HEX
  const isDelegatingToDrep =
    action.kind === 'delegate' && action.hash !== GOVERNANCE_YOROI_DREP_ID_HEX

  const actionsTitles = (action: GovernanceVote) =>
    isDelegatingToYoroiDrep
      ? strings.staking.delegateToAYoroiDrep
      : isDelegatingToDrep
        ? strings.staking.delegateToADRep
        : action.kind === 'abstain'
          ? strings.staking.actionAbstainTitle
          : strings.staking.actionNoConfidenceTitle
  const selectedActionTitle = actionsTitles(action)

  const introduction = isTxPending
    ? strings.staking.actionYouHaveSelectedTxPending(
        selectedActionTitle,
        formattingOptions(p),
      )
    : strings.staking.actionYouHaveSelected(
        selectedActionTitle,
        formattingOptions(p),
      )

  const navigateToVotingOptions = () => {
    navigateTo.votingOptions()
  }

  const handleDelegateToOtherDrep = () => {
    navigateTo.votingOptions()
  }

  return (
    <ScrollView style={[a.px_lg, a.flex_1, ta.bg_color_max]}>
      <View>
        <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
          {introduction}
        </Text>
      </View>

      <Space.Height.lg />

      <View style={[a.flex_1, a.gap_lg]}>
        {isDelegatingToYoroiDrep && <YoroiDrepCard isDelegating />}

        {isDelegatingToDrep && displayedHash && (
          <OtherDrepCard
            drepId={displayedHash}
            isDelegating
            onDelegate={handleDelegateToOtherDrep}
            pending={isTxPending}
          />
        )}

        {action.kind === 'abstain' && (
          <GovernanceStatusCard
            type="abstain"
            isDelegating
            onChangeToDrep={navigateToVotingOptions}
            pending={isTxPending}
          />
        )}

        {action.kind === 'no-confidence' && (
          <GovernanceStatusCard
            type="no-confidence"
            isDelegating
            onChangeToDrep={navigateToVotingOptions}
            pending={isTxPending}
          />
        )}

        <Action
          title={strings.staking.exploreOtherGovernanceOptions}
          description={strings.staking.exploreOtherGovernanceOptionsDescription}
          onPress={navigateToVotingOptions}
          showRightArrow
        />
      </View>

      <Space.Height.sm fill />

      <LearnMoreLink />

      <Space.Height.lg />
    </ScrollView>
  )
}

const formattingOptions = (p: ThemedPalette) => {
  return {
    b: (text: React.ReactNode) => {
      return (
        <Text
          style={[
            a.body_1_lg_regular,
            a.font_semibold,
            {color: p.text_gray_medium},
          ]}
        >
          {text}
        </Text>
      )
    },
    textComponent: (text: React.ReactNode) => (
      <Text style={[a.body_1_lg_regular, {color: p.text_gray_medium}]}>
        {text}
      </Text>
    ),
  }
}

const NeverParticipatedInGovernanceVariant = () => {
  const {config} = useRemoteConfig()
  const isYoroiDrepBannerEnabled = config?.banners?.yoroiDrep?.display ?? false
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const navigateTo = useNavigateTo()
  const {wallet, meta} = useSelectedWallet()
  const {manager} = useGovernance()
  const stakingInfo = useStakingInfo(wallet)

  const hasStakingKeyRegistered = stakingInfo?.data?.status !== 'not-registered'
  useWalletEvent(wallet, 'utxos', stakingInfo.refetch)
  const needsToRegisterStakingKey = !hasStakingKeyRegistered

  const createDelegationCertificate = useDelegationCertificate()

  const {pendingVote, isCreatingTx, submitDelegate} = useGovernanceVoteFlow({
    wallet,
    addressMode: meta.addressMode,
    options: {
      shouldThrow: false,
      onError: (error) => {
        if (error instanceof NotEnoughMoneyToSendError) {
          navigateTo.noFunds()
          return
        }
        throw error
      },
    },
  })

  const isPending = isCreatingTx || pendingVote !== null

  const handleDelegateToYoroi = async () => {
    if (isPending) return
    const stakingKey = wallet.getStakingKey()

    const options = {
      hash: GOVERNANCE_YOROI_DREP_ID_HEX,
      type: 'key' as const,
      CIP105: false,
    }

    const certificate = await createDelegationCertificate({
      hash: GOVERNANCE_YOROI_DREP_ID_HEX,
      type: 'key',
      stakingKey,
    })
    const stakeCert = needsToRegisterStakingKey
      ? manager.createStakeRegistrationCertificate(stakingKey)
      : null
    const certs = stakeCert !== null ? [stakeCert, certificate] : [certificate]

    submitDelegate(certs, options)
  }

  const handleExploreOtherOptions = () => {
    navigateTo.votingOptions()
  }

  return (
    <ScrollView style={[a.px_lg, a.flex_1, ta.bg_color_max]}>
      <View>
        <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
          {strings.staking.reviewActions}
        </Text>
      </View>

      <Space.Height.lg />

      <View style={[a.flex_1, a.gap_lg]}>
        {isYoroiDrepBannerEnabled && (
          <YoroiDrepCard
            onDelegate={handleDelegateToYoroi}
            pending={isCreatingTx && pendingVote === 'delegate-yoroi'}
          />
        )}

        <Action
          title={strings.staking.exploreOtherGovernanceOptions}
          description={strings.staking.exploreOtherGovernanceOptionsDescription}
          onPress={handleExploreOtherOptions}
          showRightArrow
        />
      </View>

      <Space.Height.sm fill />

      <LearnMoreLink />

      <Space.Height.lg />
    </ScrollView>
  )
}

const isTxConfirmed = (
  txId: string,
  txInfos: Record<string, TransactionInfo>,
) => {
  return Object.values(txInfos).some((tx) => tx.id === txId)
}
