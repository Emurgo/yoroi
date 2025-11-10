// @yoroi/tx - Cardano transaction building and UTXO management
export * from './utxo'
export * from './transaction-builder'
export * from './types'
export * from './errors'
export * from './ledger'
export * from './utils'

// ⚠️ LEGACY: Deprecated transaction building methods (will be removed in Phase 2)
// Use TransactionBuilder instead for new code
export {
  createUnsignedTx,
  createUnsignedDelegationTx,
  createUnsignedWithdrawalTx,
  createUnsignedVotingTx,
} from './legacy'

// Export main classes
export {TransactionBuilder} from './transaction-builder'
export {UtxoService, init as initUtxo} from './utxo'
export {WitnessManager, getRequiredSigners} from './transaction-builder/multiparty'

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

