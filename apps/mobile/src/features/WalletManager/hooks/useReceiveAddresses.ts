import {YoroiWallet} from '~/wallets/cardano/types'

import {useWallet} from './useWallet'

export const useReceiveAddresses = (wallet: YoroiWallet) => {
  useWallet(wallet, 'addresses')
  useWallet(wallet, 'transactions')

  return wallet.receiveAddresses
}
