import {UseMutationOptions, useMutation} from '@tanstack/react-query'

import {YoroiWallet} from '~/wallets/cardano/types'
import {YoroiSignedTx, YoroiUnsignedTx} from '~/wallets/types/yoroi'

export const useSignTxWithPassword = (
  {wallet}: {wallet: YoroiWallet},
  options: UseMutationOptions<
    YoroiSignedTx,
    Error,
    {unsignedTx: YoroiUnsignedTx; password: string}
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
