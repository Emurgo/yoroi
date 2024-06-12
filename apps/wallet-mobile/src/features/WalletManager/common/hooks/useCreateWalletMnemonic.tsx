import {Wallet} from '@yoroi/types'
import {useMutation, UseMutationOptions} from 'react-query'

import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {useWalletManager} from '../../context/WalletManagerProvider'

export type CreateWalletMnemonic = {
  name: string
  mnemonicPhrase: string
  password: string
  implementation: Wallet.Implementation
  addressMode: Wallet.AddressMode
}

export const useCreateWalletMnemonic = (options?: UseMutationOptions<YoroiWallet, Error, CreateWalletMnemonic>) => {
  const {walletManager} = useWalletManager()
  const mutation = useMutation({
    mutationFn: ({name, mnemonicPhrase, password, implementation, addressMode}) =>
      walletManager.createWalletMnemonic(name, mnemonicPhrase, password, implementation, addressMode),
    ...options,
  })

  return {
    createWallet: mutation.mutate,
    ...mutation,
  }
}
