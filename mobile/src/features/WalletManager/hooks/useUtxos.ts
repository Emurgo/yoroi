import {YoroiWallet} from '~/wallets/cardano/types'

import {useWallet} from './useWallet'

export const useUtxos = (wallet: YoroiWallet) => {
  useWallet(wallet, 'utxos')

  return wallet.utxos
}
