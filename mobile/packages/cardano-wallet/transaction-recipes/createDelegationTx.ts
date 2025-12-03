import {getLogger} from '@yoroi/common'
import {
  CertificateKind,
  ModernUtxo,
  RegistrationStatus,
  addCertificate,
  addInputs,
  buildRecipeTransaction,
  createCardanoHaskellConfig,
  createTransactionBuilder,
  filterPureAdaUtxos,
  selectUtxosForAmount,
  setChangeAddress,
  setTTLWithBuffer,
} from '@yoroi/tx'
import {Address, Branded, KeyHash, Portfolio, Wallet} from '@yoroi/types'

import type {PublicKey} from '@emurgo/cross-csl-core'
import BigNumber from 'bignumber.js'

import {CardanoMobileWrapped} from './wrappedCsl'

export type CreateDelegationTxParams = {
  utxos: ModernUtxo[]
  primaryTokenId: Portfolio.Token.Id
  protocolParams: {
    coinsPerUtxoByte: string
    keyDeposit: string
    linearFee: {constant: string; coefficient: string}
    poolDeposit: string
  }
  networkId: number
  getAbsoluteSlotNumber: () => Promise<BigNumber>
  getChangeAddress: (addressMode: Wallet.AddressMode) => Address | string
  getStakingKey: () => PublicKey
  getDelegationStatus: () => {isRegistered: boolean}
  poolId: KeyHash | string | undefined
  addressMode: Wallet.AddressMode
}

