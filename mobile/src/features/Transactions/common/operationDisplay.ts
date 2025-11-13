import {useStrings} from '~/kernel/i18n/useStrings'
import {CERTIFICATE_KIND, WalletTransaction} from '~/wallets/types/other'

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
    certificateKinds.includes(CERTIFICATE_KIND.STAKE_REGISTRATION) ||
    certificateKinds.includes(
      CERTIFICATE_KIND.STAKE_REGISTRATION_AND_DELEGATION,
    ) ||
    certificateKinds.includes(
      CERTIFICATE_KIND.STAKE_VOTE_REGISTRATION_AND_DELEGATION,
    )
  const hasStakeDelegation =
    certificateKinds.includes(CERTIFICATE_KIND.STAKE_DELEGATION) ||
    certificateKinds.includes(
      CERTIFICATE_KIND.STAKE_REGISTRATION_AND_DELEGATION,
    ) ||
    certificateKinds.includes(
      CERTIFICATE_KIND.STAKE_VOTE_REGISTRATION_AND_DELEGATION,
    )
  const hasStakeDeregistration = certificateKinds.includes(
    CERTIFICATE_KIND.STAKE_DEREGISTRATION,
  )

  // Check for VoteDelegation - includes standalone and combined types
  const hasVoteDelegation =
    certificateKinds.includes(CERTIFICATE_KIND.VOTE_DELEGATION) ||
    certificateKinds.includes(
      CERTIFICATE_KIND.VOTE_REGISTRATION_AND_DELEGATION,
    ) ||
    certificateKinds.includes(CERTIFICATE_KIND.STAKE_AND_VOTE_DELEGATION) ||
    certificateKinds.includes(
      CERTIFICATE_KIND.STAKE_VOTE_REGISTRATION_AND_DELEGATION,
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
    case CERTIFICATE_KIND.STAKE_REGISTRATION:
      return strings.transactions.operation.stakeRegistration
    case CERTIFICATE_KIND.STAKE_DEREGISTRATION:
      return strings.transactions.operation.stakeDeregistration
    case CERTIFICATE_KIND.STAKE_DELEGATION:
      return strings.transactions.operation.stakeDelegation
    case CERTIFICATE_KIND.POOL_REGISTRATION:
      return strings.transactions.operation.poolRegistration
    case CERTIFICATE_KIND.POOL_RETIREMENT:
      return strings.transactions.operation.poolRetirement
    case CERTIFICATE_KIND.MOVE_INSTANTANEOUS_REWARDS:
      return strings.transactions.operation.moveInstantaneousRewards
    case CERTIFICATE_KIND.DREP_REGISTRATION:
      return strings.transactions.operation.drepRegistration
    case CERTIFICATE_KIND.DREP_DEREGISTRATION:
      return strings.transactions.operation.drepDeregistration
    case CERTIFICATE_KIND.DREP_UPDATE:
      return strings.transactions.operation.drepUpdate
    case CERTIFICATE_KIND.COMMITTEE_HOT_AUTH:
      return strings.transactions.operation.committeeHotAuth
    case CERTIFICATE_KIND.COMMITTEE_COLD_RESIGN:
      return strings.transactions.operation.committeeColdResign
    case CERTIFICATE_KIND.VOTE_DELEGATION:
    case CERTIFICATE_KIND.VOTE_REGISTRATION_AND_DELEGATION:
    case CERTIFICATE_KIND.STAKE_AND_VOTE_DELEGATION:
      return strings.transactions.operation.voteDelegation
    case CERTIFICATE_KIND.STAKE_REGISTRATION_AND_DELEGATION:
      // This combines registration and delegation, show delegation
      return strings.transactions.operation.stakingDelegated
    case CERTIFICATE_KIND.STAKE_VOTE_REGISTRATION_AND_DELEGATION:
      // This combines registration, vote delegation, and stake delegation
      // Prefer showing vote delegation as it's more specific
      return strings.transactions.operation.voteDelegation
    case CERTIFICATE_KIND.GENESIS_KEY_DELEGATION:
      return strings.transactions.operation.genesisKeyDelegation
    default:
      return null
  }
}
