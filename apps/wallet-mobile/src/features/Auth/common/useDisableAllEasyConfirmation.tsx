import {useMutation, UseMutationOptions} from '@tanstack/react-query'

import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'

export const useDisableAllEasyConfirmation = (options?: UseMutationOptions<void, Error>) => {
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
