import {isNonNullable, isString, useAsyncStorage} from '@yoroi/common'
import {
  getYoroiDrepIdHex,
  type StakingKeyState,
  governanceApiMaker,
  governanceManagerMaker,
  useDelegationCertificate,
  useGovernance,
  useLatestGovernanceAction,
  useStakingKeyState,
  useUpdateLatestGovernanceAction,
  useVotingCertificate,
} from '@yoroi/staking'
import {NotEnoughMoneyToSendError} from '@yoroi/tx'

import * as React from 'react'

import {getTxIdFromArgs} from '~/features/ReviewTx/common/utils/getTxId'
import {useStakingInfo} from '~/features/Staking/hooks/useStakingInfo'
import {useStakingKey} from '~/features/Staking/hooks/useStakingKey'
import {useWalletTransactions} from '~/features/Transactions/hooks/useWalletTransactions'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useWalletEvent} from '~/features/WalletManager/hooks/useWalletEvent'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {InfoBanner} from '~/ui/InfoBanner/InfoBanner'
import {CardanoMobile} from '~/wallets/wallets'

import {GovernanceVote} from '../types'
import {formatDrepHashToCIP129Format} from './drep'
import {useNavigateTo} from './navigation'
import {useGovernanceVoteFlow} from './useGovernanceVoteFlow'

export const useGovernanceParticipation = () => {
  const {wallet} = useSelectedWallet()
  const stakingKeyHash = useStakingKey(wallet)
  const {
    data: stakingStatus,
    isLoading,
    refetch,
  } = useStakingKeyState(stakingKeyHash)

  useWalletEvent(wallet, 'utxos', refetch)

  const isParticipating = stakingStatus?.drepDelegation != null
  return {isParticipating, isLoading} as const
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

export const useGovernanceActions = () => {
  const {wallet} = useSelectedWallet()
  const navigateTo = useNavigateTo()
  const {updateLatestGovernanceAction} = useUpdateLatestGovernanceAction(
    wallet.id,
  )
  const {navigateToTxReview} = useWalletNavigation()
  const strings = useStrings()

  const handleDelegateAction = ({
    hash,
    unsignedTx,
    type,
    CIP105 = false,
  }: {
    hash: string
    type: 'key' | 'script'
    unsignedTx: {cbor: string}
    CIP105: boolean
  }) => {
    navigateToTxReview({
      cbor: unsignedTx.cbor,
      onSuccess: async (args) => {
        // Use utility function to safely extract txId
        // Pass unsigned CBOR as fallback (safe - body hash is same for signed/unsigned)
        const txID = await getTxIdFromArgs(args, unsignedTx.cbor)
        if (!txID) {
          logger.error('handleDelegateAction: No txId available')
          return
        }
        try {
          updateLatestGovernanceAction(
            {
              kind: 'delegate-to-drep',
              hash,
              type,
              txID,
            },
            {
              onError: (error) => {
                logger.error(
                  'handleDelegateAction: Failed to update governance action',
                  {
                    error:
                      error instanceof Error ? error.message : String(error),
                    txID,
                    hash,
                    delegateType: type,
                  },
                )
              },
              onSuccess: () => {
                // Governance action updated successfully
              },
            },
          )
        } catch (error) {
          logger.error(
            'handleDelegateAction: Error calling updateLatestGovernanceAction',
            {
              error: error instanceof Error ? error.message : String(error),
              txID,
              hash,
              delegateType: type,
            },
          )
        }
      },
      onNotSupportedCIP1694: navigateTo.notSupportedVersion,
      context: 'delegate vote',
      ...(CIP105
        ? {
            operationsNotice: (
              <InfoBanner
                content={
                  strings.staking.delegateVotingToDRepDeprecatedFormatNotice
                }
              />
            ),
          }
        : {}),
    })
  }

  const handleAbstainAction = ({unsignedTx}: {unsignedTx: {cbor: string}}) => {
    navigateToTxReview({
      cbor: unsignedTx.cbor,
      onSuccess: async (args) => {
        // Use utility function to safely extract txId
        // Pass unsigned CBOR as fallback (safe - body hash is same for signed/unsigned)
        const txID = await getTxIdFromArgs(args, unsignedTx.cbor)
        if (!txID) {
          logger.error('handleAbstainAction: No txId available')
          return
        }
        try {
          updateLatestGovernanceAction(
            {
              kind: 'vote',
              vote: 'abstain',
              txID,
            },
            {
              onError: (error) => {
                logger.error(
                  'handleAbstainAction: Failed to update governance action',
                  {
                    error:
                      error instanceof Error ? error.message : String(error),
                    txID,
                  },
                )
              },
              onSuccess: () => {
                // Governance action updated successfully
              },
            },
          )
        } catch (error) {
          logger.error(
            'handleAbstainAction: Error calling updateLatestGovernanceAction',
            {
              error: error instanceof Error ? error.message : String(error),
              txID,
            },
          )
        }
      },
      onNotSupportedCIP1694: navigateTo.notSupportedVersion,
      context: 'delegate vote',
    })
  }

  const handleNoConfidenceAction = ({
    unsignedTx,
  }: {
    unsignedTx: {cbor: string}
  }) => {
    navigateToTxReview({
      cbor: unsignedTx.cbor,
      onSuccess: async (args) => {
        // Use utility function to safely extract txId
        // Pass unsigned CBOR as fallback (safe - body hash is same for signed/unsigned)
        const txID = await getTxIdFromArgs(args, unsignedTx.cbor)
        if (!txID) {
          logger.error('handleNoConfidenceAction: No txId available')
          return
        }
        try {
          updateLatestGovernanceAction(
            {
              kind: 'vote',
              vote: 'no-confidence',
              txID,
            },
            {
              onError: (error) => {
                logger.error(
                  'handleNoConfidenceAction: Failed to update governance action',
                  {
                    error:
                      error instanceof Error ? error.message : String(error),
                    txID,
                  },
                )
              },
              onSuccess: () => {
                // Governance action updated successfully
              },
            },
          )
        } catch (error) {
          logger.error(
            'handleNoConfidenceAction: Error calling updateLatestGovernanceAction',
            {
              error: error instanceof Error ? error.message : String(error),
              txID,
            },
          )
        }
      },
      onNotSupportedCIP1694: navigateTo.notSupportedVersion,
      context: 'delegate vote',
    })
  }

  return {
    handleDelegateAction,
    handleAbstainAction,
    handleNoConfidenceAction,
  } as const
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

  const yoroiDrepIdHex = React.useMemo(
    () => getYoroiDrepIdHex(wallet.networkManager.network),
    [wallet.networkManager.network],
  )
  const displayedHash =
    action.kind === 'delegate'
      ? formatDrepHashToCIP129Format(action.hash, action.type)
      : null
  const isDelegatingToYoroiDrep =
    action.kind === 'delegate' && action.hash === yoroiDrepIdHex
  const isDelegatingToDrep =
    action.kind === 'delegate' && action.hash !== yoroiDrepIdHex

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
    isDelegatingToYoroiDrep,
    isDelegatingToDrep,
    handleDelegateToOtherDrep,
    navigateToVotingOptions,
  }
}

