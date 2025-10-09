import {isNonNullable, isString} from '@yoroi/common'
import {
  GOVERNANCE_YOROI_DREP_ID_HEX,
  GovernanceProvider,
  useDelegationCertificate,
  useGovernance,
  useLatestGovernanceAction,
  useStakingKeyState,
  useVotingCertificate,
} from '@yoroi/staking'
import {ThemedPalette, atoms as a, useTheme} from '@yoroi/theme'

import {NotEnoughMoneyToSendError} from '@emurgo/yoroi-lib/dist/errors'
import {useFocusEffect} from '@react-navigation/native'
import React, {type ReactNode} from 'react'
import {Text, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {useRemoteConfig} from '~/features/RemoteConfig/hooks/useRemoteConfig'
import {LearnMoreLink} from '~/features/Staking/Governance/common/LearnMoreLink/LearnMoreLink'
import {YoroiRecordLink} from '~/features/Staking/Governance/common/YoroiRecordLink/YoroiRecordLink'
import {formatDrepHashToCIP129Format} from '~/features/Staking/Governance/common/drep'
import {useCreateGovernanceTx} from '~/features/Staking/hooks/useCreateGovernanceTx'
import {useStakingInfo} from '~/features/Staking/hooks/useStakingInfo'
import {useStakingKey} from '~/features/Staking/hooks/useStakingKey'
import {useTransactionInfos} from '~/features/Transactions/hooks/useTransactionInfos'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useWalletEvent} from '~/features/WalletManager/hooks/useWalletEvent'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Space} from '~/ui/Space/Space'
import {TransactionInfo} from '~/wallets/types/other'

import {Action} from '../../common/Action/Action'
import {
  mapStakingKeyStateToGovernanceAction,
  useGovernanceActions,
} from '../../common/helpers'
import {useNavigateTo} from '../../common/navigation'
import {GovernanceVote} from '../../types'
import {EnterDrepIdModal} from '../EnterDrepIdModal/EnterDrepIdModal'

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

  const navigateToChangeVote = () => {
    navigateTo.changeVote()
  }

  return (
    <View style={[a.px_lg, a.flex_1, ta.bg_color_max]}>
      <View>
        <Text style={[a.body_1_lg_regular, ta.text_gray_medium]}>
          {introduction}
        </Text>
      </View>

      <Space.Height.lg />

      <View style={[a.flex_1, a.gap_lg]}>
        {isDelegatingToYoroiDrep && (
          <Action
            title={strings.staking.delegatingToYoroiDRep}
            description={strings.staking.delegateToAYoroiDRepDescription}
            pending={isTxPending}
            showRightArrow={!isTxPending}
            onPress={navigateToChangeVote}
          >
            <YoroiRecordLink />
          </Action>
        )}

        {isDelegatingToDrep && (
          <Action
            title={strings.staking.delegatingToADRep}
            description={strings.staking.actionDelegateToADRepDescription}
            pending={isTxPending}
            showRightArrow={!isTxPending}
            onPress={navigateToChangeVote}
          >
            <Text
              style={[a.body_1_lg_medium, a.font_semibold, ta.text_gray_medium]}
            >
              {strings.staking.drepID}
            </Text>

            <Text style={[a.body_3_sm_regular, {color: p.text_gray_low}]}>
              {displayedHash}
            </Text>
          </Action>
        )}

        {action.kind === 'abstain' && (
          <Action
            title={strings.staking.abstaining}
            description={strings.staking.actionAbstainDescription}
            pending={isTxPending}
            showRightArrow={!isTxPending}
            onPress={navigateToChangeVote}
          />
        )}

        {action.kind === 'no-confidence' && (
          <Action
            title={strings.staking.actionNoConfidenceTitle}
            description={strings.staking.actionNoConfidenceDescription}
            pending={isTxPending}
            showRightArrow={!isTxPending}
            onPress={navigateToChangeVote}
          />
        )}
      </View>

      <Space.Height.sm fill />

      <LearnMoreLink />

      <Space.Height.lg />
    </View>
  )
}

