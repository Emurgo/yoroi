// Helper functions for TransactionBuilder
// Utilities for creating certificates, filtering UTXOs, and handling metadata
import {getLogger} from '@yoroi/logger'
import {primaryTokenId as defaultPrimaryTokenId} from '@yoroi/portfolio'
import {
  Address,
  BalanceQuantity,
  Chain,
  DRepId,
  KeyHash,
  Lovelace,
  Portfolio,
  PublicKeyHex,
  TokenId,
  Wallet,
} from '@yoroi/types'

import type {
  Certificate,
  DRep,
  PublicKey,
  WasmModuleProxy,
} from '@emurgo/cross-csl-core'
import {Buffer} from 'buffer'

import {CardanoHaskellConfig} from '../types'
import {ModernUtxo} from '../utxo/models'
import {TransactionBuilderState, buildTransaction} from './builder'

// Cardano minimum UTXO value constant (1 ADA = 1,000,000 lovelace)
// Extracted to avoid circular dependency with @yoroi/blockchains
const MIN_UTXO_VALUE = '1000000'

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
  poolKeyHash: KeyHash | string, // Hex string
): Certificate {
  const stakingCredential = wasm.Credential.fromKeyhash(stakingKey.hash())
  const poolKeyHashStr =
    typeof poolKeyHash === 'string' ? poolKeyHash : poolKeyHash
  const poolKeyHashBytes = Buffer.from(poolKeyHashStr, 'hex')
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
  drepId: DRepId | string, // Hex string or bech32
  isCIP105: boolean = false,
): Certificate {
  const stakingCredential = wasm.Credential.fromKeyhash(stakingKey.hash())

  // Parse DRep ID (can be hex or bech32)
  const drepIdStr = typeof drepId === 'string' ? drepId : drepId
  let drep: DRep
  if (drepIdStr.startsWith('drep')) {
    // Bech32 format - need to decode
    // For now, assume hex format
    throw new Error('Bech32 DRep ID format not yet supported in helper')
  } else {
    // Hex format - assume it's a key hash
    const drepKeyHashBytes = Buffer.from(drepIdStr, 'hex')
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
  addresses: Address[],
): ModernUtxo[] {
  const addressSet = new Set(addresses)
  return utxos.filter((utxo) => addressSet.has(utxo.receiver))
}

/**
 * UTXO filter: Filter UTXOs by minimum ADA amount
 */
export function filterUtxosByMinAda(
  utxos: ModernUtxo[],
  minAda: Lovelace | string,
  primaryTokenId: TokenId = defaultPrimaryTokenId,
): ModernUtxo[] {
  const minAdaStr = typeof minAda === 'string' ? minAda : minAda
  const minAdaBigInt = BigInt(minAdaStr)
  const tokenIdStr =
    typeof primaryTokenId === 'string' ? primaryTokenId : primaryTokenId
  return utxos.filter((utxo) => {
    const adaAmount = BigInt(utxo.balance[tokenIdStr] || '0')
    return adaAmount >= minAdaBigInt
  })
}

/**
 * UTXO filter: Filter pure ADA UTXOs (no native assets)
 */
export function filterPureAdaUtxos(
  utxos: ModernUtxo[],
  primaryTokenId: TokenId = defaultPrimaryTokenId,
): ModernUtxo[] {
  const tokenIdStr =
    typeof primaryTokenId === 'string' ? primaryTokenId : primaryTokenId
  return utxos.filter((utxo) => {
    // Pure ADA means only the primary token (ADA) is present
    const keys = Object.keys(utxo.balance)
    return keys.length === 1 && keys[0] === tokenIdStr
  })
}

/**
 * UTXO filter: Filter UTXOs within collateral range
 */
export function filterCollateralUtxos(
  utxos: ModernUtxo[],
  minCollateral: Lovelace | string,
  maxCollateral: Lovelace | string,
  primaryTokenId: TokenId = defaultPrimaryTokenId,
): ModernUtxo[] {
  const minStr =
    typeof minCollateral === 'string' ? minCollateral : minCollateral
  const maxStr =
    typeof maxCollateral === 'string' ? maxCollateral : maxCollateral
  const tokenIdStr =
    typeof primaryTokenId === 'string' ? primaryTokenId : primaryTokenId
  const minBigInt = BigInt(minStr)
  const maxBigInt = BigInt(maxStr)
  return utxos.filter((utxo) => {
    const adaAmount = BigInt(utxo.balance[tokenIdStr] || '0')
    return adaAmount >= minBigInt && adaAmount <= maxBigInt
  })
}

/**
 * UTXO filter: Sort UTXOs by ADA amount (descending)
 */
export function sortUtxosByAda(
  utxos: ModernUtxo[],
  primaryTokenId: TokenId = defaultPrimaryTokenId,
): ModernUtxo[] {
  const tokenIdStr =
    typeof primaryTokenId === 'string' ? primaryTokenId : primaryTokenId
  return [...utxos].sort((a, b) => {
    const aAda = BigInt(a.balance[tokenIdStr] || '0')
    const bAda = BigInt(b.balance[tokenIdStr] || '0')
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
  targetAmount: Lovelace | string,
  primaryTokenId: TokenId = defaultPrimaryTokenId,
): ModernUtxo[] {
  const targetStr =
    typeof targetAmount === 'string' ? targetAmount : targetAmount
  const tokenIdStr =
    typeof primaryTokenId === 'string' ? primaryTokenId : primaryTokenId
  const targetBigInt = BigInt(targetStr)
  const sorted = sortUtxosByAda(utxos, primaryTokenId)
  const selected: ModernUtxo[] = []
  let total = BigInt(0)

  for (const utxo of sorted) {
    if (total >= targetBigInt) break
    selected.push(utxo)
    total += BigInt(utxo.balance[tokenIdStr] || '0')
  }

  return selected
}

/**
 * Select UTXOs to cover required amounts including tokens
 * This function selects the minimum set of UTXOs needed to cover:
 * - All required token amounts
 * - Required ADA amounts (outputs + estimated fee + minimum UTXO for change output)
 */
export function selectUtxosForAmounts(
  utxos: ModernUtxo[],
  requiredAmounts: Record<TokenId, BalanceQuantity>, // tokenId -> quantity
  primaryTokenId: TokenId = defaultPrimaryTokenId,
  estimatedFee: Lovelace | string = '200000', // Default 0.2 ADA fee estimate
): ModernUtxo[] {
  // Calculate total required ADA (outputs + fee + minimum UTXO for change output)
  // Minimum UTXO is needed because change output must meet minimum UTXO requirement
  const minUtxoValue = BigInt('1000000') // Base min UTXO (1 ADA) - standard for Cardano
  const feeBuffer = BigInt('100000') // 0.1 ADA buffer for fee estimation variance
  const feeStr = typeof estimatedFee === 'string' ? estimatedFee : estimatedFee
  const primaryTokenIdStr =
    typeof primaryTokenId === 'string' ? primaryTokenId : primaryTokenId

  // Get all required token IDs (excluding primary token)
  const requiredTokenIds = new Set(
    Object.keys(requiredAmounts).filter((id) => {
      const idStr = typeof id === 'string' ? id : id
      return idStr !== primaryTokenIdStr
    }),
  )

  // First, find UTXOs that contain required tokens (must include these)
  const utxosWithTokens: ModernUtxo[] = []
  const utxosWithoutTokens: ModernUtxo[] = []

  for (const utxo of utxos) {
    const hasRequiredToken =
      requiredTokenIds.size > 0 &&
      Object.keys(utxo.balance).some((tokenId) => requiredTokenIds.has(tokenId))

    if (hasRequiredToken) {
      utxosWithTokens.push(utxo)
    } else {
      utxosWithoutTokens.push(utxo)
    }
  }

  // Calculate what we have from UTXOs with tokens
  const selected: ModernUtxo[] = [...utxosWithTokens]
  const selectedAmounts: Record<string, bigint> = {}
  let selectedAda = BigInt(0)

  for (const utxo of selected) {
    selectedAda += BigInt(utxo.balance[primaryTokenIdStr] || '0')
    for (const [tokenId, quantity] of Object.entries(utxo.balance)) {
      selectedAmounts[tokenId] =
        (selectedAmounts[tokenId] || BigInt(0)) + BigInt(quantity)
    }
  }

  // Check if we have enough of each token
  const needsMoreTokens: TokenId[] = []

  for (const tokenId of requiredTokenIds) {
    const tokenIdStr = typeof tokenId === 'string' ? tokenId : tokenId
    const typedTokenId = tokenId as TokenId
    const requiredQty = requiredAmounts[typedTokenId]
    const required = BigInt(
      typeof requiredQty === 'string' ? requiredQty : requiredQty || '0',
    )
    const have = selectedAmounts[tokenIdStr] || BigInt(0)
    if (have < required) {
      needsMoreTokens.push(typedTokenId)
      getLogger().warn('selectUtxosForAmounts: Insufficient tokens', {
        tokenId: tokenIdStr,
        required: required.toString(),
        have: have.toString(),
      })
    }
  }

  // If we need more tokens, we can't proceed (tokens must come from UTXOs that have them)
  if (needsMoreTokens.length > 0) {
    getLogger().error('selectUtxosForAmounts: Insufficient tokens detected', {
      needsMoreTokens,
      selectedCount: selected.length,
      selectedAda: selectedAda.toString(),
    })
    // This shouldn't happen if UTXOs are selected correctly, but return what we have
    return selected
  }

  // Calculate tokens that will remain in change (tokens in selected UTXOs minus tokens being sent)
  const tokensInChange: Record<string, bigint> = {}
  for (const [tokenId, inputAmount] of Object.entries(selectedAmounts)) {
    if (tokenId === primaryTokenIdStr) continue
    const outputAmount = BigInt(requiredAmounts[tokenId as TokenId] || '0')
    const remaining = inputAmount - outputAmount
    if (remaining > BigInt(0)) {
      tokensInChange[tokenId] = remaining
    }
  }

  // Estimate minimum UTXO for change output based on token count
  // When tokens will be in change, the minimum UTXO requirement increases significantly
  // Use a conservative estimate: base minimum + additional ADA per token
  // This is a heuristic since exact calculation requires CSL
  const tokenCountInChange = Object.keys(tokensInChange).length
  let estimatedMinUtxoForChange = minUtxoValue
  if (tokenCountInChange > 0) {
    // Conservative estimate: base minimum + 0.1 ADA per token (scaled for safety)
    // Actual minimum can be higher depending on token sizes, but this provides a buffer
    const adaPerToken = BigInt('100000') // 0.1 ADA per token
    const tokenMultiplier = BigInt(Math.max(tokenCountInChange, 1))
    estimatedMinUtxoForChange =
      minUtxoValue + adaPerToken * tokenMultiplier * BigInt(2) // 2x multiplier for safety
  }

  // Calculate required ADA including proper change output minimum
  const requiredAda =
    (Object.keys(requiredAmounts) as Array<TokenId>).reduce((sum, tokenId) => {
      const tokenIdStr = typeof tokenId === 'string' ? tokenId : tokenId
      if (tokenIdStr === primaryTokenIdStr) {
        const quantity = requiredAmounts[tokenId]
        const qtyStr = typeof quantity === 'string' ? quantity : quantity
        return sum + BigInt(qtyStr || '0')
      }
      return sum
    }, BigInt(0)) +
    BigInt(feeStr) +
    estimatedMinUtxoForChange +
    feeBuffer

  // If we need more ADA, select from remaining UTXOs
  // Prefer pure ADA UTXOs when tokens will be in change to ensure enough ADA
  let needsMoreAda = selectedAda < requiredAda
  if (needsMoreAda) {
    const pureAdaUtxos = filterPureAdaUtxos(utxosWithoutTokens, primaryTokenId)
    const otherUtxos = utxosWithoutTokens.filter(
      (u) => !pureAdaUtxos.includes(u),
    )

    // When tokens will be in change, prefer pure ADA UTXOs first
    // This ensures we have enough ADA for the token-containing change output
    const sortedRemaining =
      tokenCountInChange > 0
        ? [
            ...sortUtxosByAda(pureAdaUtxos, primaryTokenId),
            ...sortUtxosByAda(otherUtxos, primaryTokenId),
          ]
        : sortUtxosByAda(utxosWithoutTokens, primaryTokenId)

    for (const utxo of sortedRemaining) {
      if (selectedAda >= requiredAda) break
      selected.push(utxo)
      selectedAda += BigInt(utxo.balance[primaryTokenIdStr] || '0')
    }
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

export function createCIP15VotingMetadata(
  votingPublicKey: PublicKeyHex | string,
  stakingPublicKey: PublicKeyHex | string,
  rewardAddress: Address | string,
  nonce: number,
): {label: number; data: unknown} {
  const votingKeyStr =
    typeof votingPublicKey === 'string' ? votingPublicKey : votingPublicKey
  const stakingKeyStr =
    typeof stakingPublicKey === 'string' ? stakingPublicKey : stakingPublicKey
  const rewardAddrStr =
    typeof rewardAddress === 'string' ? rewardAddress : rewardAddress
  return {
    label: 61284, // CIP-15 DATA label
    data: {
      1: votingKeyStr,
      2: stakingKeyStr,
      3: rewardAddrStr,
      4: nonce,
    },
  }
}

/**
 * Create CIP-36 voting metadata (new Catalyst voting format)
 */
export function createCIP36VotingMetadata(
  votingPublicKey: PublicKeyHex | string,
  stakingPublicKey: PublicKeyHex | string,
  rewardAddress: Address | string,
  nonce: number,
  paymentAddress?: Address | string,
): {label: number; data: unknown} {
  const votingKeyStr =
    typeof votingPublicKey === 'string' ? votingPublicKey : votingPublicKey
  const stakingKeyStr =
    typeof stakingPublicKey === 'string' ? stakingPublicKey : stakingPublicKey
  const rewardAddrStr =
    typeof rewardAddress === 'string' ? rewardAddress : rewardAddress
  const metadata: Record<string, unknown> = {
    1: votingKeyStr,
    2: stakingKeyStr,
    3: rewardAddrStr,
    4: nonce,
  }

  if (paymentAddress) {
    const paymentAddrStr =
      typeof paymentAddress === 'string' ? paymentAddress : paymentAddress
    metadata[5] = paymentAddrStr
  }

  return {
    label: 61284, // CIP-36 DATA label
    data: metadata,
  }
}

/**
 * Convert protocol parameters to CardanoHaskellConfig
 * This is a common pattern used across all transaction recipes
 */
export function createCardanoHaskellConfig(
  protocolParams: Pick<
    Chain.Cardano.ProtocolParams,
    'keyDeposit' | 'linearFee' | 'coinsPerUtxoByte' | 'poolDeposit'
  >,
  networkId: number,
): CardanoHaskellConfig {
  return {
    keyDeposit: protocolParams.keyDeposit,
    linearFee: protocolParams.linearFee,
    minimumUtxoVal: MIN_UTXO_VALUE,
    coinsPerUtxoByte: protocolParams.coinsPerUtxoByte,
    poolDeposit: protocolParams.poolDeposit,
    networkId,
  }
}

/**
 * Recipe context containing common setup values
 */
export type RecipeContext = {
  absSlotNumber: BigNumber
  changeAddress: string
  protocolConfig: CardanoHaskellConfig
}

/**
 * Create recipe context with common setup values
 * Handles async slot number fetching and protocol params conversion
 */
export async function createRecipeContext(params: {
  getAbsoluteSlotNumber: () => Promise<BigNumber>
  getChangeAddress: (addressMode: Wallet.AddressMode) => string
  protocolParams: Chain.Cardano.ProtocolParams
  networkId: number
  addressMode: Wallet.AddressMode
}): Promise<RecipeContext> {
  const absSlotNumber = await params.getAbsoluteSlotNumber()
  const changeAddress = params.getChangeAddress(params.addressMode)
  const protocolConfig = createCardanoHaskellConfig(
    params.protocolParams,
    params.networkId,
  )

  return {
    absSlotNumber,
    changeAddress,
    protocolConfig,
  }
}

/**
 * Build recipe transaction with consistent error handling
 * Wraps buildTransaction with proper error checking and CBOR validation
 */
export async function buildRecipeTransaction(
  builderState: TransactionBuilderState,
  protocolConfig: CardanoHaskellConfig,
  primaryTokenId: Portfolio.Token.Id,
): Promise<{cbor: string}> {
  try {
    const unsignedTx = await buildTransaction(
      builderState,
      protocolConfig,
      primaryTokenId,
    )

    if (!unsignedTx.cbor) {
      getLogger().error(
        'buildRecipeTransaction: Transaction CBOR not available',
        {
          unsignedTx: {
            inputsCount: unsignedTx.inputs.length,
            outputsCount: unsignedTx.outputs.length,
            withdrawalsCount: unsignedTx.withdrawals.length,
            certificatesCount: unsignedTx.certificates.length,
          },
        },
      )
      throw new Error('Transaction CBOR not available')
    }

    getLogger().info('buildRecipeTransaction: Transaction built successfully', {
      cborLength: unsignedTx.cbor.length,
    })

    return {cbor: unsignedTx.cbor}
  } catch (error) {
    // Check if this is an expected insufficient funds error (will be handled by caller)
    const errorMessage =
      error instanceof Error
        ? error.message.toLowerCase()
        : String(error).toLowerCase()
    const isInsufficientFundsError =
      errorMessage.includes('insufficient') ||
      errorMessage.includes('not enough') ||
      errorMessage.includes('less than') ||
      errorMessage.includes('shortage')

    const logData = {
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      builderState: {
        inputsCount: builderState.inputs.length,
        outputsCount: builderState.outputs.length,
        withdrawalsCount: builderState.withdrawals.length,
        certificatesCount: builderState.certificates.length,
        withdrawals: builderState.withdrawals,
        certificates: builderState.certificates,
      },
    }

    // Log as info for expected insufficient funds errors (caller will handle retry)
    // Log as error for unexpected failures
    if (isInsufficientFundsError) {
      getLogger().info(
        'buildRecipeTransaction: Insufficient funds (expected, caller will handle)',
        logData,
      )
    } else {
      getLogger().error(
        'buildRecipeTransaction: Failed to build transaction',
        logData,
      )
    }
    throw error
  }
}
