import type {CardanoHaskellConfig} from '@yoroi/tx'
import {
  addCollateralInput,
  addInput,
  addOutput,
  addScriptInput,
  buildTransaction,
  createTransactionBuilder,
  setChangeAddress,
  setValidityInterval,
} from '@yoroi/tx'
import type {ModernUtxo} from '@yoroi/tx'
import type {Balance, DatumCbor, Portfolio} from '@yoroi/types'

import {logger} from '~/kernel/logger/logger'

import {
  ESCROW_SCRIPT_HASH,
  ESCROW_SCRIPT_SIZE,
  KNOWN_REFERENCE_SCRIPT_UTXOS,
  NIGHT_ASSET_NAME_HEX,
  NIGHT_POLICY_ID,
  SHELLEY_SLOT_CONFIG,
} from './constants'
import {buildUpdatedDatumHex} from './datumParser'
import type {EscrowUtxo} from './types'

const NIGHT_TOKEN_ID =
  `${NIGHT_POLICY_ID}.${NIGHT_ASSET_NAME_HEX}` as Portfolio.Token.Id

/**
 * Convert milliseconds since epoch to Cardano slot number.
 */
function msToSlot(ms: bigint): number {
  const unixSeconds = Number(ms / 1000n)
  return (
    unixSeconds - SHELLEY_SLOT_CONFIG.zeroTime + SHELLEY_SLOT_CONFIG.zeroSlot
  )
}

/**
 * Create a ModernUtxo-like object for the escrow UTxO.
 * Since escrow UTxOs come from chain query (not wallet), we construct manually.
 */
function escrowToModernUtxo(
  escrowUtxo: EscrowUtxo,
  primaryTokenId: Portfolio.Token.Id,
): ModernUtxo {
  const balance: Balance.Amounts = {
    [primaryTokenId]: escrowUtxo.adaAmount as Balance.Quantity,
    [NIGHT_TOKEN_ID]: escrowUtxo.nightAmount as Balance.Quantity,
  }

  return {
    receiver: escrowUtxo.address,
    txHash: escrowUtxo.txHash,
    txIndex: escrowUtxo.txIndex,
    balance,
    toTransactionUnspentOutputHex: () => {
      throw new Error('Not needed for script inputs')
    },
    toTransactionUnspentOutput: () => {
      throw new Error('Not needed for script inputs')
    },
  } as unknown as ModernUtxo
}

export type BuildEscrowRedeemTxParams = {
  escrowUtxo: EscrowUtxo
  eligibleAddress: string
  fundingUtxos: ModernUtxo[]
  collateralUtxo: ModernUtxo
  changeAddress: string
  protocolParams: CardanoHaskellConfig
  primaryTokenId: Portfolio.Token.Id
  currentSlot: number
}

/**
 * Build an escrow redeem transaction for thaw #2+.
 * Returns the unsigned transaction CBOR hex.
 */
export async function buildEscrowRedeemTx(
  params: BuildEscrowRedeemTxParams,
): Promise<string> {
  const {
    escrowUtxo,
    eligibleAddress,
    fundingUtxos,
    collateralUtxo,
    changeAddress,
    protocolParams,
    primaryTokenId,
    currentSlot,
  } = params

  const {datum} = escrowUtxo

  if (datum.thawsRemaining <= 0n) {
    throw new Error('No thaws remaining in escrow')
  }

  const nightPerThaw = datum.nightPerThaw.toString()
  const totalNight = BigInt(escrowUtxo.nightAmount)
  const remainingNight = totalNight - datum.nightPerThaw

  logger.info('buildEscrowRedeemTx: Building transaction', {
    escrowTxHash: escrowUtxo.txHash,
    escrowTxIndex: escrowUtxo.txIndex,
    nightPerThaw: nightPerThaw,
    thawsRemaining: datum.thawsRemaining.toString(),
    totalNight: totalNight.toString(),
    remainingNight: remainingNight.toString(),
  })

  let state = createTransactionBuilder()

  // Script input: the escrow UTxO being spent
  const escrowModernUtxo = escrowToModernUtxo(escrowUtxo, primaryTokenId)
  const refScriptUtxo =
    KNOWN_REFERENCE_SCRIPT_UTXOS[1] ?? KNOWN_REFERENCE_SCRIPT_UTXOS[0]!

  state = addScriptInput(state, {
    utxo: escrowModernUtxo,
    scriptHash: ESCROW_SCRIPT_HASH,
    redeemer: 'd87980', // Constr(0, [])
    redeemerExUnits: {mem: '900000', steps: '250000000'},
    referenceScriptUtxo: {
      txHash: refScriptUtxo.txHash,
      txIndex: refScriptUtxo.txIndex,
      langVersion: 'v3',
      scriptSize: ESCROW_SCRIPT_SIZE,
    },
    datumSource: 'inline',
  })

  // Funding inputs (ADA for fees)
  for (const utxo of fundingUtxos) {
    state = addInput(state, utxo)
  }

  // Output 1: NIGHT to eligible address
  const eligibleOutputAmounts: Balance.Amounts = {
    [primaryTokenId]: '1176630' as Balance.Quantity, // min ADA for token output
    [NIGHT_TOKEN_ID]: nightPerThaw as Balance.Quantity,
  }
  state = addOutput(state, eligibleAddress, eligibleOutputAmounts)

  // Output 2: Escrow change (if thaws remaining > 1)
  if (datum.thawsRemaining > 1n) {
    const updatedDatumHex = buildUpdatedDatumHex(datum)
    const escrowChangeAmounts: Balance.Amounts = {
      [primaryTokenId]: escrowUtxo.adaAmount as Balance.Quantity,
      [NIGHT_TOKEN_ID]: remainingNight.toString() as Balance.Quantity,
    }
    state = addOutput(state, escrowUtxo.address, escrowChangeAmounts, {
      data: updatedDatumHex as DatumCbor,
    })
  }

  // Collateral
  state = addCollateralInput(state, collateralUtxo)

  // Validity interval: must be after thaw date, within reasonable TTL
  const thawSlot = msToSlot(datum.nextThawTime)
  const invalidBefore = Math.max(thawSlot, currentSlot)
  const invalidAfter = currentSlot + 7200 // ~2 hours TTL
  state = setValidityInterval(state, invalidBefore, invalidAfter)

  // Change address
  state = setChangeAddress(state, changeAddress)

  // Build
  const result = await buildTransaction(state, protocolParams, primaryTokenId)

  if (!result.cbor) {
    throw new Error('Failed to build escrow redeem transaction')
  }

  logger.info('buildEscrowRedeemTx: Transaction built successfully', {
    cborLength: result.cbor.length,
  })

  return result.cbor
}
