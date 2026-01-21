import {ModernUtxo} from '@yoroi/tx'
import {Balance, Portfolio, TokenId} from '@yoroi/types'

/**
 * Protocol parameters needed for UTXO calculations
 */
export type ProtocolParams = {
  coinsPerUtxoByte: string
  linearFee: {
    constant: string
    coefficient: string
  }
  minimumUtxoVal?: string
}

/**
 * Result of transfer feasibility analysis
 */
export type TransferFeasibilityResult = {
  isFeasible: boolean
  reason?: string
  requiredAda: bigint
  availableAda: bigint
  suggestions: string[]
  selectedUtxos: ModernUtxo[]
  estimatedFee: bigint
  changeOutputMinAda: bigint
  dynamicLockedAda: bigint
}

/**
 * UTXO selection strategy
 */
export type UtxoSelectionStrategy =
  | 'smart'
  | 'largestFirst'
  | 'smallestFirst'
  | 'tokenAware'

/**
 * Result of UTXO selection
 */
export type UtxoSelectionResult = {
  selectedUtxos: ModernUtxo[]
  selectionStrategy: UtxoSelectionStrategy
  totalInputAda: bigint
  totalInputTokens: Record<TokenId, bigint>
  changeOutputTokens: Record<TokenId, bigint>
  changeOutputMinAda: bigint
  warnings: string[]
}

/**
 * Consolidation plan for optimizing locked ADA
 */
export type ConsolidationPlan = {
  utxosToConsolidate: ModernUtxo[]
  targetUtxoCount: number
  estimatedSavings: bigint
  steps: string[]
}

/**
 * Result of locked ADA calculation
 */
export type LockedAdaResult = {
  currentLocked: bigint
  dynamicLocked: bigint
  optimizedLocked: bigint
  unlockedBySending: bigint
  optimizationSavings: bigint
  consolidationPlan: ConsolidationPlan | null
}

/**
 * Type of reorganization opportunity
 */
export type ReorganizationType =
  | 'consolidate_cnt'
  | 'merge_small_utxos'
  | 'split_large_utxo'

/**
 * Reorganization opportunity
 */
export type ReorganizationOpportunity = {
  type: ReorganizationType
  description: string
  utxosInvolved: ModernUtxo[]
  potentialSavings: bigint
  estimatedFee: bigint
  netBenefit: bigint
  steps: string[]
}

/**
 * Result of reorganization analysis
 */
export type ReorganizationResult = {
  opportunities: ReorganizationOpportunity[]
  totalPotentialSavings: bigint
}

/**
 * Result of CNT transfer requirements calculation
 */
export type CntTransferResult = {
  requiredAda: bigint
  automaticAdaAdded: bigint
  utxosContainingCnt: ModernUtxo[]
  willUnlockAda: bigint
  explanation: string
}

/**
 * Parameters for transfer feasibility analysis
 */
export type AnalyzeTransferFeasibilityParams = {
  utxos: ModernUtxo[]
  requiredAmounts: Balance.Amounts
  protocolParams: ProtocolParams
  primaryTokenId: Portfolio.Token.Id
  estimatedFee?: bigint
  changeAddress: string
}

/**
 * Parameters for UTXO selection
 */
export type SelectUtxosForTransferParams = {
  utxos: ModernUtxo[]
  requiredAmounts: Balance.Amounts
  protocolParams: ProtocolParams
  primaryTokenId: Portfolio.Token.Id
  strategy?: UtxoSelectionStrategy
  estimatedFee?: bigint
  changeAddress: string
}

/**
 * Parameters for locked ADA calculation
 */
export type CalculateLockedAdaParams = {
  utxos: ModernUtxo[]
  protocolParams: ProtocolParams
  tokensBeingSent?: Record<Portfolio.Token.Id, Portfolio.Token.Amount>
  primaryTokenId: Portfolio.Token.Id
}

/**
 * Parameters for reorganization analysis
 */
export type AnalyzeReorganizationParams = {
  utxos: ModernUtxo[]
  protocolParams: ProtocolParams
  primaryTokenId: Portfolio.Token.Id
  changeAddress: string
}

/**
 * Parameters for CNT transfer requirements
 */
export type CalculateCntTransferParams = {
  cntTokenId: Portfolio.Token.Id
  cntAmount: Portfolio.Token.Amount
  utxos: ModernUtxo[]
  protocolParams: ProtocolParams
  primaryTokenId: Portfolio.Token.Id
  changeAddress: string
}
