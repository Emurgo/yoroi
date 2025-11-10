import {UnsignedTransaction} from '@yoroi/tx'

import * as CSL from '@emurgo/cross-csl-core'
import {UseMutationOptions} from '@tanstack/react-query'

import {useSubmitTx} from '~/features/Transactions/hooks/useSubmitTx'
import {YoroiWallet} from '~/wallets/cardano/types'
import {TxSubmissionStatus} from '~/wallets/types/other'

import {useSignTxWithPassword} from './useSignTxWithPassword'

export const useSignWithPasswordAndSubmitTx = (
  {wallet}: {wallet: YoroiWallet},
  options?: {
    signTx?: UseMutationOptions<
      CSL.Transaction,
      Error,
      {unsignedTx: UnsignedTransaction; password: string}
    >
    submitTx?: UseMutationOptions<TxSubmissionStatus, Error, CSL.Transaction>
  },
) => {
  const signTx = useSignTxWithPassword(
    {wallet},
    {
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
