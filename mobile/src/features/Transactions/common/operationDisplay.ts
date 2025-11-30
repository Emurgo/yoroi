import {isArray, isString} from '@yoroi/common'
import {isPrimaryToken} from '@yoroi/portfolio'
import {CertificateKind} from '@yoroi/tx'
import {
  Balance,
  Swap,
  TransactionDirection,
  WalletTransaction,
} from '@yoroi/types'

import BigNumber from 'bignumber.js'

import {isContractAddress} from '~/features/ReviewTx/common/services/contract-service'
import {useStrings} from '~/kernel/i18n/useStrings'
import {collateralConfig} from '~/wallets/cardano/utxoManager/utxos'
import {Amounts, Quantities, asQuantity} from '~/wallets/utils/utils'

/**
 * Extract metadata messages from transaction metadata
 */
const extractMetadataMessages = (
  metadata: WalletTransaction['metadata'] | undefined,
): string[] => {
  if (!metadata) return []

  const messages: string[] = []
  for (const item of metadata) {
    if (!item?.label) continue

    if (
      item.map_json &&
      !isArray(item.map_json) &&
      typeof item.map_json === 'object'
    ) {
      const msg = (item.map_json as Record<string, unknown>).msg
      if (isArray(msg)) {
        messages.push(...msg.map((m) => String(m).toLowerCase()))
      } else if (isString(msg)) {
        messages.push(msg.toLowerCase())
      }
    }
  }

  return messages
}

/**
 * Check if transaction metadata indicates a swap
 */
const isSwapTransaction = (
  metadata: WalletTransaction['metadata'] | undefined,
): {isSwap: boolean; isCancel: boolean} => {
  const messages = extractMetadataMessages(metadata)
  if (messages.length === 0) return {isSwap: false, isCancel: false}

  const allMessages = messages.join(' ')

  // Check for aggregator names
  const aggregatorNames = Object.values(Swap.Aggregator).map((name) =>
    String(name).toLowerCase(),
  )
  const hasAggregator = aggregatorNames.some((name) =>
    allMessages.includes(name),
  )

  // Check for swap keyword
  const hasSwap = allMessages.includes('swap')

  // Check for cancel keyword
  const hasCancel = allMessages.includes('cancel')

  return {
    isSwap: hasSwap || hasAggregator,
    isCancel: hasCancel,
  }
}

/**
 * Check if transaction uses smart contracts
 */
const hasSmartContract = (
  inputs?: WalletTransaction['inputs'],
  outputs?: WalletTransaction['outputs'],
): boolean => {
  if (!inputs && !outputs) return false

  const addresses: string[] = []
  if (inputs) {
    addresses.push(...inputs.map((input) => input.address))
  }
  if (outputs) {
    addresses.push(...outputs.map((output) => output.address))
  }

  return addresses.some((address) => isContractAddress(address))
}

/**
 * Get operation display text for transactions
 */