export const useNeverParticipatedGovernance = (initialDrepId?: string) => {
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

  const yoroiDrepIdHex = React.useMemo(
    () => getYoroiDrepIdHex(wallet.networkManager.network),
    [wallet.networkManager.network],
  )

  const handleDelegateToYoroi = async () => {
    if (isPending) return
    const stakingKey = wallet.getStakingKey()

    const options = {
      hash: yoroiDrepIdHex,
      type: 'key' as const,
      CIP105: false,
    }

    const certificate = await createDelegationCertificate({
      hash: yoroiDrepIdHex,
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

  return {
    isPending,
    handleDelegateToYoroi,
    handleExploreOtherOptions,
    initialDrepId,
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

  const yoroiDrepIdHex = React.useMemo(
    () => getYoroiDrepIdHex(wallet.networkManager.network),
    [wallet.networkManager.network],
  )

  const pendingTxHash =
    isTxPendingConfirmation && lastSubmittedTx?.kind === 'delegate-to-drep'
      ? lastSubmittedTx.hash
      : undefined
  const pendingTxType =
    isTxPendingConfirmation && lastSubmittedTx?.kind === 'delegate-to-drep'
      ? lastSubmittedTx.type
      : 'key'

  const isPendingDelegateToYoroi =
    pendingTxHash === yoroiDrepIdHex
  const isPendingDelegateToOther = Boolean(
    pendingTxHash && !isPendingDelegateToYoroi,
  )

  const confirmedDelegatingToYoroi = voteHash === yoroiDrepIdHex
  const confirmedDelegatingToOther = Boolean(
    voteKind === 'delegate' && voteHash && !confirmedDelegatingToYoroi,
  )

  const isDelegatingToYoroiDrep = isTxPendingConfirmation
    ? isPendingDelegateToYoroi
    : confirmedDelegatingToYoroi
  const isDelegatingToOtherDrep = isTxPendingConfirmation
    ? isPendingDelegateToOther
    : confirmedDelegatingToOther

  const otherDrepHash = isDelegatingToOtherDrep
    ? isPendingDelegateToOther
      ? pendingTxHash
      : voteHash
    : null
  const otherDrepType = isDelegatingToOtherDrep
    ? isPendingDelegateToOther
      ? pendingTxType
      : voteType
    : 'key'
  const otherDrepDisplayId = otherDrepHash
    ? formatDrepHashToCIP129Format(otherDrepHash, otherDrepType)
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

  const yoroiDrepIdHex = React.useMemo(
    () => getYoroiDrepIdHex(wallet.networkManager.network),
    [wallet.networkManager.network],
  )

  const handleDelegateToYoroi = async () => {
    if (isPending) return
    const stakingKey = wallet.getStakingKey()

    const options = {
      hash: yoroiDrepIdHex,
      type: 'key' as const,
      CIP105: false,
    }

    const certificate = await createDelegationCertificate({
      hash: yoroiDrepIdHex,
      type: 'key',
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
    isDelegatingToYoroiDrep,
    isDelegatingToOtherDrep,
    confirmedDelegatingToOther,
    otherDrepDisplayId,
    isAbstaining,
    isNoConfidence,
    handleDelegate,
    handleDelegateToYoroi,
    handleAbstain,
    handleNoConfidence,
  }
}
