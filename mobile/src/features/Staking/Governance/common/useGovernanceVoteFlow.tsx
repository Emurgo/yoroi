import {
  getYoroiDrepIdHex,
  useUpdateLatestGovernanceAction,
} from '@yoroi/staking'
import {Wallet} from '@yoroi/types'

import {Certificate} from '@emurgo/cross-csl-core'
import * as React from 'react'

import {getTxIdFromArgs} from '~/features/ReviewTx/common/utils/getTxId'
import {useCreateGovernanceTx} from '~/features/Staking/hooks/useCreateGovernanceTx'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {UsePromiseOptionsWithoutPromise} from '~/hooks/usePromise'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {InfoBanner} from '~/ui/InfoBanner/InfoBanner'
import {YoroiWallet} from '~/wallets/cardano/types'

import {useNavigateTo} from './navigation'

type PendingVote =
  | 'abstain'
  | 'no-confidence'
  | 'delegate-yoroi'
  | 'delegate-other'
  | null

type DelegateOptions = {
  hash: string
  type: 'key' | 'script'
  CIP105: boolean
}

type PendingAction =
  | {type: 'delegate'; options: DelegateOptions}
  | {type: 'abstain'}
  | {type: 'no-confidence'}
  | null

type UseGovernanceVoteFlowOptions = UsePromiseOptionsWithoutPromise<
  {cbor: string},
  [{certificates: Certificate[]; addressMode: Wallet.AddressMode}]
>

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

export const useGovernanceVoteFlow = ({
  wallet,
  addressMode,
  options,
}: {
  wallet: YoroiWallet
  addressMode: Wallet.AddressMode
  options?: UseGovernanceVoteFlowOptions
}) => {
  const governanceActions = useGovernanceActions()
  const [pendingVote, setPendingVote] = React.useState<PendingVote>(null)
  const pendingActionRef = React.useRef<PendingAction>(null)
  const {
    onSuccess: optionsOnSuccess,
    onError: optionsOnError,
    ...rest
  } = options ?? {}

  const resetPendingState = () => {
    setPendingVote(null)
    pendingActionRef.current = null
  }

  const createGovernanceTxMutation = useCreateGovernanceTx(wallet, {
    ...rest,
    onSuccess: (unsignedTx) => {
      if (pendingActionRef.current?.type === 'delegate') {
        const {hash, type, CIP105} = pendingActionRef.current.options
        governanceActions.handleDelegateAction({
          unsignedTx,
          hash,
          type,
          CIP105,
        })
        resetPendingState()
        optionsOnSuccess?.(unsignedTx)
        return
      }

      if (pendingActionRef.current?.type === 'abstain') {
        governanceActions.handleAbstainAction({
          unsignedTx,
        })
        resetPendingState()
        optionsOnSuccess?.(unsignedTx)
        return
      }

      if (pendingActionRef.current?.type === 'no-confidence') {
        governanceActions.handleNoConfidenceAction({
          unsignedTx,
        })
        resetPendingState()
        optionsOnSuccess?.(unsignedTx)
        return
      }

      resetPendingState()
      optionsOnSuccess?.(unsignedTx)
    },
    onError: (error) => {
      resetPendingState()
      optionsOnError?.(error)
    },
  })

  const setDelegatePending = (options: DelegateOptions) => {
    const yoroiDrepIdHex = getYoroiDrepIdHex(wallet.networkManager.network)
    const pendingVoteValue =
      options.hash === yoroiDrepIdHex ? 'delegate-yoroi' : 'delegate-other'
    setPendingVote(pendingVoteValue)
    pendingActionRef.current = {type: 'delegate', options}
  }

  const setAbstainPending = () => {
    setPendingVote('abstain')
    pendingActionRef.current = {type: 'abstain'}
  }

  const setNoConfidencePending = () => {
    setPendingVote('no-confidence')
    pendingActionRef.current = {type: 'no-confidence'}
  }

  const submitDelegate = (
    certificates: Certificate[],
    options: DelegateOptions,
  ) => {
    setDelegatePending(options)
    createGovernanceTxMutation.resolve({
      certificates,
      addressMode,
    })
  }

  const submitAbstain = (certificates: Certificate[]) => {
    setAbstainPending()
    createGovernanceTxMutation.resolve({
      certificates,
      addressMode,
    })
  }

  const submitNoConfidence = (certificates: Certificate[]) => {
    setNoConfidencePending()
    createGovernanceTxMutation.resolve({
      certificates,
      addressMode,
    })
  }

  return {
    pendingVote,
    isCreatingTx: createGovernanceTxMutation.isPending,
    submitDelegate,
    submitAbstain,
    submitNoConfidence,
  } as const
}
