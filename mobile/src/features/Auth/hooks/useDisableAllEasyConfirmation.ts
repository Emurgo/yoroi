import {useWalletManager} from '@yoroi/wallet-manager'

import {UseMutationOptions, useMutation} from '@tanstack/react-query'

export const useDisableAllEasyConfirmation = (
  options?: UseMutationOptions<void, Error>,
) => {
  const {walletManager} = useWalletManager()
  const mutation = useMutation({
    mutationFn: async () => {
      for (const id of walletManager.walletMetas.keys()) {
        await walletManager.disableEasyConfirmation(id)
      }
    },
    ...options,
  })

  return {
    ...mutation,
    disableAllEasyConfirmation: mutation.mutate,
  }
}
