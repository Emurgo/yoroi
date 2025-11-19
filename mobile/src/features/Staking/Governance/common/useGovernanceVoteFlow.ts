import {Wallet} from '@yoroi/types'

import {Certificate} from '@emurgo/cross-csl-core'
import * as React from 'react'

import {UsePromiseOptionsWithoutPromise} from '~/hooks/usePromise'
import {useCreateGovernanceTx} from '~/features/Staking/hooks/useCreateGovernanceTx'
import {YoroiWallet} from '~/wallets/cardano/types'
import {YoroiUnsignedTx} from '~/wallets/types/yoroi'

import {useGovernanceActions} from './helpers'

type PendingVote = 'abstain' | 'no-confidence' | 'delegate' | null

type DelegateOptions = {
  hash: string
  type: 'key' | 'script'
  CIP105: boolean
}

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
  const pendingVoteRef = React.useRef<PendingVote>(null)
  const delegateOptionsRef = React.useRef<DelegateOptions | null>(null)

  const createGovernanceTxMutation = useCreateGovernanceTx(wallet, {
    ...options,
    onSuccess: (unsignedTx) => {
      if (pendingVoteRef.current === 'delegate' && delegateOptionsRef.current) {
        const {hash, type, CIP105} = delegateOptionsRef.current
        governanceActions.handleDelegateAction({
          unsignedTx,
          hash,
          type,
          CIP105,
        })
        return
      }

      if (pendingVoteRef.current === 'abstain') {
        governanceActions.handleAbstainAction({
          unsignedTx,
        })
        return
      }

      if (pendingVoteRef.current === 'no-confidence') {
        governanceActions.handleNoConfidenceAction({
          unsignedTx,
        })
      }
    },
  })

  const setDelegatePending = (options: DelegateOptions) => {
    setPendingVote('delegate')
    pendingVoteRef.current = 'delegate'
    delegateOptionsRef.current = options
  }

  const setAbstainPending = () => {
    setPendingVote('abstain')
    pendingVoteRef.current = 'abstain'
  }

  const setNoConfidencePending = () => {
    setPendingVote('no-confidence')
    pendingVoteRef.current = 'no-confidence'
  }

  const submit = (certificates: Certificate[]) => {
    createGovernanceTxMutation.resolve({
      certificates,
      addressMode,
    })
  }

  return {
    pendingVote,
    isCreatingTx: createGovernanceTxMutation.isPending,
    setDelegatePending,
    setAbstainPending,
    setNoConfidencePending,
    submit,
  } as const
}


