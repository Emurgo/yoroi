import {useWallet} from '~/features/WalletManager/hooks/useWallet'

import {YoroiWallet} from '../types'

export const useCollateralInfo = (wallet: YoroiWallet) => {
  useWallet(wallet, 'collateral-id')
  useWallet(wallet, 'utxos')

  return wallet.getCollateralInfo()
}
