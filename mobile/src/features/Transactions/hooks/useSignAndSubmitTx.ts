import {UnsignedTransaction} from '@yoroi/tx'

import * as CSL from '@emurgo/cross-csl-core'
import {UseMutationOptions} from '@tanstack/react-query'

import {useSubmitTx} from '~/features/Transactions/hooks/useSubmitTx'
import {YoroiWallet} from '~/wallets/cardano/types'
import {TxSubmissionStatus} from '@yoroi/api'

import {useSignTx} from './useSignTx'

export const useSignAndSubmitTx = (
  {wallet}: {wallet: YoroiWallet},
  options?: {
    signTx?: UseMutationOptions<
      CSL.Transaction,
      Error,
      {unsignedTx: UnsignedTransaction; rootKey: string}
    >
    submitTx?: UseMutationOptions<TxSubmissionStatus, Error, CSL.Transaction>
  },
) => {
  const signTx = useSignTx(
    {wallet},
    {
      retry: false,
      ...options?.signTx,
      onSuccess: (signedTx, args, context) => {
        options?.signTx?.onSuccess?.(signedTx, args, context)
        submitTx.mutate(signedTx)
      },
    },
  )
  const submitTx = useSubmitTx(
    {wallet}, //
    {...options?.submitTx},
  )

  return {
    signAndSubmitTx: signTx.mutate,
    isLoading: signTx.isPending || submitTx.isPending,
    error: signTx.error || submitTx.error,

    signTx,
    submitTx,
  }
}
