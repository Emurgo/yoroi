import type {YoroiWallet} from '@yoroi/cardano-wallet'

import {useWallet} from './useWallet'

export const useCollateralInfo = (
  wallet: YoroiWallet,
): ReturnType<YoroiWallet['getCollateralInfo']> => {
  useWallet(wallet, 'collateral-id')
  useWallet(wallet, 'utxos')

  return wallet.getCollateralInfo()
}
