import {NotEnoughMoneyToSendError} from '@emurgo/yoroi-lib/dist/errors'
import {useFocusEffect} from '@react-navigation/native'
import {isNonNullable, isString} from '@yoroi/common'
import {
  GovernanceProvider,
  useBech32DRepID,
  useDelegationCertificate,
  useGovernance,
  useLatestGovernanceAction,
  useStakingKeyState,
  useVotingCertificate,
} from '@yoroi/staking'
import {useTheme} from '@yoroi/theme'
import React, {type ReactNode} from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useModal} from '../../../../../components/Modal/ModalContext'
import {Spacer} from '../../../../../components/Spacer/Spacer'
import {useMetrics} from '../../../../../kernel/metrics/metricsManager'
import {useUnsafeParams} from '../../../../../kernel/navigation'
import {useStakingInfo} from '../../../../../legacy/Dashboard/StakePoolInfos'
import {
  useCreateGovernanceTx,
  useStakingKey,
  useTransactionInfos,
  useWalletEvent,
} from '../../../../../yoroi-wallets/hooks'
import {TransactionInfo} from '../../../../../yoroi-wallets/types/other'
import {useSelectedWallet} from '../../../../WalletManager/common/hooks/useSelectedWallet'
import {Action} from '../../common/Action/Action'
import {mapStakingKeyStateToGovernanceAction, useGovernanceActions} from '../../common/helpers'
import {LearnMoreLink} from '../../common/LearnMoreLink/LearnMoreLink'
import {Routes, useNavigateTo} from '../../common/navigation'
import {useStrings} from '../../common/strings'
import {GovernanceVote} from '../../types'
import {EnterDrepIdModal} from '../EnterDrepIdModal/EnterDrepIdModal'

