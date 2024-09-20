import {Wallet} from '@yoroi/types'
import {useMutation, UseMutationOptions} from 'react-query'

import {useWalletManager} from '../../context/WalletManagerProvider'

type CreateWalletMnemonic = {
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
