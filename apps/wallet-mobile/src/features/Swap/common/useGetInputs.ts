import {Balance} from '@yoroi/types'

import {_getRequiredUtxos} from '../../../yoroi-wallets/cardano/cip30/cip30'
import {wrappedCsl} from '../../../yoroi-wallets/cardano/wrappedCsl'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'

export const useGetInputs = () => {
  const {wallet, meta} = useSelectedWallet()

  return {
    getInputs: async (amounts: Balance.Amounts) => {
      const {csl, release} = wrappedCsl()

      const result = await Promise.all(
        ((await _getRequiredUtxos(csl, wallet, amounts, wallet.utxos, meta)) || []).map(async (u) => {
          return Buffer.from(await u.toBytes()).toString('hex')
        }),
      )
      release()
      return result
    },
  }
}
