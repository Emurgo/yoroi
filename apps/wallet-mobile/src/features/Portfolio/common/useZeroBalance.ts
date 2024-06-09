import {useBalances} from '../../../yoroi-wallets/hooks'
import {Amounts, Quantities} from '../../../yoroi-wallets/utils'
import {useSelectedWallet} from '../../WalletManager/context/SelectedWalletContext'

export const useZeroBalance = () => {
  const wallet = useSelectedWallet()
  const balances = useBalances(wallet)
  const primaryAmount = Amounts.getAmount(balances, wallet.primaryTokenInfo.id)
  const hasZeroPt = Quantities.isZero(primaryAmount.quantity)

  return hasZeroPt
}
