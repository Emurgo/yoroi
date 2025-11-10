// Helper functions for TransactionBuilder
// Utilities for creating certificates, filtering UTXOs, and handling metadata
import type {
  Certificate,
  PublicKey,
  WasmModuleProxy,
} from '@emurgo/cross-csl-core'

import {ModernUtxo} from '../utxo/models'

/**
 * Create a stake registration certificate
 */
export function createStakeRegistrationCertificate(
  wasm: WasmModuleProxy,
  stakingKey: PublicKey,
): Certificate {
  const stakingCredential = wasm.Credential.fromKeyhash(stakingKey.hash())
  const stakeRegistration = wasm.StakeRegistration.new(stakingCredential)
  return wasm.Certificate.newStakeRegistration(stakeRegistration)
}

/**
 * Create a stake deregistration certificate
 */
export function createStakeDeregistrationCertificate(
  wasm: WasmModuleProxy,
  stakingKey: PublicKey,
): Certificate {
  const stakingCredential = wasm.Credential.fromKeyhash(stakingKey.hash())
  const stakeDeregistration = wasm.StakeDeregistration.new(stakingCredential)
  return wasm.Certificate.newStakeDeregistration(stakeDeregistration)
}

/**
 * Create a stake delegation certificate
 */
export function createStakeDelegationCertificate(
  wasm: WasmModuleProxy,
  stakingKey: PublicKey,
  poolKeyHash: string, // Hex string
): Certificate {
  const stakingCredential = wasm.Credential.fromKeyhash(stakingKey.hash())
  const poolKeyHashBytes = Buffer.from(poolKeyHash, 'hex')
  const poolKeyHashObj = wasm.Ed25519KeyHash.fromBytes(
    new Uint8Array(poolKeyHashBytes),
  )
  const stakeDelegation = wasm.StakeDelegation.new(
    stakingCredential,
    poolKeyHashObj,
  )
  return wasm.Certificate.newStakeDelegation(stakeDelegation)
}

/**
 * Create a vote delegation certificate (CIP-1694)
 */
export function createVoteDelegationCertificate(
  wasm: WasmModuleProxy,
  stakingKey: PublicKey,
  drepId: string, // Hex string or bech32
  isCIP105: boolean = false,
): Certificate {
  const stakingCredential = wasm.Credential.fromKeyhash(stakingKey.hash())

  // Parse DRep ID (can be hex or bech32)
  let drep: import('@emurgo/cross-csl-core').DRep
  if (drepId.startsWith('drep')) {
    // Bech32 format - need to decode
    // For now, assume hex format
    throw new Error('Bech32 DRep ID format not yet supported in helper')
  } else {
    // Hex format - assume it's a key hash
    const drepKeyHashBytes = Buffer.from(drepId, 'hex')
    const keyHash = wasm.Ed25519KeyHash.fromBytes(
      new Uint8Array(drepKeyHashBytes),
    )
    drep = wasm.DRep.newKeyHash(keyHash)
  }

  const votingDelegation = wasm.VoteDelegation.new(stakingCredential, drep)

  if (isCIP105) {
    // CIP-105 format (legacy)
    return wasm.Certificate.newVoteDelegation(votingDelegation)
  } else {
    // CIP-1694 format (new)
    return wasm.Certificate.newVoteDelegation(votingDelegation)
  }
}

/**
 * UTXO filter: Filter UTXOs by address
 */
export function filterUtxosByAddress(
  utxos: ModernUtxo[],
  addresses: string[],
): ModernUtxo[] {
  const addressSet = new Set(addresses)
  return utxos.filter((utxo) => addressSet.has(utxo.receiver))
}

/**
 * UTXO filter: Filter UTXOs by minimum ADA amount
 */
export function filterUtxosByMinAda(
  utxos: ModernUtxo[],
  minAda: string,
  primaryTokenId: string = '',
): ModernUtxo[] {
  const minAdaBigInt = BigInt(minAda)
  return utxos.filter((utxo) => {
    const adaAmount = BigInt(utxo.balance[primaryTokenId] || '0')
    return adaAmount >= minAdaBigInt
  })
}

/**
 * UTXO filter: Filter pure ADA UTXOs (no native assets)
 */
export function filterPureAdaUtxos(
  utxos: ModernUtxo[],
  primaryTokenId: string = '',
): ModernUtxo[] {
  return utxos.filter((utxo) => {
    // Pure ADA means only the primary token (ADA) is present
    const keys = Object.keys(utxo.balance)
    return keys.length === 1 && keys[0] === primaryTokenId
  })
}

/**
 * UTXO filter: Filter UTXOs within collateral range
 */
export function filterCollateralUtxos(
  utxos: ModernUtxo[],
  minCollateral: string,
  maxCollateral: string,
  primaryTokenId: string = '',
): ModernUtxo[] {
  const minBigInt = BigInt(minCollateral)
  const maxBigInt = BigInt(maxCollateral)
  return utxos.filter((utxo) => {
    const adaAmount = BigInt(utxo.balance[primaryTokenId] || '0')
    return adaAmount >= minBigInt && adaAmount <= maxBigInt
  })
}

/**
 * UTXO filter: Sort UTXOs by ADA amount (descending)
 */
export function sortUtxosByAda(
  utxos: ModernUtxo[],
  primaryTokenId: string = '',
): ModernUtxo[] {
  return [...utxos].sort((a, b) => {
    const aAda = BigInt(a.balance[primaryTokenId] || '0')
    const bAda = BigInt(b.balance[primaryTokenId] || '0')
    if (aAda > bAda) return -1
    if (aAda < bAda) return 1
    return 0
  })
}

/**
 * UTXO filter: Select UTXOs to cover amount (greedy algorithm)
 */
export function selectUtxosForAmount(
  utxos: ModernUtxo[],
  targetAmount: string,
  primaryTokenId: string = '',
): ModernUtxo[] {
  const targetBigInt = BigInt(targetAmount)
  const sorted = sortUtxosByAda(utxos, primaryTokenId)
  const selected: ModernUtxo[] = []
  let total = BigInt(0)

  for (const utxo of sorted) {
    if (total >= targetBigInt) break
    selected.push(utxo)
    total += BigInt(utxo.balance[primaryTokenId] || '0')
  }

  return selected
}

/**
 * Create metadata entry from label and data
 */
export function createMetadataEntry(
  label: number,
  data: unknown,
): {label: number; data: unknown} {
  return {label, data}
}

/**
 * Create CIP-15 voting metadata (legacy Catalyst voting)
 */
export function createCIP15VotingMetadata(
  votingPublicKey: string,
  stakingPublicKey: string,
  rewardAddress: string,
  nonce: number,
): {label: number; data: unknown} {
  return {
    label: 61284, // CIP-15 DATA label
    data: {
      1: votingPublicKey,
      2: stakingPublicKey,
      3: rewardAddress,
      4: nonce,
    },
  }
}

/**
 * Create CIP-36 voting metadata (new Catalyst voting format)
 */
export function createCIP36VotingMetadata(
  votingPublicKey: string,
  stakingPublicKey: string,
  rewardAddress: string,
  nonce: number,
  paymentAddress?: string,
): {label: number; data: unknown} {
  const metadata: Record<string, unknown> = {
    1: votingPublicKey,
    2: stakingPublicKey,
    3: rewardAddress,
    4: nonce,
  }

  if (paymentAddress) {
    metadata[5] = paymentAddress
  }

  return {
    label: 61284, // CIP-36 DATA label
    data: metadata,
  }
}
