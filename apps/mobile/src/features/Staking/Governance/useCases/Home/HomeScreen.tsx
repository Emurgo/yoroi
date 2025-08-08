import {NotEnoughMoneyToSendError} from '@emurgo/yoroi-lib/dist/errors'
import {useFocusEffect} from '@react-navigation/native'
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
import {atoms as a, useTheme} from '@yoroi/theme'
import React, {type ReactNode} from 'react'
import {Text, View} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {GovernanceVote} from '@yoroi/types'
import {useStrings} from '~/kernel/i18n/useStrings'
import {formatDrepHashToCIP129Format} from '~/features/Staking/Governance/common/drep'
import {LearnMoreLink} from '~/features/Staking/Governance/common/LearnMoreLink/LearnMoreLink'
import {YoroiRecordLink} from '~/features/Staking/Governance/common/YoroiRecordLink/YoroiRecordLink'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Action} from '~/ui/Action/Action'
import {useModal} from '~/ui/Modal/ModalContext'
import {Space} from '~/ui/Space/Space'
import {
  useCreateGovernanceTx,
  useStakingKey,
  useTransactionInfos,
  useWalletEvent,
} from '~/wallets/hooks'
import {TransactionInfo} from '~/wallets/types/other'
import {
  mapStakingKeyStateToGovernanceAction,
  useGovernanceActions,
} from '../../common/helpers'
import {useNavigateTo} from '../../common/navigation'
import {useStakingInfo} from '../Dashboard/StakePoolInfos'
import {EnterDrepIdModal} from '../EnterDrepIdModal/EnterDrepIdModal'

