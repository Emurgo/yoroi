import {Balance} from '@yoroi/types'

import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {_getRequiredUtxos} from '~/wallets/cardano/cip30/cip30'

export const useGetInputs = () => {
  const {wallet, meta} = useSelectedWallet()

  return {
    getInputs: async (amounts: Balance.Amounts) => {
      // Create amounts for 5 ADA
      const adaAmount: Balance.Amount = {
        tokenId: wallet.portfolioPrimaryTokenInfo.id,
        quantity: '5000000', // 5 ADA = 5 * 10^6 lovelace
      }
      const adaAmounts: Balance.Amounts = {
        [adaAmount.tokenId]: adaAmount.quantity,
      }

      // Get UTXOs for original amounts
      const originalUtxos = await _getRequiredUtxos(
        wallet,
        amounts,
        wallet.utxos,
        meta,
      )

      // Get UTXOs for 5 ADA
      const adaUtxos = await _getRequiredUtxos(
        wallet,
        adaAmounts,
        wallet.utxos,
        meta,
      )

      // Combine both results and remove duplicates using string comparison
      const allUtxos = [...(originalUtxos || []), ...(adaUtxos || [])]

      // Convert all UTXOs to hex strings first
      const allUtxoStrings = await Promise.all(
        allUtxos.map(async (u) => {
          return Buffer.from(await u.toBytes()).toString('hex')
        }),
      )

      // Remove duplicate strings
      const uniqueUtxoStrings = [...new Set(allUtxoStrings)]

      return uniqueUtxoStrings
    },
  }
}
