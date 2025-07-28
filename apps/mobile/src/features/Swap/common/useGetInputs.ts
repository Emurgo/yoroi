import {Balance} from '@yoroi/types'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {_getRequiredUtxos} from '~/wallets/cardano/cip30/cip30'
import {wrappedCsl} from '~/wallets/cardano/wrappedCsl'

export const useGetInputs = () => {
  const {wallet, meta} = useSelectedWallet()

  return {
    getInputs: async (amounts: Balance.Amounts) => {
      const {csl, release} = wrappedCsl()

      const result = await Promise.all(
        (
          (await _getRequiredUtxos(csl, wallet, amounts, wallet.utxos, meta)) ||
          []
        ).map(async (u) => {
          return Buffer.from(await u.toBytes()).toString('hex')
        }),
      )
      release()
      return result
    },
  }
}
