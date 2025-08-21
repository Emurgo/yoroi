import {UseMutationOptions, useMutation} from '@tanstack/react-query'

import {YoroiWallet} from '~/wallets/cardano/types'

export const useSync = (
  wallet: YoroiWallet,
  options?: UseMutationOptions<void, Error>,
) => {
  const mutation = useMutation({
    ...options,
    mutationFn: () => wallet.sync({isForced: true}),
  })

  return {
    ...mutation,
    sync: mutation.mutate,
  }
}
