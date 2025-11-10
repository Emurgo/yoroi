import {UnsignedTransaction} from '@yoroi/tx'

import * as CSL from '@emurgo/cross-csl-core'
import {UseMutationOptions, useMutation} from '@tanstack/react-query'

import {YoroiWallet} from '~/wallets/cardano/types'

export const useSignTxWithPassword = (
  {wallet}: {wallet: YoroiWallet},
  options: UseMutationOptions<
    CSL.Transaction,
    Error,
    {unsignedTx: UnsignedTransaction; password: string}
  > = {},
) => {
  const mutation = useMutation({
    mutationFn: async ({unsignedTx, password}) => {
      const rootKey = await wallet.encryptedStorage.xpriv.read(password)
      return wallet.signTx(unsignedTx, rootKey.value)
    },
    retry: false,
    ...options,
  })

  return {
    signTx: mutation.mutate,
    ...mutation,
  }
}
