import {useSelectedWallet} from '../../../WalletManager/common/hooks/useSelectedWallet'
import {usePortfolioPrimaryBalance} from './usePortfolioPrimaryBalance'

export const useZeroBalance = () => {
  const {wallet} = useSelectedWallet()
  const primaryBalance = usePortfolioPrimaryBalance({wallet})
  const hasZeroPt = primaryBalance.quantity === 0n

  // NOTE: zero pt means it can't hold any other token.
  return hasZeroPt
}
