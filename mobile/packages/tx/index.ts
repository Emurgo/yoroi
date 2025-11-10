// @yoroi/tx - Cardano transaction building and UTXO management
export * from './utxo'
export * from './transaction-builder'
export * from './types'
export * from './errors'
export * from './ledger'
export * from './utils'

// Export legacy types for backward compatibility
export type {UnsignedTx, SignedTx} from './types'

// ⚠️ LEGACY: Deprecated transaction building methods - REMOVED
// All transaction building now uses TransactionBuilder
// The legacy wrapper has been removed as all calls have been migrated

// Export functional transaction builder API
export {
  createTransactionBuilder,
  buildTransaction,
  buildTransactionCBOR,
  addInput,
  addInputs,
  addOutput,
  addOutputs,
  addCertificate,
  addCertificates,
  addWithdrawal,
  addReferenceInput,
  addCollateralInput,
  addCollateralInputs,
  excludeUtxo,
  excludeUtxos,
  addMetadata,
  setChangeAddress,
  setChangeOutput,
  setFee,
  setTTL,
  setValidityInterval,
  isTransactionReady,
  getTransactionState,
} from './transaction-builder'

// Export multiparty transaction utilities
export {
  createWitnessState,
  addWitness,
  isFullySigned,
  getMissingSigners,
  getWitnesses,
  clearWitnesses,
  setRequiredSigners,
  getRequiredSigners,
  getRequiredSignersFromTransaction,
} from './transaction-builder/multiparty'

export {UtxoService, init as initUtxo} from './utxo'

// Export types
export type {ModernUtxo, Utxo, UtxoAtSafePoint, UtxoDiffToBestBlock} from './utxo/models'

// Export Ledger functions
export {
  buildLedgerPayload,
  buildVotingLedgerPayloadV5,
} from './ledger/payload'
export {
  buildLedgerSignedTx,
  createSignedLedgerTxFromCbor,
  signRawTransaction,
} from './ledger/signing'
export {createLedgerPlutusPayload} from './ledger/plutus'
export {getAllSigners} from './ledger/signers'

// Export utility functions
export {
  normalizeToAddress,
  derivePublicByAddressing,
} from './utils/addresses'
export {
  cardanoValueFromMultiToken,
  multiTokenFromCardanoValue,
  parseTokenList,
  AssetNameUtils,
} from './utils/assets'
export {calculateTxId, hashTransaction, getBalanceForStakingCredentials} from './utils/transactions'
export {signTransaction} from './utils/signing'