export const HomeScreen = () => {
  const {wallet} = useSelectedWallet()
  const txInfos = useTransactionInfos({wallet})
  const stakingKeyHash = useStakingKey(wallet)
  const [isPendingRefetchAfterTxConfirmation, setIsPendingRefetchAfterTxConfirmation] = React.useState(false)

  const {data: stakingStatus, refetch: refetchStakingKeyState} = useStakingKeyState(stakingKeyHash, {
    refetchOnMount: true,
    suspense: true,
  })

  useWalletEvent(wallet, 'utxos', refetchStakingKeyState)

  const {data: lastSubmittedTx} = useLatestGovernanceAction(wallet.id)

  const submittedTxId = lastSubmittedTx?.txID

  const isTxPending = isString(submittedTxId) && !isTxConfirmed(submittedTxId, txInfos)

  React.useEffect(() => {
    if (!isTxPending && submittedTxId !== undefined) {
      setIsPendingRefetchAfterTxConfirmation(true)
      refetchStakingKeyState().finally(() => setIsPendingRefetchAfterTxConfirmation(false))
    }
  }, [isTxPending, submittedTxId, refetchStakingKeyState, setIsPendingRefetchAfterTxConfirmation])

  const txPendingDisplayed = isTxPending || isPendingRefetchAfterTxConfirmation

  if (txPendingDisplayed && isNonNullable(lastSubmittedTx)) {
    if (lastSubmittedTx.kind === 'delegate-to-drep') {
      const action: GovernanceVote = {kind: 'delegate', drepID: lastSubmittedTx.drepID}
      return <ParticipatingInGovernanceVariant action={action} isTxPending />
    }
    if (lastSubmittedTx.kind === 'vote' && lastSubmittedTx.vote === 'abstain') {
      const action: GovernanceVote = {kind: 'abstain'}
      return <ParticipatingInGovernanceVariant action={action} isTxPending />
    }

    if (lastSubmittedTx.kind === 'vote' && lastSubmittedTx.vote === 'no-confidence') {
      const action: GovernanceVote = {kind: 'no-confidence'}
      return <ParticipatingInGovernanceVariant action={action} isTxPending />
    }
  }

  const action = stakingStatus ? mapStakingKeyStateToGovernanceAction(stakingStatus) : null
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
  const {styles} = useStyles()
  const navigateTo = useNavigateTo()
  const {data: bech32DrepId} = useBech32DRepID(action.kind === 'delegate' ? action.drepID : '', {
    enabled: action.kind === 'delegate',
  })

  const actionTitles = {
    abstain: strings.actionAbstainTitle,
    delegate: strings.actionDelegateToADRepTitle,
    'no-confidence': strings.actionNoConfidenceTitle,
  }
  const selectedActionTitle = actionTitles[action.kind]

  const introduction = isTxPending
    ? strings.actionYouHaveSelectedTxPending(selectedActionTitle, formattingOptions(styles))
    : strings.actionYouHaveSelected(selectedActionTitle, formattingOptions(styles))

  const navigateToChangeVote = () => {
    navigateTo.changeVote()
  }

  return (
    <View style={styles.root}>
      <View>
        <Text style={styles.description}>{introduction}</Text>
      </View>

      <Spacer height={24} />

      <View style={styles.actions}>
        {action.kind === 'delegate' && (
          <Action
            title={strings.delegatingToADRep}
            description={strings.actionDelegateToADRepDescription}
            pending={isTxPending}
            showRightArrow={!isTxPending}
            onPress={navigateToChangeVote}
          >
            <Text style={styles.drepInfoTitle}>{strings.drepID}</Text>

            <Text style={styles.drepInfoDescription}>{bech32DrepId ?? action.drepID}</Text>
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

      <Spacer fill />

      <LearnMoreLink />

      <Spacer height={24} />
    </View>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formattingOptions = (styles: any) => {
  return {
    b: (text: ReactNode) => {
      return <Text style={[styles.description, styles.bold]}>{text}</Text>
    },
    textComponent: (text: ReactNode) => <Text style={styles.description}>{text}</Text>,
  }
}

const NeverParticipatedInGovernanceVariant = () => {
  const strings = useStrings()
  const {styles} = useStyles()
  const navigateTo = useNavigateTo()
  const {
    wallet,
    meta: {addressMode},
  } = useSelectedWallet()
  const {manager} = useGovernance()
  const {openModal} = useModal()
  const stakingInfo = useStakingInfo(wallet, {suspense: true})
  const params = useUnsafeParams<Routes['staking-gov-home']>()
  const {track} = useMetrics()
  const [pendingVote, setPendingVote] = React.useState<GovernanceVote['kind'] | null>(null)
  const governanceActions = useGovernanceActions()

  useFocusEffect(
    React.useCallback(() => {
      track.governanceDashboardPageViewed()
    }, [track]),
  )

  const hasStakingKeyRegistered = stakingInfo?.data?.status !== 'not-registered'
  useWalletEvent(wallet, 'utxos', stakingInfo.refetch)
  const needsToRegisterStakingKey = !hasStakingKeyRegistered

  const {createCertificate: createDelegationCertificate, isLoading: isCreatingDelegationCertificate} =
    useDelegationCertificate({
      useErrorBoundary: true,
    })

  const {createCertificate: createVotingCertificate, isLoading: isCreatingVotingCertificate} = useVotingCertificate({
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

  const openDRepIdModal = (onSubmit: (drepId: string) => void) => {
    track.governanceChooseDrepPageViewed()

    openModal(
      strings.enterDRepID,
      <GovernanceProvider manager={manager}>
        <EnterDrepIdModal onSubmit={onSubmit} />
      </GovernanceProvider>,
      360,
    )
  }

  const handleDelegate = () => {
    openDRepIdModal(async (drepID) => {
      const vote = {kind: 'delegate', drepID} as const
      const stakingKey = await wallet.getStakingKey()

      setPendingVote(vote.kind)

      createDelegationCertificate(
        {drepID, stakingKey},
        {
          onSuccess: async (certificate) => {
            const stakeCert = needsToRegisterStakingKey
              ? await manager.createStakeRegistrationCertificate(stakingKey)
              : null
            const certs = stakeCert !== null ? [stakeCert, certificate] : [certificate]
            const unsignedTx = await createGovernanceTxMutation.mutateAsync({certificates: certs, addressMode})

            governanceActions.handleDelegateAction({
              unsignedTx,
              drepID,
              navigateToStakingOnSuccess: params?.navigateToStakingOnSuccess,
            })
          },
        },
      )
    })
  }

  const handleAbstain = async () => {
    const stakingKey = await wallet.getStakingKey()
    const vote = {kind: 'abstain'} as const
    setPendingVote(vote.kind)

    createVotingCertificate(
      {vote: 'abstain', stakingKey},
      {
        onSuccess: async (certificate) => {
          const stakeCert = needsToRegisterStakingKey
            ? await manager.createStakeRegistrationCertificate(stakingKey)
            : null
          const certs = stakeCert !== null ? [stakeCert, certificate] : [certificate]
          const unsignedTx = await createGovernanceTxMutation.mutateAsync({certificates: certs, addressMode})

          governanceActions.handleAbstainAction({
            unsignedTx,
            navigateToStakingOnSuccess: params?.navigateToStakingOnSuccess,
          })
        },
      },
    )
  }

  const handleNoConfidence = async () => {
    const stakingKey = await wallet.getStakingKey()
    const vote = {kind: 'no-confidence'} as const
    setPendingVote(vote.kind)

    createVotingCertificate(
      {vote: 'no-confidence', stakingKey},
      {
        onSuccess: async (certificate) => {
          const stakeCert = needsToRegisterStakingKey
            ? await manager.createStakeRegistrationCertificate(stakingKey)
            : null
          const certs = stakeCert !== null ? [stakeCert, certificate] : [certificate]
          const unsignedTx = await createGovernanceTxMutation.mutateAsync({certificates: certs, addressMode})

          governanceActions.handleNoConfidenceAction({
            unsignedTx,
            navigateToStakingOnSuccess: params?.navigateToStakingOnSuccess,
          })
        },
      },
    )
  }

  const isCreatingTx =
    createGovernanceTxMutation.isLoading || isCreatingDelegationCertificate || isCreatingVotingCertificate

  return (
    <View style={styles.root}>
      <View>
        <Text style={styles.description}>{strings.reviewActions}</Text>
      </View>

      <Spacer height={24} />

      <View style={styles.actions}>
        <Action
          title={strings.actionDelegateToADRepTitle}
          description={strings.actionDelegateToADRepDescription}
          onPress={handleDelegate}
          pending={isCreatingTx && pendingVote === 'delegate'}
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

      <Spacer fill />

      <LearnMoreLink />

      <Spacer height={24} />
    </View>
  )
}

const isTxConfirmed = (txId: string, txInfos: Record<string, TransactionInfo>) => {
  return Object.values(txInfos).some((tx) => tx.id === txId)
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    root: {
      ...atoms.px_lg,
      ...atoms.flex_1,
      ...atoms.justify_between,
      backgroundColor: color.bg_color_max,
    },
    description: {
      color: color.text_gray_medium,
      ...atoms.body_1_lg_regular,
    },
    bold: {
      ...atoms.font_semibold,
      ...atoms.body_1_lg_regular,
    },
    actions: {
      ...atoms.flex_1,
      ...atoms.gap_lg,
    },
    drepInfoTitle: {
      color: color.text_gray_medium,
      ...atoms.body_1_lg_medium,
      ...atoms.font_semibold,
    },
    drepInfoDescription: {
      color: color.text_gray_low,
      ...atoms.body_3_sm_regular,
    },
  })

  return {styles} as const
}