export async function createDelegationTx({
  utxos,
  primaryTokenId,
  protocolParams,
  networkId,
  getAbsoluteSlotNumber,
  getChangeAddress,
  getStakingKey,
  getDelegationStatus,
  poolId,
  addressMode,
}: CreateDelegationTxParams): Promise<{cbor: string}> {
  const logger = getLogger()

  const absSlotNumber = await getAbsoluteSlotNumber()
  const changeAddressRaw = getChangeAddress(addressMode)
  const changeAddress =
    typeof changeAddressRaw === 'string'
      ? (changeAddressRaw as Address)
      : changeAddressRaw
  const registrationStatus = getDelegationStatus().isRegistered
  const stakingKey = getStakingKey()
  const delegationType = registrationStatus
    ? RegistrationStatus.DelegateOnly
    : RegistrationStatus.RegisterAndDelegate

  const protocolParamsConfig = createCardanoHaskellConfig(
    protocolParams,
    networkId,
  )

  // Extract stake credential key hash from staking key (done once outside retry loop)
  const stakeKeyHashHex = CardanoMobileWrapped.cslScope(() => {
    const keyHash = stakingKey.hash()
    return keyHash.toHex()
  })

  // Helper function to calculate required ADA based on fee estimate
  // Must account for: fee (and deposit if registering) + minimum UTXO for change output
  const calculateRequiredAda = (feeEstimate: bigint): string => {
    const minUtxoValue = BigInt(
      protocolParamsConfig.minimumUtxoVal || '1000000',
    ) // Base min UTXO (1 ADA)
    const feeBuffer = BigInt('100000') // 0.1 ADA buffer for fee estimation variance
    const baseRequired = registrationStatus
      ? feeEstimate // Delegate only: just fee
      : BigInt(protocolParams.keyDeposit) + feeEstimate // Register + delegate: deposit + fee
    return (baseRequired + minUtxoValue + feeBuffer).toString()
  }

  // Helper function to select UTXOs preferring pure ADA, smallest first
  const selectUtxosWithStrategy = (requiredAdaAmount: string): ModernUtxo[] => {
    // Use filterPureAdaUtxos from tx package
    const pureAdaUtxos = filterPureAdaUtxos(utxos, primaryTokenId)
    const utxosWithTokens = utxos.filter((utxo) => !pureAdaUtxos.includes(utxo))

    // For pure ADA UTXOs, use smallest-first to minimize change
    // Sort smallest first (ascending)
    const sortedPureAda = [...pureAdaUtxos].sort((a, b) => {
      const aAda = BigInt(a.balance[primaryTokenId] ?? Branded.ZERO_QUANTITY)
      const bAda = BigInt(b.balance[primaryTokenId] ?? Branded.ZERO_QUANTITY)
      if (aAda < bAda) return -1
      if (aAda > bAda) return 1
      return 0
    })

    const requiredAdaBigInt = BigInt(requiredAdaAmount)
    const selected: ModernUtxo[] = []
    let selectedAda = BigInt(0)

    // First, try to select from pure ADA UTXOs (smallest first)
    for (const utxo of sortedPureAda) {
      if (selectedAda >= requiredAdaBigInt) break
      selected.push(utxo)
      selectedAda += BigInt(
        utxo.balance[primaryTokenId] ?? Branded.ZERO_QUANTITY,
      )
    }

    // If we don't have enough from pure ADA UTXOs, add UTXOs with tokens
    // But account for min UTXO requirement for change outputs with tokens
    if (selectedAda < requiredAdaBigInt) {
      // When selecting UTXOs with tokens, we need to ensure:
      // 1. We have enough ADA for fees (actual fee will be higher due to tokens)
      // 2. We have enough ADA left for min UTXO in change output
      const minUtxoValueForTokens = BigInt('1000000') // 1 ADA
      const feeBuffer = BigInt('100000') // 0.1 ADA buffer for token-related fee increase
      const requiredWithBuffer =
        requiredAdaBigInt + minUtxoValueForTokens + feeBuffer

      // Use largest-first for UTXOs with tokens (to minimize number of UTXOs)
      const additionalUtxos = selectUtxosForAmount(
        utxosWithTokens,
        requiredWithBuffer.toString(),
        primaryTokenId,
      )

      selected.push(...additionalUtxos)
    }

    return selected
  }

  // Retry logic: start with conservative fee estimate, retry with higher estimates if needed
  const maxRetries = 3
  const feeMultipliers: number[] = [1.0, 1.5, 2.0] // Progressive fee increases
  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Estimate fee for delegation transaction
      // Delegation transactions are typically small (~300-400 bytes)
      // But with tokens, can be much larger
      const baseTxSize = 400 // bytes - base estimate
      const txSizeMultiplier = feeMultipliers[attempt] ?? 2.0
      const estimatedTxSize = Math.floor(baseTxSize * txSizeMultiplier)
      const estimatedFee =
        BigInt(protocolParams.linearFee.constant) +
        BigInt(protocolParams.linearFee.coefficient) * BigInt(estimatedTxSize)

      const requiredAda = calculateRequiredAda(estimatedFee)

      // Select UTXOs using strategy (prefer pure ADA, smallest first)
      const selectedUtxos = selectUtxosWithStrategy(requiredAda)

      // Build transaction using functional TransactionBuilder
      let builderState = createTransactionBuilder()

      // Add only selected UTXOs as inputs
      builderState = addInputs(builderState, selectedUtxos)

      // Add certificates based on delegation type (store as data, not CSL objects)
      if (delegationType === RegistrationStatus.RegisterAndDelegate) {
        // Register staking key first
        builderState = addCertificate(builderState, {
          kind: CertificateKind.StakeRegistration,
          stakeCredentialKeyHashHex:
            typeof stakeKeyHashHex === 'string'
              ? Branded.asKeyHash(stakeKeyHashHex)
              : stakeKeyHashHex,
        })
      }

      if (poolId) {
        // Delegate to pool
        const poolKeyHash =
          typeof poolId === 'string' ? Branded.asKeyHash(poolId) : poolId
        builderState = addCertificate(builderState, {
          kind: CertificateKind.StakeDelegation,
          stakeCredentialKeyHashHex:
            typeof stakeKeyHashHex === 'string'
              ? Branded.asKeyHash(stakeKeyHashHex)
              : stakeKeyHashHex,
          poolKeyHash,
        })
      } else {
        // Deregister (no pool means deregistration)
        builderState = addCertificate(builderState, {
          kind: CertificateKind.StakeDeregistration,
          stakeCredentialKeyHashHex:
            typeof stakeKeyHashHex === 'string'
              ? Branded.asKeyHash(stakeKeyHashHex)
              : stakeKeyHashHex,
        })
      }

      // Set change address
      builderState = setChangeAddress(builderState, changeAddress)

      // Set TTL with buffer
      builderState = setTTLWithBuffer(builderState, absSlotNumber.toNumber())

      // Build the transaction
      const result = await buildRecipeTransaction(
        builderState,
        protocolParamsConfig,
        primaryTokenId,
      )
      return result
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      const errorMessage = lastError.message

      // Check if this is the "Not enough ADA leftover" error that we can retry
      const isRetryableError =
        errorMessage.includes('Not enough ADA leftover') ||
        errorMessage.includes('add_change_if_needed')

      if (isRetryableError && attempt < maxRetries - 1) {
        getLogger().warn(
          'createDelegationTx: Retryable error, will retry with higher fee',
          {
            attempt: attempt + 1,
            maxRetries,
            error: errorMessage,
            nextFeeMultiplier: feeMultipliers[attempt + 1] ?? 2.0,
          },
        )
        // Continue to next iteration
        continue
      } else {
        // Not retryable or last attempt - log and throw
        getLogger().error('createDelegationTx: Failed to build transaction', {
          attempt: attempt + 1,
          maxRetries,
          error: errorMessage,
          errorStack: lastError.stack,
          isRetryableError,
          willRetry: isRetryableError && attempt < maxRetries - 1,
        })
        throw lastError
      }
    }
  }
  // If we get here, all retries failed
  throw (
    lastError ||
    new Error('Failed to build delegation transaction after all retries')
  )
}
