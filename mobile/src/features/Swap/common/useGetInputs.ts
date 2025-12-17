import {CardanoMobile} from '@yoroi/cardano-wallet'
import {
  type SelectionStrategy,
  rawUtxoToModernUtxo,
  selectUtxos,
} from '@yoroi/tx'
import {Balance, Branded} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'

// Returns empty array if not enough UTXOs are found
export const useGetInputs = () => {
  const {wallet} = useSelectedWallet()

  return {
    getInputs: async (
      amounts: Balance.Amounts,
      strategy: SelectionStrategy = 'keepRelevant',
    ) => {
      const primaryTokenId = wallet.portfolioPrimaryTokenInfo.id

      // Convert RawUtxo[] to ModernUtxo[]
      const modernUtxos = wallet.utxos().map((rawUtxo) => {
        const addressing = wallet.getAddressing(rawUtxo.receiver)
        return rawUtxoToModernUtxo(
          rawUtxo as Parameters<typeof rawUtxoToModernUtxo>[0],
          addressing,
          undefined, // derivationPath
          primaryTokenId,
        )
      })

      // First, try to get UTXOs for the combined amount (requested + 5 ADA fee)
      // If a single UTXO can cover both, we'll use just that one
      const adaAmount: Balance.Amount = {
        tokenId: primaryTokenId,
        quantity: Branded.asBalanceQuantity('5000000'),
      }
      const adaAmounts: Balance.Amounts = {
        [adaAmount.tokenId]: adaAmount.quantity,
      }

      const requestedAmount = amounts[primaryTokenId] ?? Branded.ZERO_QUANTITY
      const combinedAmount = (
        BigInt(requestedAmount) + BigInt(adaAmount.quantity)
      ).toString() as Balance.Quantity
      const combinedAmounts: Balance.Amounts = {
        ...amounts,
        [primaryTokenId]: combinedAmount,
      } as Balance.Amounts

      // Try combined selection first
      const combinedSelection = selectUtxos(
        combinedAmounts,
        modernUtxos,
        strategy,
        primaryTokenId,
      )

      if (
        combinedSelection.selected.length > 0 &&
        Object.keys(combinedSelection.missingAmounts).length === 0
      ) {
        // Combined selection succeeded - convert to hex strings
        const combinedUtxoStrings = await Promise.all(
          combinedSelection.selected.map(async (utxo) => {
            const cslUtxo = utxo.toTransactionUnspentOutput(CardanoMobile)
            return Buffer.from(cslUtxo.toBytes()).toString('hex')
          }),
        )
        return combinedUtxoStrings
      }

      // If combined approach didn't work, fall back to two-step approach
      const originalSelection = selectUtxos(
        amounts,
        modernUtxos,
        strategy,
        primaryTokenId,
      )

      // If we can't get UTXOs for the original amounts, we can't proceed
      if (
        originalSelection.selected.length === 0 ||
        Object.keys(originalSelection.missingAmounts).length > 0
      ) {
        return []
      }

      // Extract selected UTXO identifiers to exclude them from the second call
      const selectedUtxoKeys = new Set<string>()
      for (const utxo of originalSelection.selected) {
        const key = `${utxo.txHash}:${utxo.txIndex}`
        selectedUtxoKeys.add(key)
      }

      // Filter out already selected UTXOs from the pool
      const remainingUtxos = modernUtxos.filter((utxo) => {
        const key = `${utxo.txHash}:${utxo.txIndex}`
        return !selectedUtxoKeys.has(key)
      })

      // Select ADA UTXOs from remaining pool
      const adaSelection = selectUtxos(
        adaAmounts,
        remainingUtxos,
        strategy,
        primaryTokenId,
      )

      // Combine both selections
      const allSelectedUtxos = [
        ...originalSelection.selected,
        ...adaSelection.selected,
      ]

      // Convert to hex strings
      const allUtxoStrings = await Promise.all(
        allSelectedUtxos.map(async (utxo) => {
          const cslUtxo = utxo.toTransactionUnspentOutput(CardanoMobile)
          return Buffer.from(cslUtxo.toBytes()).toString('hex')
        }),
      )

      // Remove duplicates
      const uniqueUtxoStrings = [...new Set(allUtxoStrings)]

      return uniqueUtxoStrings
    },
  }
}