export const getOperationDisplayText = (
  walletTransaction: WalletTransaction | undefined,
  strings: ReturnType<typeof useStrings>,
  direction?: TransactionDirection,
  amount?: Balance.Amounts,
  metadata?: WalletTransaction['metadata'],
  inputs?: WalletTransaction['inputs'],
  outputs?: WalletTransaction['outputs'],
  delta?: Balance.Amounts,
): string | null => {
  if (!walletTransaction) {
    return null
  }

  const certificates = walletTransaction.certificates || []
  const withdrawals = walletTransaction.withdrawals || []

  // 1. Check for withdrawal (no certs, SELF direction, withdrawals present)
  // For withdrawals: input comes from wallet, output goes to wallet and is greater
  // We check if there are withdrawals and the delta (UTXO output - UTXO input) is positive
  // or if amount is empty (intra-wallet) but withdrawals exist
  if (
    certificates.length === 0 &&
    direction === 'SELF' &&
    withdrawals.length > 0
  ) {
    // Check delta (UTXO outputs - UTXO inputs) - should be positive for withdrawals
    // Or check if amount is empty (intra-wallet) which means it's a withdrawal
    const primaryTokenDelta = delta ? Amounts.getAmount(delta, '.') : null
    const hasPositiveDelta =
      primaryTokenDelta !== null && Number(primaryTokenDelta.quantity) > 0
    const isEmptyAmount = !amount || Object.keys(amount).length === 0

    // If delta is positive OR amount is empty (intra-wallet with withdrawals), it's a withdrawal
    if (hasPositiveDelta || isEmptyAmount) {
      return strings.transactions.operation.withdrawal
    }
  }

  // 1.5. Check for collateral creation (intrawallet tx with pure 5 ADA to a new UTXO)
  // Criteria:
  // - Intrawallet transaction (SELF direction)
  // - No certificates, no withdrawals
  // - At least one output has exactly 5 ADA (collateralConfig.minLovelace) and no other tokens
  // Note: We check for exactly 5 ADA output regardless of address reuse, as any output creates a new UTXO
  if (
    certificates.length === 0 &&
    withdrawals.length === 0 &&
    direction === 'SELF' &&
    inputs &&
    outputs &&
    outputs.length > 0
  ) {
    const collateralAmount = new BigNumber(collateralConfig.minLovelace)

    // Find outputs with exactly 5 ADA and no other tokens
    const collateralOutputs = outputs.filter((output) => {
      const outputAmount = new BigNumber(asQuantity(output.amount))
      const hasExactCollateralAmount = outputAmount.isEqualTo(collateralAmount)
      const hasNoOtherTokens = !output.assets || output.assets.length === 0

      return hasExactCollateralAmount && hasNoOtherTokens
    })

    // If we found at least one collateral output, it's a collateral creation transaction
    if (collateralOutputs.length > 0) {
      return strings.transactions.operation.collateralCreation
    }
  }

  // 2. Existing certificate logic (prioritize over swap/smart contract detection)
  const hasWithdrawals = withdrawals.length > 0

  // Extract certificate kinds as strings to handle all certificate types
  const certificateKinds = certificates.map((cert) => cert.kind as string)
  const hasStakeRegistration =
    certificateKinds.includes(CertificateKind.StakeRegistration) ||
    certificateKinds.includes(CertificateKind.StakeRegistrationAndDelegation) ||
    certificateKinds.includes(
      CertificateKind.StakeVoteRegistrationAndDelegation,
    )
  const hasStakeDelegation =
    certificateKinds.includes(CertificateKind.StakeDelegation) ||
    certificateKinds.includes(CertificateKind.StakeRegistrationAndDelegation) ||
    certificateKinds.includes(
      CertificateKind.StakeVoteRegistrationAndDelegation,
    )
  const hasStakeDeregistration = certificateKinds.includes(
    CertificateKind.StakeDeregistration,
  )

  // Check for VoteDelegation - includes standalone and combined types
  const hasVoteDelegation =
    certificateKinds.includes(CertificateKind.VoteDelegation) ||
    certificateKinds.includes(CertificateKind.VoteRegistrationAndDelegation) ||
    certificateKinds.includes(CertificateKind.StakeAndVoteDelegation) ||
    certificateKinds.includes(
      CertificateKind.StakeVoteRegistrationAndDelegation,
    )

  // Special combination 1: staking registration + staking delegation => "staking delegated"
  // This also handles StakeRegistrationAndDelegation certificate type
  if (hasStakeRegistration && hasStakeDelegation) {
    return strings.transactions.operation.stakingDelegated
  }

  // Special combination 2: staking registration + vote delegation => "vote delegation"
  // This also handles StakeVoteRegistrationAndDelegation and StakeAndVoteDelegation
  if (hasStakeRegistration && hasVoteDelegation) {
    return strings.transactions.operation.voteDelegation
  }

  // Special combination 3: staking deregistration + rewards withdrawn => "stake undelegation"
  if (hasStakeDeregistration && hasWithdrawals) {
    return strings.transactions.operation.stakeUndelegation
  }

  // Otherwise, return first operation found (excluding duplicates)
  const uniqueKinds = Array.from(new Set(certificateKinds))
  if (uniqueKinds.length > 0) {
    const firstKind = uniqueKinds[0]

    // Map certificate kinds to operation strings
    switch (firstKind) {
      case CertificateKind.StakeRegistration:
        return strings.transactions.operation.stakeRegistration
      case CertificateKind.StakeDeregistration:
        return strings.transactions.operation.stakeDeregistration
      case CertificateKind.StakeDelegation:
        return strings.transactions.operation.stakeDelegation
      case CertificateKind.PoolRegistration:
        return strings.transactions.operation.poolRegistration
      case CertificateKind.PoolRetirement:
        return strings.transactions.operation.poolRetirement
      case CertificateKind.MoveInstantaneousRewardsCert:
        return strings.transactions.operation.moveInstantaneousRewards
      case CertificateKind.DRepRegistration:
        return strings.transactions.operation.drepRegistration
      case CertificateKind.DRepDeregistration:
        return strings.transactions.operation.drepDeregistration
      case CertificateKind.DRepUpdate:
        return strings.transactions.operation.drepUpdate
      case CertificateKind.CommitteeHotAuth:
        return strings.transactions.operation.committeeHotAuth
      case CertificateKind.CommitteeColdResign:
        return strings.transactions.operation.committeeColdResign
      case CertificateKind.VoteDelegation:
      case CertificateKind.VoteRegistrationAndDelegation:
      case CertificateKind.StakeAndVoteDelegation:
        return strings.transactions.operation.voteDelegation
      case CertificateKind.StakeRegistrationAndDelegation:
        // This combines registration and delegation, show delegation
        return strings.transactions.operation.stakingDelegated
      case CertificateKind.StakeVoteRegistrationAndDelegation:
        // This combines registration, vote delegation, and stake delegation
        // Prefer showing vote delegation as it's more specific
        return strings.transactions.operation.voteDelegation
      case CertificateKind.GenesisKeyDelegation:
        return strings.transactions.operation.genesisKeyDelegation
    }
  }

  // 3. Check for mint/burn operations (only if no certificate matched)
  // Mint/burn transactions have:
  // - Metadata labels 721 (NFT) or 20 (FT) indicating minting metadata
  // - Delta changes for non-primary tokens (positive for mint, negative for burn)
  // We require both conditions to avoid false positives (e.g., TADA in preprod)
  const txMetadata = metadata || walletTransaction.metadata
  const hasMintingMetadata =
    txMetadata?.some((item) => item?.label === '721' || item?.label === '20') ??
    false

  if (hasMintingMetadata && delta) {
    const deltaArray = Amounts.toArray(delta)
    let hasMint = false
    let hasBurn = false

    for (const {tokenId, quantity} of deltaArray) {
      // Skip primary token (ADA) - we only care about minted/burned tokens
      if (isPrimaryToken(tokenId)) {
        continue
      }

      const qty = new BigNumber(quantity)
      if (qty.isPositive() && !Quantities.isZero(quantity)) {
        hasMint = true
      } else if (qty.isNegative()) {
        hasBurn = true
      }
    }

    // If both mint and burn, prioritize burn (more destructive operation)
    if (hasBurn) {
      return strings.transactions.operation.burn
    }
    if (hasMint) {
      return strings.transactions.operation.mint
    }
  }

  // 4. Check for swap transactions (only if no certificate matched and no mint/burn)
  const swapInfo = isSwapTransaction(metadata || walletTransaction.metadata)
  if (swapInfo.isSwap) {
    if (swapInfo.isCancel) {
      return strings.transactions.operation.swapCancel
    }

    if (direction === 'MULTI') {
      return strings.transactions.operation.swap
    }
    if (direction === 'SENT') {
      return strings.transactions.operation.swapCreated
    }
    if (direction === 'RECEIVED') {
      return strings.transactions.operation.swapResolved
    }
  }

  // 5. Check for smart contracts (only if no certificate matched, no mint/burn, and not a swap)
  if (
    !swapInfo.isSwap &&
    hasSmartContract(
      inputs || walletTransaction.inputs,
      outputs || walletTransaction.outputs,
    )
  ) {
    return strings.transactions.operation.smartContract
  }

  return null
}
