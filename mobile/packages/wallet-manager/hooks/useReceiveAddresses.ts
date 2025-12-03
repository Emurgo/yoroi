import {YoroiWallet} from '@yoroi/cardano-wallet/types'

import {useWallet} from './useWallet'

export const useReceiveAddresses = (wallet: YoroiWallet) => {
  useWallet(wallet, 'addresses')
  useWallet(wallet, 'transactions')

  return wallet.receiveAddresses()
}
