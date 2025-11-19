import {Wallet} from '@yoroi/types'

import {Certificate} from '@emurgo/cross-csl-core'
import * as React from 'react'

import {useCreateGovernanceTx} from '~/features/Staking/hooks/useCreateGovernanceTx'
import {UsePromiseOptionsWithoutPromise} from '~/hooks/usePromise'
import {YoroiWallet} from '~/wallets/cardano/types'
import {YoroiUnsignedTx} from '~/wallets/types/yoroi'

import {useGovernanceActions} from './helpers'

type PendingVote = 'abstain' | 'no-confidence' | 'delegate' | null

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
  YoroiUnsignedTx,
  [{certificates: Certificate[]; addressMode: Wallet.AddressMode}]
>

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
    setPendingVote('delegate')
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
