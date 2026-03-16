import {CardanoMobile, isByron} from '@yoroi/cardano-wallet'
import {isNonNullable, isString, useAsyncStorage} from '@yoroi/common'
import {
  type StakingKeyState,
  governanceApiMaker,
  governanceManagerMaker,
  useDelegationCertificate,
  useGovernance,
  useLatestGovernanceAction,
  useStakingKeyState,
  useVotingCertificate,
} from '@yoroi/staking'
import {NotEnoughMoneyToSendError} from '@yoroi/tx'
import {useSelectedWallet} from '@yoroi/wallet-manager'
import {useWalletEvent} from '@yoroi/wallet-manager'

import * as React from 'react'

import {useStakingInfo} from '~/features/Staking/hooks/useStakingInfo'
import {useStakingKey} from '~/features/Staking/hooks/useStakingKey'
import {useWalletTransactions} from '~/features/Transactions/hooks/useWalletTransactions'

import {GovernanceVote} from '../types'
import {formatDrepHashToCIP129Format} from './drep'
import {useNavigateTo} from './navigation'
import {useGovernanceVoteFlow} from './useGovernanceVoteFlow'

export const useGovernanceParticipation = () => {
  const {wallet, meta} = useSelectedWallet()

  // Skip governance for Byron wallets
  const isByronWallet = React.useMemo(
    () => (meta ? isByron(meta.implementation) : false),
    [meta],
  )

  const stakingKeyHash = useStakingKey(wallet)
  const {
    data: stakingStatus,
    isLoading,
    refetch,
  } = useStakingKeyState(stakingKeyHash)

  useWalletEvent(wallet, 'utxos', refetch)

  const isParticipating = React.useMemo(
    () =>
      isByronWallet || !stakingKeyHash
        ? false
        : stakingStatus?.drepDelegation != null,
    [isByronWallet, stakingKeyHash, stakingStatus?.drepDelegation],
  )
  return {
    isParticipating,
    isLoading: isByronWallet ? false : isLoading,
  } as const
}

export const useGovernanceStatus = () => {
  const {wallet} = useSelectedWallet()
  const stakingKeyHash = useStakingKey(wallet)
  const {data: stakingStatus, refetch} = useStakingKeyState(stakingKeyHash)

  useWalletEvent(wallet, 'utxos', refetch)

  return React.useMemo(() => {
    return stakingStatus
      ? mapStakingKeyStateToGovernanceAction(stakingStatus)
      : null
  }, [stakingStatus])
}

export const mapStakingKeyStateToGovernanceAction = (
  state: StakingKeyState,
): GovernanceVote | null => {
  if (!state.drepDelegation) return null
  const vote = state.drepDelegation
  return vote.action === 'abstain'
    ? {kind: 'abstain'}
    : vote.action === 'no-confidence'
      ? {kind: 'no-confidence'}
      : {kind: 'delegate', hash: vote.hash, type: vote.type}
}

export const useGovernanceManagerMaker = () => {
  const selectedWallet = useSelectedWallet()

  const {
    wallet: {
      networkManager: {network},
      id: walletId,
    },
  } = selectedWallet

  const storage = useAsyncStorage()
  const governanceStorage = storage.join(
    `wallet/${walletId}/staking-governance/`,
  )

  return React.useMemo(
    () =>
      governanceManagerMaker({
        walletId,
        network,
        api: governanceApiMaker({network}),
        cardano: CardanoMobile,
        storage: governanceStorage,
      }),
    [governanceStorage, network, walletId],
  )
}

const isTxConfirmed = (
  txId: string,
  transactions: ReturnType<typeof useWalletTransactions>,
) => {
  return txId in transactions
}

