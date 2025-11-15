// @yoroi/tx - Cardano transaction building and UTXO management
export * from './errors'
export * from './ledger/adapter'
export * from './ledger/payload'
export * from './ledger/plutus'
export * from './ledger/signers'
export * from './ledger/signing'
export * from './ledger/transform'
export * from './transaction-builder/builder'
export * from './transaction-builder/helpers'
export * from './transaction-builder/multiparty'
export * from './transaction-builder/types'
export * from './types'
export * from './utils/adapters'
export * from './utils/addresses'
export * from './utils/assets'
export * from './utils/signing'
export * from './utils/transactions'
export * from './utils/utxo'
export * from './utxo'

// Export legacy types for backward compatibility
export type {SignedTx, UnsignedTx} from './types'

// ⚠️ LEGACY: Deprecated transaction building methods - REMOVED
// All transaction building now uses TransactionBuilder
// The legacy wrapper has been removed as all calls have been migrated

// Export functional transaction builder API
export {
  addCertificate,
  addCertificates,
  addCollateralInput,
  addCollateralInputs,
  addInput,
  addInputs,
  addMetadata,
  addOutput,
  addOutputs,
  addReferenceInput,
  addWithdrawal,
  buildTransaction,
  buildTransactionCBOR,
  createTransactionBuilder,
  excludeUtxo,
  excludeUtxos,
  getTransactionState,
  isTransactionReady,
  setChangeAddress,
  setChangeOutput,
  setFee,
  setTTL,
  setTTLWithBuffer,
  setValidityInterval,
} from './transaction-builder/builder'

// Export multiparty transaction utilities
export {
  addWitness,
  clearWitnesses,
  createWitnessState,
  getMissingSigners,
  getRequiredSigners,
  getRequiredSignersFromTransaction,
  getWitnesses,
  isFullySigned,
  setRequiredSigners,
} from './transaction-builder/multiparty'

export {createUtxoService, init as initUtxo} from './utxo'

// Export types
export type {
  ModernUtxo,
  Utxo,
  UtxoAtSafePoint,
  UtxoDiffToBestBlock,
} from './utxo/models'

// Export Ledger functions
export {buildLedgerPayload, buildVotingLedgerPayloadV5} from './ledger/payload'
export {createLedgerPlutusPayload} from './ledger/plutus'
export {getAllSigners} from './ledger/signers'
export {
  buildLedgerSignedTx,
  createSignedLedgerTxFromCbor,
  signRawTransaction,
} from './ledger/signing'

// Export utility functions
export {
  derivePublicByAddressing,
  normalizeToAddress,
  validateAndExtractAddressInfo,
  type AddressInfo,
} from './utils/addresses'
export {
  amountsFromCardanoValue,
  amountsFromRemote,
  AssetNameUtils,
  buildSendTokenList,
  cardanoValueFromAmounts,
  parseTokenList,
} from './utils/assets'
export {signTransaction} from './utils/signing'
export {
  calculateTxId,
  getBalanceForStakingCredentials,
  hashTransaction,
} from './utils/transactions'

// Export recipe helpers
export {
  buildRecipeTransaction,
  createCardanoHaskellConfig,
  createRecipeContext,
  type RecipeContext,
} from './transaction-builder/helpers'

// Export UTXO selection algorithms
export {
  keepRelevant,
  largestFirst,
  largestFirstMultiAsset,
  selectUtxos,
  type SelectionOptions,
  type SelectionResult,
  type SelectionStrategy,
} from './utxo-selection/selection'

// Export datum utilities
export {
  decodeDatum,
  decodeDatumToJson,
  formatDecodedDatum,
  type DecodedDatum,
} from './datum/decoding'
export {
  convertLegacyDatum,
  datumFromInfo,
  getDatumHash,
  parseDatumFromOutput,
} from './datum/parsing'
export type {
  DatumHash,
  DatumInfo,
  DatumType,
  EmbeddedDatum,
  InlineDatum,
} from './datum/types'
export {
  validateDatum,
  validateDatumHash,
  validatePlutusData,
} from './datum/validation'

// Export minting utilities
export {
  addBurn,
  addMint,
  addMints,
  createBurnAction,
  createMintAction,
} from './minting/mint'
export {calculatePolicyId, validateMintingScript} from './minting/policies'
export type {
  MintAction,
  MintAsset,
  MintingResult,
  MintingScript,
  MintingScriptType,
} from './minting/types'

// Export governance utilities
export {
  addProposal,
  createGovernanceAnchor,
  validateProposal,
} from './governance/proposals'
export type {
  GovernanceAction,
  GovernanceActionId,
  GovernanceActionType,
  GovernanceAnchor,
  Proposal,
  Vote,
  Voter,
  VoterType,
  VoteType,
  VotingProcedure,
} from './governance/types'
export {
  addVote,
  createVoter,
  createVotingProcedure,
  validateVote,
} from './governance/voting'

// Export transaction chaining utilities
export {
  addChainedInput,
  buildTransactionChain,
  createChainedTransaction,
} from './chaining/builder'
export type {
  ChainedTransaction,
  ChainedTransactionRef,
  ChainValidationResult,
  TransactionChain,
} from './chaining/types'
export {getSubmissionOrder, validateChain} from './chaining/validation'

// Export reference script utilities
export {
  calculateScriptFee,
  estimateExecutionUnits,
  type ExecutionUnits,
} from './scripts/execution-units'
export {
  addReferenceScriptUsage,
  detectReferenceScript,
  estimateReferenceScriptFee,
  findReferenceScriptByHash,
  findReferenceScripts,
} from './scripts/reference'
export type {ReferenceScript, ReferenceScriptUsage} from './scripts/types'

// Export CIP-30 validation utilities
export {
  CIP30TransactionError,
  validateTransactionCbor,
  type TransactionValidationResult,
} from './cip30/validation'
