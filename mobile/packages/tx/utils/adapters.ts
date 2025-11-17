// Adapter functions for converting between ModernUtxo and CardanoAddressedUtxo types
import {CardanoAddressedUtxo} from '../types'
import {ModernUtxo} from '../utxo/models'

/**
 * Convert ModernUtxo to CardanoAddressedUtxo format
 */
export function modernUtxoToCardanoAddressedUtxo(
  modernUtxo: ModernUtxo,
): CardanoAddressedUtxo {
  return {
    addressing: modernUtxo.addressing || {
      path: [],
      startLevel: 0,
    },
    txIndex: modernUtxo.txIndex,
    txHash: modernUtxo.txHash,
    receiver: modernUtxo.receiver,
    utxoId: `${modernUtxo.txHash}:${modernUtxo.txIndex}`,
    balance: modernUtxo.balance, // Use Balance.Amounts directly
  }
}

/**
 * Convert array of ModernUtxo to CardanoAddressedUtxo[] format
 */
export function modernUtxosToCardanoAddressedUtxos(
  modernUtxos: ModernUtxo[],
): CardanoAddressedUtxo[] {
  return modernUtxos.map(modernUtxoToCardanoAddressedUtxo)
}
