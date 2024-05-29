import { useCurrencyContext } from '../../../features/Settings/Currency';
import { useSelectedWallet } from '../../../features/WalletManager/context/SelectedWalletContext';
import { useExchangeRate } from '../../../yoroi-wallets/hooks';

export const useTokenExchangeRate = () => {
  const wallet = useSelectedWallet()
  const {currency} = useCurrencyContext()
  const rate = useExchangeRate({ wallet, to: currency })

  return rate
};