export const HomeScreen = () => {
  const {wallet} = useSelectedWallet()
  const txInfos = useTransactionInfos({wallet})
  const stakingKeyHash = useStakingKey(wallet)
  const [
    isPendingRefetchAfterTxConfirmation,
    setIsPendingRefetchAfterTxConfirmation,
  ] = React.useState(false)

  const {data: stakingStatus, refetch: refetchStakingKeyState} =
    useStakingKeyState(stakingKeyHash, {
      refetchOnMount: true,
      suspense: true,
    })

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
      ? strings.delegateToAYoroiDrep
      : isDelegatingToDrep
        ? strings.delegateToADRep
        : action.kind === 'abstain'
          ? strings.actionAbstainTitle
          : strings.actionNoConfidenceTitle
  const selectedActionTitle = actionsTitles(action)

  const introduction = isTxPending
    ? strings.actionYouHaveSelectedTxPending(
        selectedActionTitle,
        formattingOptions(p),
      )
    : strings.actionYouHaveSelected(selectedActionTitle, formattingOptions(p))

  const navigateToChangeVote = () => {
    navigateTo.changeVote()
  }

  return (
    <View style={[a.px_lg, a.flex_1, {backgroundColor: p.bg_color_max}]}>
      <View>
        <Text style={[a.body_1_lg_regular, {color: p.text_gray_medium}]}>
          {introduction}
        </Text>
      </View>

      <Space.Height.lg />

      <View style={[a.flex_1, a.gap_lg]}>
        {isDelegatingToYoroiDrep && (
          <Action
            title={strings.delegatingToYoroiDRep}
            description={strings.delegateToAYoroiDRepDescription}
            pending={isTxPending}
            showRightArrow={!isTxPending}
            onPress={navigateToChangeVote}
          >
            <YoroiRecordLink />
          </Action>
        )}

        {isDelegatingToDrep && (
          <Action
            title={strings.delegatingToADRep}
            description={strings.actionDelegateToADRepDescription}
            pending={isTxPending}
            showRightArrow={!isTxPending}
            onPress={navigateToChangeVote}
          >
            <Text
              style={[a.body_1_lg_medium, a.font_semibold, ta.text_gray_medium]}
            >
              {strings.drepID}
            </Text>

            <Text style={[a.body_3_sm_regular, {color: p.text_gray_low}]}>
              {displayedHash}
            </Text>
          </Action>
        )}

        {action.kind === 'abstain' && (
          <Action
            title={strings.abstaining}
            description={strings.actionAbstainDescription}
            pending={isTxPending}
            showRightArrow={!isTxPending}
            onPress={navigateToChangeVote}
          />
        )}

        {action.kind === 'no-confidence' && (
          <Action
            title={strings.actionNoConfidenceTitle}
            description={strings.actionNoConfidenceDescription}
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

const formattingOptions = (p: any) => {
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
  const strings = useStrings()
  const {palette: p} = useTheme()
  const navigateTo = useNavigateTo()
  const {wallet, meta} = useSelectedWallet()
  const {manager} = useGovernance()
  const {openModal} = useModal()
  const stakingInfo = useStakingInfo(wallet, {suspense: true})
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

  const {
    createCertificate: createDelegationCertificate,
    isLoading: isCreatingDelegationCertificate,
  } = useDelegationCertificate({
    useErrorBoundary: true,
  })

  const {
    createCertificate: createVotingCertificate,
    isLoading: isCreatingVotingCertificate,
  } = useVotingCertificate({
    useErrorBoundary: true,
  })

  const createGovernanceTxMutation = useCreateGovernanceTx(wallet, {
    useErrorBoundary: (error) => !(error instanceof NotEnoughMoneyToSendError),
    onError: (error) => {
      if (error instanceof NotEnoughMoneyToSendError) {
        navigateTo.noFunds()
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
      title: strings.enterDRepID,
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
      const stakingKey = await wallet.getStakingKey()

      setPendingVote('delegate-not-yoroi')

      createDelegationCertificate(
        {hash: options.hash, type: options.type, stakingKey},
        {
          onSuccess: async (certificate) => {
            const stakeCert = needsToRegisterStakingKey
              ? await manager.createStakeRegistrationCertificate(stakingKey)
              : null
            const certs =
              stakeCert !== null ? [stakeCert, certificate] : [certificate]
            const unsignedTx = await createGovernanceTxMutation.mutateAsync({
              certificates: certs,
              addressMode: meta.addressMode,
            })

            governanceActions.handleDelegateAction({
              unsignedTx,
              hash: options.hash,
              type: options.type,
              CIP105: options.CIP105,
            })
          },
        },
      )
    })
  }

  const handleDelegateToYoroi = async () => {
    const stakingKey = await wallet.getStakingKey()

    setPendingVote('delegate-to-yoroi')

    createDelegationCertificate(
      {hash: GOVERNANCE_YOROI_DREP_ID_HEX, type: 'key', stakingKey},
      {
        onSuccess: async (certificate) => {
          const stakeCert = needsToRegisterStakingKey
            ? await manager.createStakeRegistrationCertificate(stakingKey)
            : null
          const certs =
            stakeCert !== null ? [stakeCert, certificate] : [certificate]
          const unsignedTx = await createGovernanceTxMutation.mutateAsync({
            certificates: certs,
            addressMode: meta.addressMode,
          })

          governanceActions.handleDelegateAction({
            unsignedTx,
            hash: GOVERNANCE_YOROI_DREP_ID_HEX,
            type: 'key',
            CIP105: false,
          })
        },
      },
    )
  }

  const handleAbstain = async () => {
    const stakingKey = await wallet.getStakingKey()
    setPendingVote('abstain')

    createVotingCertificate(
      {vote: 'abstain', stakingKey},
      {
        onSuccess: async (certificate) => {
          const stakeCert = needsToRegisterStakingKey
            ? await manager.createStakeRegistrationCertificate(stakingKey)
            : null
          const certs =
            stakeCert !== null ? [stakeCert, certificate] : [certificate]
          const unsignedTx = await createGovernanceTxMutation.mutateAsync({
            certificates: certs,
            addressMode: meta.addressMode,
          })

          governanceActions.handleAbstainAction({
            unsignedTx,
          })
        },
      },
    )
  }

  const handleNoConfidence = async () => {
    const stakingKey = await wallet.getStakingKey()
    setPendingVote('no-confidence')

    createVotingCertificate(
      {vote: 'no-confidence', stakingKey},
      {
        onSuccess: async (certificate) => {
          const stakeCert = needsToRegisterStakingKey
            ? await manager.createStakeRegistrationCertificate(stakingKey)
            : null
          const certs =
            stakeCert !== null ? [stakeCert, certificate] : [certificate]
          const unsignedTx = await createGovernanceTxMutation.mutateAsync({
            certificates: certs,
            addressMode: meta.addressMode,
          })

          governanceActions.handleNoConfidenceAction({
            unsignedTx,
          })
        },
      },
    )
  }

  const isCreatingTx =
    createGovernanceTxMutation.isLoading ||
    isCreatingDelegationCertificate ||
    isCreatingVotingCertificate

  return (
    <ScrollView style={[a.px_lg, a.flex_1, {backgroundColor: p.bg_color_max}]}>
      <View>
        <Text style={[a.body_1_lg_regular, {color: p.text_gray_medium}]}>
          {strings.reviewActions}
        </Text>
      </View>

      <Space.Height.lg />

      <View style={[a.flex_1, a.gap_lg]}>
        <Action
          title={strings.delegateToAYoroiDrep}
          description={strings.delegateToAYoroiDRepDescription}
          onPress={handleDelegateToYoroi}
          pending={isCreatingTx && pendingVote === 'delegate-to-yoroi'}
          showGradient
        >
          <YoroiRecordLink />
        </Action>

        <Action
          title={strings.actionDelegateToADRepTitle}
          description={strings.actionDelegateToADRepDescription}
          onPress={handleDelegate}
          pending={isCreatingTx && pendingVote === 'delegate-not-yoroi'}
        />

        <Action
          title={strings.actionAbstainTitle}
          description={strings.actionAbstainDescription}
          onPress={handleAbstain}
          pending={isCreatingTx && pendingVote === 'abstain'}
        />

        <Action
          title={strings.actionNoConfidenceTitle}
          description={strings.actionNoConfidenceDescription}
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
