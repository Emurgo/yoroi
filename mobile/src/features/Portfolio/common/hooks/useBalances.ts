import {YoroiWallet} from '@yoroi/cardano-wallet/types'
import {Utxos} from '@yoroi/cardano-wallet/utils/utils'
import {Balance} from '@yoroi/types'
import {useUtxos} from '@yoroi/wallet-manager/hooks/useUtxos'

// NOTE: LEGACY should use portfolio instead
export const useBalances = (wallet: YoroiWallet): Balance.Amounts => {
  const utxos = useUtxos(wallet)

  return Utxos.toAmounts(utxos, wallet.portfolioPrimaryTokenInfo.id)
}
