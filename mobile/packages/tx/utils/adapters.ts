// Adapter functions for backward compatibility during migration
// These convert between ModernUtxo and legacy CardanoAddressedUtxo types
import {CardanoAddressedUtxo} from '../types'
import {ModernUtxo} from '../utxo/models'

/**
 * Convert ModernUtxo to legacy CardanoAddressedUtxo format
 * This is a temporary adapter for backward compatibility with legacy functions
 * @deprecated This will be removed once all legacy functions are migrated
 */
export function modernUtxoToCardanoAddressedUtxo(
  modernUtxo: ModernUtxo,
): CardanoAddressedUtxo {
  // Extract ADA amount from balance
  const adaAmount = modernUtxo.balance[''] || '0'

  // Convert assets array from balance
  const assets = Object.entries(modernUtxo.balance)
    .filter(([tokenId]) => tokenId !== '') // Exclude ADA
    .map(([assetId, amount]) => {
      // Extract policyId and name from assetId
      const policyId = assetId.substring(0, 56)
      const nameHex = assetId.substring(56)
      return {
        amount,
        assetId,
        policyId,
        name: nameHex,
      }
    })

  return {
    addressing: modernUtxo.addressing || {
      path: [],
      startLevel: 0,
    },
    txIndex: modernUtxo.txIndex,
    txHash: modernUtxo.txHash,
    amount: adaAmount,
    receiver: modernUtxo.receiver,
    utxoId: `${modernUtxo.txHash}:${modernUtxo.txIndex}`,
    assets,
  }
}

/**
 * Convert array of ModernUtxo to legacy CardanoAddressedUtxo[] format
 * @deprecated This will be removed once all legacy functions are migrated
 */
export function modernUtxosToCardanoAddressedUtxos(
  modernUtxos: ModernUtxo[],
): CardanoAddressedUtxo[] {
  return modernUtxos.map(modernUtxoToCardanoAddressedUtxo)
}
