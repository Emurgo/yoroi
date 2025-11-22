import {Wallet} from '@yoroi/types'

import {UseMutationOptions, useMutation} from '@tanstack/react-query'

import {useWalletManagerSelector} from '../context/WalletManagerProvider'

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
  // Use selector to prevent re-renders when selected wallet changes
  const walletManager = useWalletManagerSelector((ctx) => ctx.walletManager)
  const mutation = useMutation({
    mutationFn: ({
      name,
      rootKeyHex,
      password,
      implementation,
      addressMode,
      accountVisual,
    }) => {
      if (!walletManager) {
        throw new Error('WalletManager not available')
      }
      return walletManager.createWalletFromRootKey({
        name,
        rootKeyHex,
        password,
        implementation,
        addressMode,
        accountVisual,
      })
    },
    ...options,
  })

  return {
    createWallet: mutation.mutate,
    ...mutation,
  }
}