export const useHomeScreen = () => {
  const {wallet} = useSelectedWallet()
  const transactions = useWalletTransactions({wallet})
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
    isString(submittedTxId) && !isTxConfirmed(submittedTxId, transactions)

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

  const pendingAction = React.useMemo((): GovernanceVote | null => {
    if (!txPendingDisplayed || !isNonNullable(lastSubmittedTx)) return null

    if (lastSubmittedTx.kind === 'delegate-to-drep') {
      return {
        kind: 'delegate',
        hash: lastSubmittedTx.hash,
        type: lastSubmittedTx.type,
      }
    }
    if (lastSubmittedTx.kind === 'vote' && lastSubmittedTx.vote === 'abstain') {
      return {kind: 'abstain'}
    }
    if (
      lastSubmittedTx.kind === 'vote' &&
      lastSubmittedTx.vote === 'no-confidence'
    ) {
      return {kind: 'no-confidence'}
    }
    return null
  }, [txPendingDisplayed, lastSubmittedTx])

  const confirmedAction = stakingStatus
    ? mapStakingKeyStateToGovernanceAction(stakingStatus)
    : null

  return {
    isLoading,
    pendingAction,
    confirmedAction,
  }
}

export const useParticipatingGovernance = ({
  action,
  isTxPending = false,
}: {
  action: GovernanceVote
  isTxPending?: boolean
}) => {
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

  const isPending = isCreatingTx || pendingVote !== null || isTxPending

  const displayedHash =
    action.kind === 'delegate'
      ? formatDrepHashToCIP129Format(action.hash, action.type)
      : null
  const isDelegatingToDrep = action.kind === 'delegate'

  const handleDelegateToOtherDrep = async (options: {
    hash: string
    type: 'key' | 'script'
    CIP105: boolean
  }) => {
    if (isPending) return
    const stakingKey = wallet.getStakingKey()

    const certificate = await createDelegationCertificate({
      hash: options.hash,
      type: options.type,
      stakingKey,
    })
    const stakeCert = needsToRegisterStakingKey
      ? manager.createStakeRegistrationCertificate(stakingKey)
      : null
    const certs = stakeCert !== null ? [stakeCert, certificate] : [certificate]

    submitDelegate(certs, options)
  }

  const navigateToVotingOptions = () => {
    navigateTo.votingOptions()
  }

  return {
    manager,
    isPending,
    displayedHash,
    isDelegatingToDrep,
    handleDelegateToOtherDrep,
    navigateToVotingOptions,
  }
}

export const useNeverParticipatedGovernance = () => {
  const navigateTo = useNavigateTo()

  const handleExploreOtherOptions = () => {
    navigateTo.votingOptions()
  }

  return {
    handleExploreOtherOptions,
  }
}

