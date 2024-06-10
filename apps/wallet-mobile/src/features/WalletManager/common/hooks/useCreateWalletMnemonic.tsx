import {useMutation, UseMutationOptions} from 'react-query'

import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {NetworkId, WalletImplementationId} from '../../../../yoroi-wallets/types/other'
import {useWalletManager} from '../../context/WalletManagerProvider'
import {AddressMode} from '../types'

export type CreateWalletMnemonic = {
  name: string
  mnemonicPhrase: string
  password: string
  networkId: NetworkId
  walletImplementationId: WalletImplementationId
  addressMode: AddressMode
}

export const useCreateWalletMnemonic = (options?: UseMutationOptions<YoroiWallet, Error, CreateWalletMnemonic>) => {
  const {walletManager} = useWalletManager()
  const mutation = useMutation({
    mutationFn: ({name, mnemonicPhrase, password, networkId, walletImplementationId, addressMode}) =>
      walletManager.createWallet(name, mnemonicPhrase, password, networkId, walletImplementationId, addressMode),
    ...options,
  })

  return {
    createWallet: mutation.mutate,
    ...mutation,
  }
}
