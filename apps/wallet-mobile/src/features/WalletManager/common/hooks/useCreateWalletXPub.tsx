import {useMutation, UseMutationOptions} from 'react-query'

import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {HWDeviceInfo} from '../../../../yoroi-wallets/hw/hw'
import {NetworkId, WalletImplementationId} from '../../../../yoroi-wallets/types/other'
import {useWalletManager} from '../../context/WalletManagerProvider'
import {AddressMode} from '../types'

type CreateWalletXPub = {
  name: string
  bip44AccountPublic: string
  networkId: NetworkId
  implementationId: WalletImplementationId
  hwDeviceInfo?: null | HWDeviceInfo
  readOnly: boolean

  addressMode: AddressMode
}

export const useCreateWalletXPub = (options?: UseMutationOptions<YoroiWallet, Error, CreateWalletXPub>) => {
  const {walletManager} = useWalletManager()
  const mutation = useMutation({
    mutationFn: ({name, bip44AccountPublic, networkId, implementationId, hwDeviceInfo, readOnly, addressMode}) =>
      walletManager.createWalletXPub(
        name,
        bip44AccountPublic,
        networkId,
        implementationId,
        hwDeviceInfo || null,
        readOnly,
        addressMode,
      ),
    ...options,
  })

  return {
    createWallet: mutation.mutate,
    ...mutation,
  }
}