export const useVotingOptions = () => {
  const navigateTo = useNavigateTo()
  const {wallet, meta} = useSelectedWallet()
  const {manager} = useGovernance()
  const stakingInfo = useStakingInfo(wallet)
  const stakingKeyHash = useStakingKey(wallet)
  const {data: stakingStatus} = useStakingKeyState(stakingKeyHash)
  const transactions = useWalletTransactions({wallet})

  const {data: lastSubmittedTx} = useLatestGovernanceAction(wallet.id)
  const submittedTxId = lastSubmittedTx?.txID
  const isTxPendingConfirmation =
    isString(submittedTxId) && !isTxConfirmed(submittedTxId, transactions)

  const action = stakingStatus
    ? mapStakingKeyStateToGovernanceAction(stakingStatus)
    : null
  const voteKind = action?.kind

  const hasStakingKeyRegistered = stakingInfo?.data?.status !== 'not-registered'
  useWalletEvent(wallet, 'utxos', stakingInfo.refetch)
  const needsToRegisterStakingKey = !hasStakingKeyRegistered

  const createDelegationCertificate = useDelegationCertificate()
  const createVotingCertificate = useVotingCertificate()

  const {
    pendingVote,
    isCreatingTx,
    submitDelegate,
    submitAbstain,
    submitNoConfidence,
  } = useGovernanceVoteFlow({
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

  const isPending =
    isCreatingTx || pendingVote !== null || isTxPendingConfirmation

  const voteHash =
    voteKind === 'delegate' && action != null ? action.hash : undefined
  const voteType =
    voteKind === 'delegate' && action != null && 'type' in action
      ? action.type
      : 'key'

  const pendingTxHash =
    isTxPendingConfirmation && lastSubmittedTx?.kind === 'delegate-to-drep'
      ? lastSubmittedTx.hash
      : undefined
  const pendingTxType =
    isTxPendingConfirmation && lastSubmittedTx?.kind === 'delegate-to-drep'
      ? lastSubmittedTx.type
      : 'key'

  const isPendingDelegatingToDrep = Boolean(
    isTxPendingConfirmation &&
      lastSubmittedTx?.kind === 'delegate-to-drep' &&
      pendingTxHash,
  )
  const confirmedDelegatingToDrep = Boolean(voteKind === 'delegate' && voteHash)
  const isDelegatingToDrep = isTxPendingConfirmation
    ? isPendingDelegatingToDrep
    : confirmedDelegatingToDrep

  const drepHash = isDelegatingToDrep
    ? isPendingDelegatingToDrep
      ? pendingTxHash
      : voteHash
    : null
  const drepType = isDelegatingToDrep
    ? isPendingDelegatingToDrep
      ? pendingTxType
      : voteType
    : 'key'
  const drepDisplayId = drepHash
    ? formatDrepHashToCIP129Format(drepHash, drepType)
    : null

  const isPendingAbstain =
    isTxPendingConfirmation &&
    lastSubmittedTx?.kind === 'vote' &&
    lastSubmittedTx?.vote === 'abstain'
  const isPendingNoConfidence =
    isTxPendingConfirmation &&
    lastSubmittedTx?.kind === 'vote' &&
    lastSubmittedTx?.vote === 'no-confidence'

  const isAbstaining = isTxPendingConfirmation
    ? isPendingAbstain
    : voteKind === 'abstain'
  const isNoConfidence = isTxPendingConfirmation
    ? isPendingNoConfidence
    : voteKind === 'no-confidence'

  const handleDelegate = async (options: {
    hash: string
    type: 'key' | 'script'
    CIP105: boolean
  }) => {
    if (isPending) return
    const stakingKey = wallet.getStakingKey()

    const certificate = await createDelegationCertificate({
      hash: options.hash,
      type: options.type,
      stakingKey,
    })
    const stakeCert = needsToRegisterStakingKey
      ? manager.createStakeRegistrationCertificate(stakingKey)
      : null
    const certs = stakeCert !== null ? [stakeCert, certificate] : [certificate]

    submitDelegate(certs, options)
  }

  const handleAbstain = async () => {
    if (isPending) return
    const stakingKey = wallet.getStakingKey()

    const certificate = await createVotingCertificate({
      vote: 'abstain',
      stakingKey,
    })
    const stakeCert = needsToRegisterStakingKey
      ? manager.createStakeRegistrationCertificate(stakingKey)
      : null
    const certs = stakeCert !== null ? [stakeCert, certificate] : [certificate]

    submitAbstain(certs)
  }

  const handleNoConfidence = async () => {
    if (isPending) return
    const stakingKey = wallet.getStakingKey()

    const certificate = await createVotingCertificate({
      vote: 'no-confidence',
      stakingKey,
    })
    const stakeCert = needsToRegisterStakingKey
      ? manager.createStakeRegistrationCertificate(stakingKey)
      : null
    const certs = stakeCert !== null ? [stakeCert, certificate] : [certificate]

    submitNoConfidence(certs)
  }

  return {
    manager,
    isPending,
    isDelegatingToDrep,
    confirmedDelegatingToDrep,
    drepDisplayId,
    isAbstaining,
    isNoConfidence,
    handleDelegate,
    handleAbstain,
    handleNoConfidence,
  }
}
