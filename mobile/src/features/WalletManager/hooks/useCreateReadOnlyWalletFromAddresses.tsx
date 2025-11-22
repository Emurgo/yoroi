import {Wallet} from '@yoroi/types'

import {UseMutationOptions, useMutation} from '@tanstack/react-query'

import {useWalletManagerSelector} from '../context/WalletManagerProvider'

type CreateReadOnlyWalletFromAddresses = {
  name: string
  knownAddress?: string
  internalAddresses?: string[]
  externalAddresses?: string[]
  rewardAddressHex?: string
  implementation: Wallet.Implementation
  addressMode: Wallet.AddressMode
  accountVisual: number
  enableDiscovery?: boolean
}

export const useCreateReadOnlyWalletFromAddresses = (
  options?: UseMutationOptions<
    Wallet.Meta,
    Error,
    CreateReadOnlyWalletFromAddresses
  >,
) => {
  // Use selector to prevent re-renders when selected wallet changes
  const walletManager = useWalletManagerSelector((ctx) => ctx.walletManager)
  const mutation = useMutation({
    mutationFn: ({
      name,
      knownAddress,
      internalAddresses,
      externalAddresses,
      rewardAddressHex,
      implementation,
      addressMode,
      accountVisual,
      enableDiscovery,
    }) => {
      if (!walletManager) {
        throw new Error('WalletManager not available')
      }
      return walletManager.createReadOnlyWalletFromAddresses({
        name,
        knownAddress,
        internalAddresses,
        externalAddresses,
        rewardAddressHex,
        implementation,
        addressMode,
        accountVisual,
        enableDiscovery,
      })
    },
    ...options,
  })

  return {
    createWallet: mutation.mutate,
    ...mutation,
  }
}
