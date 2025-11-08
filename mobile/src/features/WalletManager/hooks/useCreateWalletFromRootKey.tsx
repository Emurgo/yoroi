import {Wallet} from '@yoroi/types'

import {UseMutationOptions, useMutation} from '@tanstack/react-query'

import {useWalletManager} from '../context/WalletManagerProvider'

type CreateWalletFromRootKey = {
  name: string
  rootKeyHex: string
  password: string
  implementation: Wallet.Implementation
  addressMode: Wallet.AddressMode
  accountVisual: number
}

export const useCreateWalletFromRootKey = (
  options?: UseMutationOptions<Wallet.Meta, Error, CreateWalletFromRootKey>,
) => {
  const {walletManager} = useWalletManager()
  const mutation = useMutation({
    mutationFn: ({
      name,
      rootKeyHex,
      password,
      implementation,
      addressMode,
      accountVisual,
    }) =>
      walletManager.createWalletFromRootKey({
        name,
        rootKeyHex,
        password,
        implementation,
        addressMode,
        accountVisual,
      }),
    ...options,
  })

  return {
    createWallet: mutation.mutate,
    ...mutation,
  }
}
