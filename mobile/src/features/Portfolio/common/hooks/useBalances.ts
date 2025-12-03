import {YoroiWallet} from '@yoroi/cardano-wallet'
import {Utxos} from '@yoroi/cardano-wallet'
import {Balance} from '@yoroi/types'
import {useUtxos} from '@yoroi/wallet-manager/hooks/useUtxos'

// NOTE: LEGACY should use portfolio instead
export const useBalances = (wallet: YoroiWallet): Balance.Amounts => {
  const utxos = useUtxos(wallet)

  return Utxos.toAmounts(utxos, wallet.portfolioPrimaryTokenInfo.id)
}
