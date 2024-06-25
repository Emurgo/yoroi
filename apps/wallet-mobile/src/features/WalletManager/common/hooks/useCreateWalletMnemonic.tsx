import {useMutation, UseMutationOptions} from '@tanstack/react-query'
import {Wallet} from '@yoroi/types'

import {useWalletManager} from '../../context/WalletManagerProvider'

export type CreateWalletMnemonic = {
  name: string
  mnemonicPhrase: string
  password: string
  implementation: Wallet.Implementation
  addressMode: Wallet.AddressMode
  accountVisual: number
}

export const useCreateWalletMnemonic = (options?: UseMutationOptions<Wallet.Meta, Error, CreateWalletMnemonic>) => {
  const {walletManager} = useWalletManager()
  const mutation = useMutation({
    mutationFn: ({name, mnemonicPhrase, password, implementation, addressMode, accountVisual}) =>
      walletManager.createWalletMnemonic({
        name,
        mnemonic: mnemonicPhrase,
        password,
        implementation,
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
