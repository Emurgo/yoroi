import type {TransactionBuilderState} from '../transaction-builder/builder'
import type {MintAction} from './types'

/**
 * Add mint action to transaction builder
 *
 * @param state - Transaction builder state
 * @param mintAction - Mint action to add
 * @returns Updated transaction builder state
 */
export function addMint(
  state: TransactionBuilderState,
  mintAction: MintAction,
): TransactionBuilderState {
  const mints = state.options.mints || []

  // Check if policy already exists
  const existingIndex = mints.findIndex(
    (m) => m.policyId === mintAction.policyId,
  )

  if (existingIndex >= 0) {
    // Merge with existing mint action for same policy
    const existing = mints[existingIndex]!
    const updatedMints = [...mints]
    updatedMints[existingIndex] = {
      ...existing,
      assets: [...existing.assets, ...mintAction.assets],
      // Use redeemer from new action if provided, otherwise keep existing
      redeemer: mintAction.redeemer || existing.redeemer,
      // Use reference script from new action if provided, otherwise keep existing
      referenceScript: mintAction.referenceScript || existing.referenceScript,
    }

    return {
      ...state,
      options: {
        ...state.options,
        mints: updatedMints,
      },
    }
  }

  // Add new mint action
  return {
    ...state,
    options: {
      ...state.options,
      mints: [...mints, mintAction],
    },
  }
}

/**
 * Add multiple mint actions
 */
export function addMints(
  state: TransactionBuilderState,
  mintActions: MintAction[],
): TransactionBuilderState {
  let updatedState = state
  for (const mintAction of mintActions) {
    updatedState = addMint(updatedState, mintAction)
  }
  return updatedState
}

/**
 * Create mint action for a single asset
 */
export function createMintAction(
  policyId: string,
  assetName: string,
  amount: string,
  script: {type: 'native' | 'plutus'; script: string},
  redeemer?: string,
  referenceScript?: {txHash: string; txIndex: number},
): MintAction {
  return {
    policyId,
    assets: [{assetName, amount}],
    script,
    redeemer,
    referenceScript,
  }
}

/**
 * Create burn action (negative mint)
 */
export function createBurnAction(
  policyId: string,
  assetName: string,
  amount: string,
  script: {type: 'native' | 'plutus'; script: string},
  redeemer?: string,
  referenceScript?: {txHash: string; txIndex: number},
): MintAction {
  // Ensure amount is negative
  const burnAmount = amount.startsWith('-') ? amount : `-${amount}`
  return createMintAction(
    policyId,
    assetName,
    burnAmount,
    script,
    redeemer,
    referenceScript,
  )
}

/**
 * Add burn action to transaction builder
 */
export function addBurn(
  state: TransactionBuilderState,
  policyId: string,
  assetName: string,
  amount: string,
  script: {type: 'native' | 'plutus'; script: string},
  redeemer?: string,
  referenceScript?: {txHash: string; txIndex: number},
): TransactionBuilderState {
  const burnAction = createBurnAction(
    policyId,
    assetName,
    amount,
    script,
    redeemer,
    referenceScript,
  )
  return addMint(state, burnAction)
}
