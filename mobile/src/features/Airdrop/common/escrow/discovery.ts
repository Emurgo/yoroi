import {CardanoMobileWrapped} from '@yoroi/cardano-wallet'

import {logger} from '~/kernel/logger/logger'

import {NIGHT_ASSET_NAME_HEX, NIGHT_POLICY_ID} from './constants'
import {parseEscrowDatum} from './datumParser'
import type {EscrowUtxo} from './types'

type UtxoForAddressesResponse = Array<{
  tx_hash: string
  tx_index: number
  receiver: string
  amount: string
  assets: Array<{
    assetId: string
    policyId: string
    name: string
    amount: string
  }>
  // The API may return inline_datum as either:
  // - a CBOR hex string (e.g. "d87999f...")
  // - an object with plutus_data (e.g. {plutus_data: {constructor: 0, fields: [...]}})
  inline_datum?: string | {plutus_data?: Record<string, unknown>}
}>

/**
 * Discover the current escrow UTxO at the given escrow address.
 * Uses the Yoroi API `utxoForAddresses` endpoint.
 */
export async function discoverEscrowUtxo(
  escrowAddress: string,
  apiBaseUrl: string,
): Promise<EscrowUtxo> {
  const nightTokenId = `${NIGHT_POLICY_ID}.${NIGHT_ASSET_NAME_HEX}`

  const response = await fetch(`${apiBaseUrl}/api/txs/utxoForAddresses`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      addresses: [escrowAddress],
      asset: {policy: NIGHT_POLICY_ID, name: NIGHT_ASSET_NAME_HEX},
    }),
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch escrow UTxOs: ${response.status} ${response.statusText}`,
    )
  }

  const utxos = (await response.json()) as UtxoForAddressesResponse

  // Find UTxO with NIGHT tokens and an inline datum
  const escrowUtxo = utxos.find((utxo) => {
    const hasNight = utxo.assets?.some(
      (a) =>
        a.assetId === nightTokenId ||
        (a.policyId === NIGHT_POLICY_ID && a.name === NIGHT_ASSET_NAME_HEX),
    )
    const hasDatum = !!utxo.inline_datum
    return hasNight && hasDatum
  })

  if (!escrowUtxo || !escrowUtxo.inline_datum) {
    logger.error('discoverEscrowUtxo: No escrow UTxO found', {
      escrowAddress,
      utxoCount: utxos.length,
    })
    throw new Error('No escrow UTxO found at address')
  }

  const nightAsset = escrowUtxo.assets.find(
    (a) =>
      a.assetId === nightTokenId ||
      (a.policyId === NIGHT_POLICY_ID && a.name === NIGHT_ASSET_NAME_HEX),
  )

  if (!nightAsset) {
    throw new Error('No NIGHT asset found in escrow UTxO')
  }

  // Extract datum CBOR hex — API may return either a CBOR hex string or a JSON object
  let datumHex: string
  if (typeof escrowUtxo.inline_datum === 'string') {
    datumHex = escrowUtxo.inline_datum
  } else if (escrowUtxo.inline_datum.plutus_data) {
    const plutusDataJson = JSON.stringify(escrowUtxo.inline_datum.plutus_data)
    datumHex = await CardanoMobileWrapped.cslScope(async (csl) => {
      const plutusData = csl.PlutusData.fromJson(plutusDataJson, 1)
      return plutusData.toHex()
    })
  } else {
    throw new Error('Unrecognized inline_datum format')
  }

  const datum = parseEscrowDatum(datumHex)

  return {
    txHash: escrowUtxo.tx_hash,
    txIndex: escrowUtxo.tx_index,
    address: escrowUtxo.receiver,
    nightAmount: nightAsset.amount,
    adaAmount: escrowUtxo.amount,
    datumHex,
    datum,
  }
}
