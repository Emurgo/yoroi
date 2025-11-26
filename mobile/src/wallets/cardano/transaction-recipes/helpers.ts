import type {RawUtxo} from '@yoroi/api'
import {ModernUtxo, rawUtxoToModernUtxo} from '@yoroi/tx'
import {Portfolio} from '@yoroi/types'

/**
 * Convert RawUtxo[] to ModernUtxo[] using wallet's getAddressing function
 */
export function convertRawUtxosToModernUtxos(
  rawUtxos: RawUtxo[],
  getAddressing: (address: string) => {path: number[]; startLevel: number},
  primaryTokenId: Portfolio.Token.Id,
): ModernUtxo[] {
  return rawUtxos.map((utxo: RawUtxo): ModernUtxo => {
    const addressing = getAddressing(utxo.receiver)

    // Convert RawUtxo to the format expected by rawUtxoToModernUtxo
    // Both types have compatible structure, we just need to ensure type safety
    const compatibleUtxo: Parameters<typeof rawUtxoToModernUtxo>[0] = {
      amount: utxo.amount,
      receiver: utxo.receiver,
      tx_hash: utxo.tx_hash,
      tx_index: utxo.tx_index,
      utxo_id: utxo.utxo_id,
      assets: utxo.assets.map((asset) => ({
        amount: asset.amount,
        tokenId: asset.tokenId,
        policyId: asset.policyId,
        name: asset.name,
      })),
    }

    return rawUtxoToModernUtxo(
      compatibleUtxo,
      addressing,
      undefined, // derivationPath - can be added later if needed for display
      primaryTokenId,
    )
  })
}
