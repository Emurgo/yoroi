import {Balance} from '@yoroi/types'

import {useUtxos} from '~/features/WalletManager/hooks/useUtxos'
import {YoroiWallet} from '~/wallets/cardano/types'
import {Utxos} from '~/wallets/utils/utils'

// NOTE: LEGACY should use portfolio instead
export const useBalances = (wallet: YoroiWallet): Balance.Amounts => {
  const utxos = useUtxos(wallet)

  return Utxos.toAmounts(utxos, wallet.portfolioPrimaryTokenInfo.id)
}
