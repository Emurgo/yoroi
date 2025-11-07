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

        // First, try to get UTXOs for the combined amount (requested + 5 ADA fee)
        // If a single UTXO can cover both, we'll use just that one
        const primaryTokenId = wallet.portfolioPrimaryTokenInfo.id
        const requestedAmount = amounts[primaryTokenId] || '0'
        const combinedAmount = (
          BigInt(requestedAmount) + BigInt(adaAmount.quantity)
        ).toString() as Balance.Quantity
        const combinedAmounts: Balance.Amounts = {
          ...amounts,
          [primaryTokenId]: combinedAmount,
        } as Balance.Amounts

        const combinedUtxos = await _getRequiredUtxos(
          wallet,
          combinedAmounts,
          wallet.utxos,
          meta,
          csl,
        )

        if (combinedUtxos && combinedUtxos.length > 0) {
          const combinedUtxoStrings = await Promise.all(
            combinedUtxos.map(async (u) => {
              return Buffer.from(await u.toBytes()).toString('hex')
            }),
          )

          return combinedUtxoStrings
        }

        // If combined approach didn't work, fall back to two-step approach
        const originalUtxos = await _getRequiredUtxos(
          wallet,
          amounts,
          wallet.utxos,
          meta,
          csl,
        )

        // Extract selected UTXO identifiers to exclude them from the second call
        const selectedUtxoKeys = new Set<string>()
        if (originalUtxos && originalUtxos.length > 0) {
          // Extract txHash and txIndex from CSL UTXOs to match with RawUtxos
          // Match by both txHash and txIndex since utxo_id format may vary
          for (const utxo of originalUtxos) {
            const input = utxo.input()
            const txHash = input.transactionId().toHex()
            const txIndex = input.index()
            const key = `${txHash}:${txIndex}`
            selectedUtxoKeys.add(key)
          }
        }

        // Filter out already selected UTXOs from the pool
        // Match by txHash and txIndex to handle different utxo_id formats
        const remainingUtxos = wallet.utxos.filter((utxo) => {
          const key = `${utxo.tx_hash}:${utxo.tx_index}`
          return !selectedUtxoKeys.has(key)
        })

        const adaUtxos = await _getRequiredUtxos(
          wallet,
          adaAmounts,
          remainingUtxos,
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
