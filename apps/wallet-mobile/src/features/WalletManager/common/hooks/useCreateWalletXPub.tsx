import {useMutation, UseMutationOptions} from '@tanstack/react-query'
import {HW, Wallet} from '@yoroi/types'

import {useWalletManager} from '../../context/WalletManagerProvider'

type CreateWalletXPub = {
  name: string
  bip44AccountPublic: string
  implementation: Wallet.Implementation
  hwDeviceInfo: null | HW.DeviceInfo
  readOnly: boolean
  addressMode: Wallet.AddressMode
  accountVisual: number
}

export const useCreateWalletXPub = (options?: UseMutationOptions<Wallet.Meta, Error, CreateWalletXPub>) => {
  const {walletManager} = useWalletManager()
  const mutation = useMutation({
    mutationFn: ({name, bip44AccountPublic, implementation, hwDeviceInfo, readOnly, addressMode, accountVisual}) =>
      walletManager.createWalletXPub({
        name,
        accountPubKeyHex: bip44AccountPublic,
        implementation,
        hwDeviceInfo,
        isReadOnly: readOnly,
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
