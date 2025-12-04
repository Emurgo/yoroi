import {YoroiWallet} from '@yoroi/cardano-wallet'

import {UseMutationOptions, useMutation} from '@tanstack/react-query'

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
