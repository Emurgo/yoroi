import {HW, Wallet} from '@yoroi/types'
import {useMutation, UseMutationOptions} from 'react-query'

import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useWalletManager} from '../../context/WalletManagerProvider'

type CreateWalletXPub = {
  name: string
  bip44AccountPublic: string
  implementation: Wallet.Implementation
  hwDeviceInfo: null | HW.DeviceInfo
  readOnly: boolean
  addressMode: Wallet.AddressMode
}

export const useCreateWalletXPub = (options?: UseMutationOptions<YoroiWallet, Error, CreateWalletXPub>) => {
  const {walletManager} = useWalletManager()
  const mutation = useMutation({
    mutationFn: ({name, bip44AccountPublic, implementation, hwDeviceInfo, readOnly, addressMode}) =>
      walletManager.createWalletXPub(name, bip44AccountPublic, implementation, hwDeviceInfo, readOnly, addressMode),
    ...options,
  })

  return {
    createWallet: mutation.mutate,
    ...mutation,
  }
}
