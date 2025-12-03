import {YoroiWallet} from '@yoroi/cardano-wallet'

import {useWallet} from './useWallet'

export const useReceiveAddresses = (wallet: YoroiWallet) => {
  useWallet(wallet, 'addresses')
  useWallet(wallet, 'transactions')

  return wallet.receiveAddresses()
}
