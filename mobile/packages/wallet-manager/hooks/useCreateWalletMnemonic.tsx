import {Wallet} from '@yoroi/types'

import {UseMutationOptions, useMutation} from '@tanstack/react-query'

import {useWalletManagerSelector} from '../context/WalletManagerProvider'

type CreateWalletMnemonic = {
  name: string
  mnemonicPhrase: string
  password: string
  implementation: Wallet.Implementation
  addressMode: Wallet.AddressMode
  accountVisual: number
}

export const useCreateWalletMnemonic = (
  options?: UseMutationOptions<Wallet.Meta, Error, CreateWalletMnemonic>,
) => {
  // Use selector to prevent re-renders when selected wallet changes
  const walletManager = useWalletManagerSelector((ctx) => ctx.walletManager)
  const mutation = useMutation({
    mutationFn: ({
      name,
      mnemonicPhrase,
      password,
      implementation,
      addressMode,
      accountVisual,
    }) => {
      if (!walletManager) {
        throw new Error('WalletManager not available')
      }
      return walletManager.createWalletMnemonic({
        name,
        mnemonic: mnemonicPhrase,
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
