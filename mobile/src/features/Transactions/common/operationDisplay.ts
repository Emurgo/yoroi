import {CertificateKind} from '@yoroi/tx'

import {useStrings} from '~/kernel/i18n/useStrings'
import {WalletTransaction} from '~/wallets/types/other'

/**
 * Get operation display text for Intrawallet transactions with operations
 */
export const getOperationDisplayText = (
  walletTransaction: WalletTransaction | undefined,
  strings: ReturnType<typeof useStrings>,
): string | null => {
  if (!walletTransaction || !walletTransaction.certificates) {
    return null
  }

  const certificates = walletTransaction.certificates
  const hasWithdrawals = walletTransaction.withdrawals?.length > 0

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
  if (uniqueKinds.length === 0) {
    return null
  }

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
    default:
      return null
  }
}
