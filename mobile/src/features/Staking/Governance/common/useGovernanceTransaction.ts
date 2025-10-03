import {Wallet} from '@yoroi/types'

import {Certificate} from '@emurgo/cross-csl-core'
import * as React from 'react'

import {useCreateGovernanceTx} from '~/features/Staking/hooks/useCreateGovernanceTx'
import {NotEnoughMoneyToSendError, YoroiWallet} from '~/wallets/cardano/types'
import {YoroiUnsignedTx} from '~/wallets/types/yoroi'

import {useGovernanceActions} from './helpers'
import {useNavigateTo} from './navigation'

type VoteType = 'abstain' | 'no-confidence'
type DelegateOptions = {
  hash: string
  type: 'key' | 'script'
  CIP105: boolean
}

export const useGovernanceTransaction = (wallet: YoroiWallet) => {
  const governanceActions = useGovernanceActions()
  const navigateTo = useNavigateTo()
  const [pendingAction, setPendingAction] = React.useState<
    | {type: 'vote'; vote: VoteType}
    | {type: 'delegate'; options: DelegateOptions}
    | null
  >(null)

  const createGovernanceTxMutation = useCreateGovernanceTx(wallet, {
    shouldThrow: false,
    onError: (error) => {
      setPendingAction(null)
      if (error instanceof NotEnoughMoneyToSendError) {
        navigateTo.noFunds()
      } else {
        throw error
      }
    },
  })

  const handleAbstainAction = React.useCallback(
    (unsignedTx: YoroiUnsignedTx) => {
      governanceActions.handleAbstainAction({unsignedTx})
    },
    [governanceActions],
  )

  const handleNoConfidenceAction = React.useCallback(
    (unsignedTx: YoroiUnsignedTx) => {
      governanceActions.handleNoConfidenceAction({unsignedTx})
    },
    [governanceActions],
  )

  const handleDelegateAction = React.useCallback(
    (options: {
      unsignedTx: YoroiUnsignedTx
      hash: string
      type: 'key' | 'script'
      CIP105: boolean
    }) => {
      governanceActions.handleDelegateAction(options)
    },
    [governanceActions],
  )

  React.useEffect(() => {
    if (
      createGovernanceTxMutation.value &&
      !createGovernanceTxMutation.isPending &&
      pendingAction
    ) {
      const currentAction = pendingAction
      setPendingAction(null)

      if (currentAction.type === 'vote') {
        if (currentAction.vote === 'abstain') {
          handleAbstainAction(createGovernanceTxMutation.value)
        } else if (currentAction.vote === 'no-confidence') {
          handleNoConfidenceAction(createGovernanceTxMutation.value)
        }
      } else if (currentAction.type === 'delegate') {
        handleDelegateAction({
          unsignedTx: createGovernanceTxMutation.value,
          hash: currentAction.options.hash,
          type: currentAction.options.type,
          CIP105: currentAction.options.CIP105,
        })
      }
    }
  }, [
    createGovernanceTxMutation.value,
    createGovernanceTxMutation.isPending,
    pendingAction,
    handleAbstainAction,
    handleNoConfidenceAction,
    handleDelegateAction,
  ])

  const submitVote = React.useCallback(
    (
      vote: VoteType,
      certificates: Certificate[],
      addressMode: Wallet.AddressMode,
    ) => {
      setPendingAction({type: 'vote', vote})
      createGovernanceTxMutation.resolve({certificates, addressMode})
    },
    [createGovernanceTxMutation],
  )

  const submitDelegation = React.useCallback(
    (
      options: DelegateOptions,
      certificates: Certificate[],
      addressMode: Wallet.AddressMode,
    ) => {
      setPendingAction({type: 'delegate', options})
      createGovernanceTxMutation.resolve({certificates, addressMode})
    },
    [createGovernanceTxMutation],
  )

  return {
    submitVote,
    submitDelegation,
    isCreatingTx: createGovernanceTxMutation.isPending,
    error: createGovernanceTxMutation.error,
  }
}
