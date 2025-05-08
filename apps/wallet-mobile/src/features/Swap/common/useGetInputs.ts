import {Balance} from '@yoroi/types'

import {_getRequiredUtxos} from '../../../yoroi-wallets/cardano/cip30/cip30'
import {wrappedCsl as getCSL} from '../../../yoroi-wallets/cardano/wrappedCsl'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'

export const useGetInputs = () => {
  const {wallet, meta} = useSelectedWallet()
  const {csl} = getCSL()

  return {
    getInputs: async (amounts: Balance.Amounts) =>
      Promise.all(
        ((await _getRequiredUtxos(csl, wallet, amounts, wallet.allUtxos, meta)) || []).map(async (u) => {
          return Buffer.from(await u.toBytes()).toString('hex')
        }),
      ),
  }
}