const formattingOptions = (p: ThemedPalette) => {
  return {
    b: (text: ReactNode) => {
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
    textComponent: (text: ReactNode) => (
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
  const {openModal} = useModal()
  const stakingInfo = useStakingInfo(wallet)
  const {track} = useMetrics()
  const [pendingVote, setPendingVote] = React.useState<
    | 'abstain'
    | 'no-confidence'
    | 'delegate-to-yoroi'
    | 'delegate-not-yoroi'
    | null
  >(null)
  const governanceActions = useGovernanceActions()

  useFocusEffect(
    React.useCallback(() => {
      track.governanceDashboardPageViewed()
    }, [track]),
  )

  const hasStakingKeyRegistered = stakingInfo?.data?.status !== 'not-registered'
  useWalletEvent(wallet, 'utxos', stakingInfo.refetch)
  const needsToRegisterStakingKey = !hasStakingKeyRegistered

  const createDelegationCertificate = useDelegationCertificate()
  const createVotingCertificate = useVotingCertificate()

  const createGovernanceTxMutation = useCreateGovernanceTx(wallet, {
    shouldThrow: false,
    onError: (error) => {
      if (error instanceof NotEnoughMoneyToSendError) {
        navigateTo.noFunds()
      } else {
        // Re-throw other errors to trigger error boundary
        throw error
      }
    },
  })

  const openDRepIdModal = (
    onSubmit: (options: {
      hash: string
      type: 'key' | 'script'
      CIP105: boolean
    }) => void,
  ) => {
    track.governanceChooseDrepPageViewed()

    openModal({
      title: strings.staking.enterDRepID,
      content: (
        <GovernanceProvider manager={manager}>
          <EnterDrepIdModal onSubmit={onSubmit} />
        </GovernanceProvider>
      ),
      height: 360,
    })
  }

  const handleDelegate = () => {
    openDRepIdModal(async (options) => {
      const stakingKey = wallet.getStakingKey()

      setPendingVote('delegate-not-yoroi')

      const certificate = createDelegationCertificate({
        hash: options.hash,
        type: options.type,
        stakingKey,
      })
      const stakeCert = needsToRegisterStakingKey
        ? manager.createStakeRegistrationCertificate(stakingKey)
        : null
      const certs =
        stakeCert !== null ? [stakeCert, certificate] : [certificate]

      createGovernanceTxMutation.resolve({
        certificates: certs,
        addressMode: meta.addressMode,
      })

      if (createGovernanceTxMutation.value) {
        governanceActions.handleDelegateAction({
          unsignedTx: createGovernanceTxMutation.value,
          hash: options.hash,
          type: options.type,
          CIP105: options.CIP105,
        })
      }
    })
  }

  const handleDelegateToYoroi = () => {
    const stakingKey = wallet.getStakingKey()

    setPendingVote('delegate-to-yoroi')

    const certificate = createDelegationCertificate({
      hash: GOVERNANCE_YOROI_DREP_ID_HEX,
      type: 'key',
      stakingKey,
    })
    const stakeCert = needsToRegisterStakingKey
      ? manager.createStakeRegistrationCertificate(stakingKey)
      : null
    const certs = stakeCert !== null ? [stakeCert, certificate] : [certificate]

    createGovernanceTxMutation.resolve({
      certificates: certs,
      addressMode: meta.addressMode,
    })

    if (createGovernanceTxMutation.value) {
      governanceActions.handleDelegateAction({
        unsignedTx: createGovernanceTxMutation.value,
        hash: GOVERNANCE_YOROI_DREP_ID_HEX,
        type: 'key',
        CIP105: false,
      })
    }
  }

  const handleAbstain = () => {
    const stakingKey = wallet.getStakingKey()
    setPendingVote('abstain')

    const certificate = createVotingCertificate({
      vote: 'abstain',
      stakingKey,
    })
    const stakeCert = needsToRegisterStakingKey
      ? manager.createStakeRegistrationCertificate(stakingKey)
      : null
    const certs = stakeCert !== null ? [stakeCert, certificate] : [certificate]

    createGovernanceTxMutation.resolve({
      certificates: certs,
      addressMode: meta.addressMode,
    })

    if (createGovernanceTxMutation.value) {
      governanceActions.handleAbstainAction({
        unsignedTx: createGovernanceTxMutation.value,
      })
    }
  }

  const handleNoConfidence = () => {
    const stakingKey = wallet.getStakingKey()
    setPendingVote('no-confidence')

    const certificate = createVotingCertificate({
      vote: 'no-confidence',
      stakingKey,
    })
    const stakeCert = needsToRegisterStakingKey
      ? manager.createStakeRegistrationCertificate(stakingKey)
      : null
    const certs = stakeCert !== null ? [stakeCert, certificate] : [certificate]

    createGovernanceTxMutation.resolve({
      certificates: certs,
      addressMode: meta.addressMode,
    })

    if (createGovernanceTxMutation.value) {
      governanceActions.handleNoConfidenceAction({
        unsignedTx: createGovernanceTxMutation.value,
      })
    }
  }

  const isCreatingTx = createGovernanceTxMutation.isPending

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
          <Action
            title={strings.staking.delegateToAYoroiDrep}
            description={strings.staking.delegateToAYoroiDRepDescription}
            onPress={handleDelegateToYoroi}
            pending={isCreatingTx && pendingVote === 'delegate-to-yoroi'}
            showGradient
          >
            <YoroiRecordLink />
          </Action>
        )}

        <Action
          title={strings.staking.actionDelegateToADRepTitle}
          description={strings.staking.actionDelegateToADRepDescription}
          onPress={handleDelegate}
          pending={isCreatingTx && pendingVote === 'delegate-not-yoroi'}
        />

        <Action
          title={strings.staking.actionAbstainTitle}
          description={strings.staking.actionAbstainDescription}
          onPress={handleAbstain}
          pending={isCreatingTx && pendingVote === 'abstain'}
        />

        <Action
          title={strings.staking.actionNoConfidenceTitle}
          description={strings.staking.actionNoConfidenceDescription}
          onPress={handleNoConfidence}
          pending={isCreatingTx && pendingVote === 'no-confidence'}
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
