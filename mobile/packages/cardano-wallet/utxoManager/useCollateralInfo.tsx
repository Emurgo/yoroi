import {useWallet} from '@yoroi/wallet-manager'

import {YoroiWallet} from '../types'

export const useCollateralInfo = (wallet: YoroiWallet) => {
  useWallet(wallet, 'collateral-id')
  useWallet(wallet, 'utxos')

  return wallet.getCollateralInfo()
}
