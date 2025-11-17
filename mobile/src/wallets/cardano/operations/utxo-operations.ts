import {type ModernUtxo, rawUtxoToModernUtxo} from '@yoroi/tx'
import {Portfolio, Wallet} from '@yoroi/types'

import type {RawUtxo} from '~/wallets/types/other'

import {getAddressing} from './address-operations'

/**
 * Convert RawUtxo array to ModernUtxo array with addressing
 */
export const getAddressedUtxos = (
  utxos: RawUtxo[],
  wallet: {
    publicKeyHex: string
    accountVisual: number
    internalChain: {
      isMyAddress: (address: string) => boolean
      getIndexOfAddress: (address: string) => number
      addresses?: string[]
    }
    externalChain: {
      isMyAddress: (address: string) => boolean
      getIndexOfAddress: (address: string) => number
      addresses?: string[]
    }
    getAddressing: (address: string) => {
      path: number[]
      startLevel: number
    }
  },
  primaryTokenId: Portfolio.Token.Id,
  implementation: Wallet.Implementation,
): ModernUtxo[] => {
  return utxos.map((utxo: RawUtxo): ModernUtxo => {
    const addressing = getAddressing(
      utxo.receiver,
      {
        publicKeyHex: wallet.publicKeyHex,
        accountVisual: wallet.accountVisual,
        internalChain: wallet.internalChain as Parameters<
          typeof getAddressing
        >[1]['internalChain'],
        externalChain: wallet.externalChain as Parameters<
          typeof getAddressing
        >[1]['externalChain'],
      },
      implementation,
    )

    // Convert RawUtxo to the format expected by rawUtxoToModernUtxo
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
      'path' in addressing ? addressing : undefined,
      undefined, // derivationPath - can be added later if needed for display
      primaryTokenId,
    )
  })
}

/**
 * Check if UTXOs have been updated
 */
export const didUtxosUpdate = (
  oldUtxos: RawUtxo[],
  newUtxos: RawUtxo[],
): boolean => {
  if (oldUtxos.length !== newUtxos.length) {
    return true
  }

  const oldUtxoIds = new Set(oldUtxos.map((utxo) => utxo.utxo_id))

  for (const newUtxo of newUtxos) {
    if (!oldUtxoIds.has(newUtxo.utxo_id)) {
      return true
    }
  }

  return false
}

/**
 * Filter UTXOs excluding collateral
 */
export const getSpendableUtxos = (
  utxos: RawUtxo[],
  collateralId: string,
): RawUtxo[] => {
  return collateralId.length > 0
    ? utxos.filter((utxo) => utxo.utxo_id !== collateralId)
    : utxos
}
