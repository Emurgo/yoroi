import {Balance} from '@yoroi/types'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {_getRequiredUtxos} from '~/wallets/cardano/cip30/cip30'
import {CardanoMobileWrapped} from '~/wallets/cardano/wrappedCsl'

export const useGetInputs = () => {
  const {wallet, meta} = useSelectedWallet()

  return {
    getInputs: async (amounts: Balance.Amounts) => {
      return CardanoMobileWrapped.cslScope(async (csl) => {
        const adaAmount: Balance.Amount = {
          tokenId: wallet.portfolioPrimaryTokenInfo.id,
          quantity: '5000000',
        }
        const adaAmounts: Balance.Amounts = {
          [adaAmount.tokenId]: adaAmount.quantity,
        }

        const originalUtxos = await _getRequiredUtxos(
          wallet,
          amounts,
          wallet.utxos,
          meta,
          csl,
        )

        const adaUtxos = await _getRequiredUtxos(
          wallet,
          adaAmounts,
          wallet.utxos,
          meta,
          csl,
        )

        const allUtxos = [...(originalUtxos || []), ...(adaUtxos || [])]

        const allUtxoStrings = await Promise.all(
          allUtxos.map(async (u) => {
            return Buffer.from(await u.toBytes()).toString('hex')
          }),
        )

        const uniqueUtxoStrings = [...new Set(allUtxoStrings)]

        return uniqueUtxoStrings
      })
    },
  }
}
