import {Portfolio} from '@yoroi/types'
import {ModernUtxo, rawUtxoToModernUtxo} from '@yoroi/tx'
import type {RawUtxo} from '~/wallets/types/other'

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

    return rawUtxoToModernUtxo(
      utxo as unknown as Parameters<typeof rawUtxoToModernUtxo>[0],
      addressing,
      undefined, // derivationPath - can be added later if needed for display
      primaryTokenId,
    )
  })
}

