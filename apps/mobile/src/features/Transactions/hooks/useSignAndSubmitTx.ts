import {UseMutationOptions} from '@tanstack/react-query'

import {YoroiWallet} from '~/wallets/cardano/types'
import {useSubmitTx} from '~/features/Transactions/hooks/useSubmitTx'
import {TxSubmissionStatus} from '~/wallets/types/other'
import {YoroiSignedTx, YoroiUnsignedTx} from '~/wallets/types/yoroi'

import {useSignTx} from './useSignTx'

export const useSignAndSubmitTx = (
  {wallet}: {wallet: YoroiWallet},
  options?: {
    signTx?: UseMutationOptions<
      YoroiSignedTx,
      Error,
      {unsignedTx: YoroiUnsignedTx; rootKey: string}
    >
    submitTx?: UseMutationOptions<TxSubmissionStatus, Error, YoroiSignedTx>
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
