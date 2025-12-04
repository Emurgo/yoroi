import {Wallet} from '@yoroi/types'

import {UseMutationOptions, useMutation} from '@tanstack/react-query'

import {useWalletManagerSelector} from '../context/WalletManagerProvider'

type CreateMultisigWallet = {
  name: string
  coSigners: ReadonlyArray<Wallet.CoSigner>
  quorumRules: Wallet.QuorumRules
  parentWalletIds: ReadonlyArray<string>
  parentWalletRootKeys: ReadonlyArray<{
    walletId: string
    rootKeyHex: string
    accountVisual: number
    implementation: Wallet.Implementation
  }>
}

export const useCreateMultisigWallet = (
  options?: UseMutationOptions<Wallet.Meta, Error, CreateMultisigWallet>,
) => {
  // Use selector to prevent re-renders when selected wallet changes
  const walletManager = useWalletManagerSelector((ctx) => ctx.walletManager)
  const mutation = useMutation({
    mutationFn: ({
      name,
      coSigners,
      quorumRules,
      parentWalletIds,
      parentWalletRootKeys,
    }) => {
      if (!walletManager) {
        throw new Error('WalletManager not available')
      }
      return walletManager.createMultisigWallet({
        name,
        coSigners,
        quorumRules,
        parentWalletIds,
        parentWalletRootKeys,
      })
    },
    ...options,
  })

  return {
    createWallet: mutation.mutate,
    ...mutation,
  }
}
