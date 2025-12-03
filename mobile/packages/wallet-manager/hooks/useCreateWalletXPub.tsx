import {HW, Wallet} from '@yoroi/types'

import {UseMutationOptions, useMutation} from '@tanstack/react-query'

import {useWalletManagerSelector} from '../context/WalletManagerProvider'

type CreateWalletXPub = {
  name: string
  bip44AccountPublic: string
  implementation: Wallet.Implementation
  hwDeviceInfo: null | HW.DeviceInfo
  readOnly: boolean
  addressMode: Wallet.AddressMode
  accountVisual: number
}

export const useCreateWalletXPub = (
  options?: UseMutationOptions<Wallet.Meta, Error, CreateWalletXPub>,
) => {
  // Use selector to prevent re-renders when selected wallet changes
  const walletManager = useWalletManagerSelector((ctx) => ctx.walletManager)
  const mutation = useMutation({
    mutationFn: ({
      name,
      bip44AccountPublic,
      implementation,
      hwDeviceInfo,
      readOnly,
      addressMode,
      accountVisual,
    }) => {
      if (!walletManager) {
        throw new Error('WalletManager not available')
      }
      return walletManager.createWalletXPub({
        name,
        accountPubKeyHex: bip44AccountPublic,
        implementation,
        hwDeviceInfo,
        isReadOnly: readOnly,
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
