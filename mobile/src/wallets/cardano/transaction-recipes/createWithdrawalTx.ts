import type {AccountStateResponse} from '@yoroi/api'
import {getLogger, isHex} from '@yoroi/common'
import {
  CertificateKind,
  ModernUtxo,
  addCertificate,
  addInputs,
  addWithdrawal,
  buildRecipeTransaction,
  createCardanoHaskellConfig,
  createTransactionBuilder,
  filterPureAdaUtxos,
  selectUtxosForAmount,
  setChangeAddress,
  setTTLWithBuffer,
} from '@yoroi/tx'
import {Portfolio, Wallet} from '@yoroi/types'

import type {PublicKey} from '@emurgo/cross-csl-core'
import BigNumber from 'bignumber.js'

import {CardanoMobileWrapped} from '~/wallets/cardano/wrappedCsl'

export type CreateWithdrawalTxParams = {
  utxos: ModernUtxo[]
  rewardAddressHex: string
  primaryTokenId: Portfolio.Token.Id
  protocolParams: {
    coinsPerUtxoByte: string
    keyDeposit: string
    linearFee: {constant: string; coefficient: string}
    poolDeposit: string
  }
  networkId: number
  getAbsoluteSlotNumber: () => Promise<BigNumber>
  getChangeAddress: (addressMode: Wallet.AddressMode) => string
  getStakingKey: () => PublicKey
  getAccountState: (addresses: string[]) => Promise<AccountStateResponse>
  shouldDeregister: boolean
  addressMode: Wallet.AddressMode
}

export async function createWithdrawalTx({
  utxos,
  rewardAddressHex,
  primaryTokenId,
  protocolParams,
  networkId,
  getAbsoluteSlotNumber,
  getChangeAddress,
  getStakingKey,
  getAccountState,
  shouldDeregister,
  addressMode,
}: CreateWithdrawalTxParams): Promise<{cbor: string}> {
  const logger = getLogger()

  const absSlotNumber = await getAbsoluteSlotNumber()
  const changeAddress = getChangeAddress(addressMode)
  const accountState = await getAccountState([rewardAddressHex])

  const protocolParamsConfig = createCardanoHaskellConfig(
    protocolParams,
    networkId,
  )

  // Get withdrawal amount from account state
  // The API might return the address in a different format (bech32 vs hex),
  // so we iterate over all keys to find the matching account state
  // Use remainingAmount (available rewards) instead of rewards (total ever earned)
  let rewards = '0'
  for (const address in accountState) {
    const state = accountState[address]
    if (state) {
      rewards = state.remainingAmount || '0'
      break // Use first non-null account state (we only requested one address)
    }
  }

  // Extract stake credential key hash - needed for certificate (Conway requirement)
  // If we have rewards, extract from reward address; if deregistering without rewards, extract from staking key
  // This is done once outside the retry loop since it doesn't depend on UTXO selection
  let stakeCredentialKeyHashHex: string | undefined
  let rewardAddressBech32: string | undefined

  if (BigInt(rewards) > 0n) {
    // Convert reward address to bech32 and extract stake credential
    const result = CardanoMobileWrapped.cslScope((csl) => {
      let address
      if (csl.ByronAddress.isValid(rewardAddressHex)) {
        const byronAddr = csl.ByronAddress.fromBase58(rewardAddressHex)
        address = byronAddr.toAddress()
      } else {
        const isHexAddr = isHex(rewardAddressHex)
        address = isHexAddr
          ? csl.Address.fromHex(rewardAddressHex)
          : csl.Address.fromBech32(rewardAddressHex)
      }
      if (!address || address.isMalformed()) {
        throw new Error(`Invalid reward address: ${rewardAddressHex}`)
      }

      const rewardAddr = csl.RewardAddress.fromAddress(address)
      if (!rewardAddr) {
        throw new Error(
          `Failed to create RewardAddress from address: ${rewardAddressHex}`,
        )
      }
      const stakeCred = rewardAddr.paymentCred()
      if (!stakeCred) {
        throw new Error(
          `Failed to extract stake credential from reward address: ${rewardAddressHex}`,
        )
      }

      const bech32 = address.toBech32(undefined)
      if (!bech32) {
        throw new Error(
          `Failed to convert reward address to bech32: ${rewardAddressHex}`,
        )
      }

      const keyHash = stakeCred.toKeyhash()
      if (!keyHash) {
        throw new Error(
          `Reward address stake credential is not a key hash: ${rewardAddressHex}`,
        )
      }

      return {
        rewardAddressBech32: bech32,
        stakeCredentialKeyHashHex: keyHash.toHex(),
      }
    })
    rewardAddressBech32 = result.rewardAddressBech32
    stakeCredentialKeyHashHex = result.stakeCredentialKeyHashHex
  } else if (shouldDeregister) {
    // No rewards but deregistering - extract from staking key
    stakeCredentialKeyHashHex = CardanoMobileWrapped.cslScope(() => {
      const keyHash = getStakingKey().hash()
      return keyHash.toHex()
    })
  }

  // Helper function to calculate required ADA based on fee estimate
  // Must account for: fee (and deposit if deregistering) + minimum UTXO for change output
  const calculateRequiredAda = (feeEstimate: bigint): string => {
    const minUtxoValue = BigInt(
      protocolParamsConfig.minimumUtxoVal || '1000000',
    ) // Base min UTXO (1 ADA)
    const feeBuffer = BigInt('100000') // 0.1 ADA buffer for fee estimation variance
    const requiresDeregistration = shouldDeregister
    const baseRequired = requiresDeregistration
      ? BigInt(protocolParams.keyDeposit) + feeEstimate
      : feeEstimate
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
      const aAda = BigInt(a.balance[primaryTokenId] || '0')
      const bAda = BigInt(b.balance[primaryTokenId] || '0')
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
      selectedAda += BigInt(utxo.balance[primaryTokenId] || '0')
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
      // Estimate fee for withdrawal transaction
      // Withdrawal transactions are typically small (~300-500 bytes)
      // But with tokens, can be much larger
      const baseTxSize = 500 // bytes - base estimate
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

      // Add withdrawal if we have rewards
      if (rewardAddressBech32) {
        builderState = addWithdrawal(builderState, rewardAddressBech32, rewards)

        // Only add certificate when explicitly deregistering (matches yoroi-lib behavior)
        // Normal withdrawals don't require certificates
        if (shouldDeregister) {
          if (!stakeCredentialKeyHashHex) {
            throw new Error(
              'Cannot create withdrawal transaction: failed to extract stake credential from reward address',
            )
          }
          builderState = addCertificate(builderState, {
            kind: CertificateKind.StakeDeregistration,
            stakeCredentialKeyHashHex,
          })
        }
      } else if (shouldDeregister && stakeCredentialKeyHashHex) {
        // No rewards but deregistering - add deregistration certificate
        builderState = addCertificate(builderState, {
          kind: CertificateKind.StakeDeregistration,
          stakeCredentialKeyHashHex,
        })
      }

      // Set change address and TTL
      builderState = setChangeAddress(builderState, changeAddress)
      builderState = setTTLWithBuffer(builderState, absSlotNumber.toNumber())

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
        logger.warn(
          'createWithdrawalTx: Retryable error, will retry with higher fee',
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
        logger.error('createWithdrawalTx: Failed to build transaction', {
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
    new Error('Failed to build withdrawal transaction after all retries')
  )
}
