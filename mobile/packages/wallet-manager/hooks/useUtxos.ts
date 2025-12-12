import {YoroiWallet} from '@yoroi/cardano-wallet'

import {useWallet} from './useWallet'

export const useUtxos = (wallet: YoroiWallet): ReturnType<YoroiWallet['utxos']> => {
  useWallet(wallet, 'utxos')

  return wallet.utxos()
}
