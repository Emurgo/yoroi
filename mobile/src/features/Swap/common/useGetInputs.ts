import {CardanoMobileWrapped} from '@yoroi/cardano-wallet'
import {rawUtxoToModernUtxo} from '@yoroi/tx'
import {Balance, TokenId} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'

// Returns empty array if not enough UTXOs are found
export const useGetInputs = () => {
  const {wallet} = useSelectedWallet()

  return {
    getInputs: async (amounts: Balance.Amounts) => {
      return CardanoMobileWrapped.cslScope(async (csl) => {
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

        // For swaps, be more lax with UTXO selection - allow aggregator to decide
        // We'll include UTXOs that have relevant tokens and enough ADA, but also
        // include additional UTXOs that might be useful even if they exceed requirements

        // First, select UTXOs that contain required tokens (must have these)
        const requiredTokenIds = Object.keys(amounts).filter(
          (id) => id !== primaryTokenId,
        )

        const selectedUtxos: (typeof modernUtxos)[number][] = []
        const selectedUtxoKeys = new Set<string>()

        // Step 1: Select UTXOs with required tokens
        if (requiredTokenIds.length > 0) {
          for (const utxo of modernUtxos) {
            const hasRequiredToken = requiredTokenIds.some(
              (tokenId) => utxo.balance[tokenId as TokenId],
            )

            if (hasRequiredToken) {
              selectedUtxos.push(utxo)
              const key = `${utxo.txHash}:${utxo.txIndex}`
              selectedUtxoKeys.add(key)
            }
          }
        }

        // Step 2: Add all remaining UTXOs to maximize swap amount
        // Sort remaining UTXOs by ADA value (largest first)
        const remainingUtxos = modernUtxos.filter((utxo) => {
          const key = `${utxo.txHash}:${utxo.txIndex}`
          return !selectedUtxoKeys.has(key)
        })

        // Sort remaining UTXOs by ADA value (largest first)
        // Include ALL UTXOs to maximize swap amount - aggregator will handle tokens
        const sortedByAda = [...remainingUtxos].sort((a, b) => {
          const adaA = BigInt(a.balance[primaryTokenId] ?? '0')
          const adaB = BigInt(b.balance[primaryTokenId] ?? '0')
          return adaB > adaA ? 1 : adaB < adaA ? -1 : 0
        })

        // Add ALL UTXOs to maximize swap amount - aggregator will handle how much to use
        // Don't limit the number - include everything so aggregator can optimize
        for (const utxo of sortedByAda) {
          selectedUtxos.push(utxo)
        }

        // Convert to hex strings
        const allUtxoStrings = await Promise.all(
          selectedUtxos.map(async (utxo) => {
            const cslUtxo = utxo.toTransactionUnspentOutput(csl)
            return Buffer.from(cslUtxo.toBytes()).toString('hex')
          }),
        )

        // Remove duplicates
        const uniqueUtxoStrings = [...new Set(allUtxoStrings)]

        return uniqueUtxoStrings
      })
    },
  }
}
