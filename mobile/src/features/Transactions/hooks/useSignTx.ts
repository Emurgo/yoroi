import {UnsignedTransaction} from '@yoroi/tx'

import * as CSL from '@emurgo/cross-csl-core'
import {UseMutationOptions, useMutation} from '@tanstack/react-query'

import {YoroiWallet} from '~/wallets/cardano/types'

export const useSignTx = (
  {wallet}: {wallet: YoroiWallet},
  options: UseMutationOptions<
    CSL.Transaction,
    Error,
    {unsignedTx: UnsignedTransaction; rootKey: string}
  > = {},
) => {
  const mutation = useMutation({
    mutationFn: ({unsignedTx, rootKey}) => wallet.signTx(unsignedTx, rootKey),
    retry: false,
    ...options,
  })

  return {
    signTx: mutation.mutate,
    ...mutation,
  }
}
