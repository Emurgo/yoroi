import {Buffer} from 'buffer'

import type {TransactionBuilderState} from '../transaction-builder/builder'
import type {GovernanceAnchor, Proposal} from './types'

/**
 * Add governance proposal to transaction builder
 *
 * Note: Governance proposals in Cardano are typically submitted via
 * governance action transactions. This function helps build the transaction
 * structure, but the actual proposal submission may require additional
 * metadata and specific transaction formats.
 *
 * @param state - Transaction builder state
 * @param proposal - Proposal data
 * @returns Updated transaction builder state
 */
export function addProposal(
  state: TransactionBuilderState,
  proposal: Proposal,
): TransactionBuilderState {
  // Governance proposals are typically handled via:
  // 1. Metadata (governance action details)
  // 2. Specific transaction structure
  // 3. Deposit payment

  // For now, we'll add the proposal information to metadata
  // The actual governance action structure would be more complex
  // and may require CSL GovernanceAction types

  const governanceMetadata = {
    governanceAction: proposal.governanceAction,
    anchor: proposal.anchor,
    deposit: proposal.deposit,
  }

  // Add metadata with governance label (label would be determined by governance spec)
  // Note: Actual governance proposal labels are defined by CIP-1694
  return {
    ...state,
    metadata: [
      ...state.metadata,
      {
        label: 'governance_proposal', // Placeholder - actual label would be from CIP-1694
        data: governanceMetadata,
      },
    ],
  }
}

/**
 * Create governance anchor from metadata
 */
export function createGovernanceAnchor(
  url: string,
  metadata: Record<string, string | number | boolean>,
): GovernanceAnchor {
  // Hash metadata (simplified - actual implementation would use proper hashing)
  const metadataStr = JSON.stringify(metadata)
  const hash = Buffer.from(metadataStr).toString('hex').slice(0, 64) // 32 bytes = 64 hex chars

  return {
    url,
    hash,
  }
}

/**
 * Validate governance proposal
 */
export function validateProposal(proposal: Proposal): {
  valid: boolean
  error?: string
} {
  if (!proposal.governanceAction) {
    return {valid: false, error: 'Governance action is required'}
  }

  if (!proposal.anchor || !proposal.anchor.url || !proposal.anchor.hash) {
    return {valid: false, error: 'Valid anchor is required'}
  }

  if (!proposal.rewardAccount) {
    return {valid: false, error: 'Reward account is required'}
  }

  if (!proposal.deposit || BigInt(proposal.deposit) <= 0n) {
    return {valid: false, error: 'Valid deposit amount is required'}
  }

  return {valid: true}
}
