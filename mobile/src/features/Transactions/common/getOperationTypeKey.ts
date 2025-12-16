import {
  Amounts,
  Quantities,
  asQuantity,
  collateralConfig,
} from '@yoroi/cardano-wallet'
import {isPrimaryToken} from '@yoroi/portfolio'
import {CertificateKind} from '@yoroi/tx'
import {Balance, TransactionDirection, WalletTransaction} from '@yoroi/types'

import BigNumber from 'bignumber.js'

import {isContractAddress} from '~/features/ReviewTx/common/services/contract-service'

import {isSwapTransaction} from './operationDisplay'

/**
 * Get operation type key for filtering (returns the key, not localized string)
 */
export const getOperationTypeKey = (
  walletTransaction: WalletTransaction | undefined,
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

  // 1. Check for withdrawal
  if (
    certificates.length === 0 &&
    direction === 'SELF' &&
    withdrawals.length > 0
  ) {
    const primaryTokenDelta = delta ? Amounts.getAmount(delta, '.') : null
    const hasPositiveDelta =
      primaryTokenDelta !== null && Number(primaryTokenDelta.quantity) > 0
    const isEmptyAmount = !amount || Object.keys(amount).length === 0

    if (hasPositiveDelta || isEmptyAmount) {
      return 'withdrawal'
    }
  }

  // 1.5. Check for collateral creation
  if (
    certificates.length === 0 &&
    withdrawals.length === 0 &&
    direction === 'SELF' &&
    inputs &&
    outputs &&
    outputs.length > 0
  ) {
    const collateralAmount = new BigNumber(collateralConfig.minLovelace)
    const collateralOutputs = outputs.filter((output) => {
      const outputAmount = new BigNumber(asQuantity(output.amount))
      const hasExactCollateralAmount = outputAmount.isEqualTo(collateralAmount)
      const hasNoOtherTokens = !output.assets || output.assets.length === 0
      return hasExactCollateralAmount && hasNoOtherTokens
    })

    if (collateralOutputs.length > 0) {
      return 'collateralCreation'
    }
  }

  // 2. Certificate logic
  const hasWithdrawals = withdrawals.length > 0
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
  const hasVoteDelegation =
    certificateKinds.includes(CertificateKind.VoteDelegation) ||
    certificateKinds.includes(CertificateKind.VoteRegistrationAndDelegation) ||
    certificateKinds.includes(CertificateKind.StakeAndVoteDelegation) ||
    certificateKinds.includes(
      CertificateKind.StakeVoteRegistrationAndDelegation,
    )

  // Special combinations
  if (hasStakeRegistration && hasStakeDelegation) {
    return 'stakingDelegated'
  }
  if (hasStakeRegistration && hasVoteDelegation) {
    return 'voteDelegation'
  }
  if (hasStakeDeregistration && hasWithdrawals) {
    return 'stakeUndelegation'
  }

  // Map certificate kinds to operation keys
  const uniqueKinds = Array.from(new Set(certificateKinds))
  if (uniqueKinds.length > 0) {
    const firstKind = uniqueKinds[0]
    switch (firstKind) {
      case CertificateKind.StakeRegistration:
        return 'stakeRegistration'
      case CertificateKind.StakeDeregistration:
        return 'stakeDeregistration'
      case CertificateKind.StakeDelegation:
        return 'stakeDelegation'
      case CertificateKind.PoolRegistration:
        return 'poolRegistration'
      case CertificateKind.PoolRetirement:
        return 'poolRetirement'
      case CertificateKind.MoveInstantaneousRewardsCert:
        return 'moveInstantaneousRewards'
      case CertificateKind.DRepRegistration:
        return 'drepRegistration'
      case CertificateKind.DRepDeregistration:
        return 'drepDeregistration'
      case CertificateKind.DRepUpdate:
        return 'drepUpdate'
      case CertificateKind.CommitteeHotAuth:
        return 'committeeHotAuth'
      case CertificateKind.CommitteeColdResign:
        return 'committeeColdResign'
      case CertificateKind.VoteDelegation:
      case CertificateKind.VoteRegistrationAndDelegation:
      case CertificateKind.StakeAndVoteDelegation:
        return 'voteDelegation'
      case CertificateKind.StakeRegistrationAndDelegation:
        return 'stakingDelegated'
      case CertificateKind.StakeVoteRegistrationAndDelegation:
        return 'voteDelegation'
      case CertificateKind.GenesisKeyDelegation:
        return 'genesisKeyDelegation'
    }
  }

  // 3. Check for mint/burn
  const txMetadata = metadata || walletTransaction.metadata
  const hasMintingMetadata =
    txMetadata?.some((item) => item?.label === '721' || item?.label === '20') ??
    false

  if (hasMintingMetadata && delta) {
    const deltaArray = Amounts.toArray(delta)
    let hasMint = false
    let hasBurn = false

    for (const {tokenId, quantity} of deltaArray) {
      if (isPrimaryToken(tokenId)) continue // Skip primary token
      const qty = new BigNumber(quantity)
      if (qty.isPositive() && !Quantities.isZero(quantity)) {
        hasMint = true
      } else if (qty.isNegative()) {
        hasBurn = true
      }
    }

    if (hasBurn) return 'burn'
    if (hasMint) return 'mint'
  }

  // 4. Check for swap
  const swapInfo = isSwapTransaction(metadata || walletTransaction.metadata)
  if (swapInfo.isSwap) {
    if (swapInfo.isCancel) return 'swapCancel'
    if (direction === 'MULTI') return 'swap'
    if (direction === 'SENT') return 'swapCreated'
    if (direction === 'RECEIVED') return 'swapResolved'
  }

  /*
  // 4.5. Check for NIGHT redemption transactions
  // Pattern: Smart contract interaction where NIGHT tokens are being spent/redeemed
  // NIGHT token: policyId '0691b2fecca1ac4f53cb6dfb00b7013e561d1f34403b957cbb5af1fa', name '4e49474854'
  // Redemption pattern: NIGHT tokens in inputs (being spent) + smart contract address present
  const NIGHT_POLICY_ID =
    '0691b2fecca1ac4f53cb6dfb00b7013e561d1f34403b957cbb5af1fa'
  const NIGHT_TOKEN_NAME = '4e49474854'

  const hasNightToken = (
    assets?: Array<{policyId?: string; name?: string}>,
  ) => {
    if (!assets) return false
    return assets.some(
      (asset) =>
        asset.policyId === NIGHT_POLICY_ID && asset.name === NIGHT_TOKEN_NAME,
    )
  }

  const txInputs = inputs || walletTransaction.inputs || []
  const txOutputs = outputs || walletTransaction.outputs || []

  // Check if NIGHT tokens are being spent (present in inputs)
  // This indicates redemption rather than just transfer
  const hasNightInInputs = txInputs.some((input) => hasNightToken(input.assets))

  if (hasNightInInputs) {
    // Collect all addresses involved in the transaction
    const addresses: string[] = []
    txInputs.forEach((input) => addresses.push(input.address))
    txOutputs.forEach((output) => addresses.push(output.address))
    // Also check collateral inputs if present
    if (walletTransaction.collateralInputs) {
      walletTransaction.collateralInputs.forEach((collateral) =>
        addresses.push(collateral.address),
      )
    }

    // Check if any address is a smart contract address
    // Redemption transactions involve smart contract interactions
    const hasContractAddress = addresses.some((address) =>
      isContractAddress(address),
    )

    if (hasContractAddress) {
      return 'nightRedemption'
    }
  }
*/
  // 5. Check for smart contracts
  if (
    !swapInfo.isSwap &&
    (inputs || walletTransaction.inputs) &&
    (outputs || walletTransaction.outputs)
  ) {
    const addresses: string[] = []
    if (inputs || walletTransaction.inputs) {
      addresses.push(
        ...(inputs || walletTransaction.inputs || []).map(
          (input) => input.address,
        ),
      )
    }
    if (outputs || walletTransaction.outputs) {
      addresses.push(
        ...(outputs || walletTransaction.outputs || []).map(
          (output) => output.address,
        ),
      )
    }
    if (addresses.some((address) => isContractAddress(address))) {
      return 'smartContract'
    }
  }

  return null
}
