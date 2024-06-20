import {useExchangeRate} from '../../../yoroi-wallets/hooks'
import {useCurrencyContext} from '../../Settings/Currency'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'

export const useTokenExchangeRate = () => {
  const {wallet} = useSelectedWallet()
  const {currency} = useCurrencyContext()
  const rate = useExchangeRate({wallet, to: currency})

  return rate
}
