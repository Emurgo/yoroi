import {UseMutationOptions} from '@tanstack/react-query'
import {useMutationWithInvalidations} from '@yoroi/common'

import {YoroiWallet} from '../../../yoroi-wallets/cardano/types'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'

export const useEnableEasyConfirmation = (
  walletId: YoroiWallet['id'],
  options?: UseMutationOptions<void, Error, string>,
) => {
  const {walletManager} = useWalletManager()
  const mutation = useMutationWithInvalidations({
    ...options,
    mutationFn: (password: string) => walletManager.enableEasyConfirmation(walletId, password),
  })

  return {
    ...mutation,
    enableEasyConfirmation: mutation.mutate,
  }
}
