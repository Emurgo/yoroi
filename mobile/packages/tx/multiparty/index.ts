/**
 * Multiparty transaction utilities
 * Functions for building and signing transactions with multiple wallets
 */

// Export transaction JSON utilities (non-async, work with JSON)
export {
  addWalletSignatureToTransactionJSON,
  constructMultipartyTransactionJSON,
  getSignedWallets as getSignedWalletsJSON,
  isFullySigned as isFullySignedJSON,
  isSignedByWallet as isSignedByWalletJSON,
  parseMultipartyTransactionJSON,
  type MultipartySigner,
  type MultipartyTransactionJSON,
} from './multiparty-transaction-json'

// Export transaction builder
export * from './multiparty-tx-builder'

// Export transaction signer (async, work with CBOR)
export {
  getSignedWallets,
  isFullySigned,
  isSignedByWallet,
  signMultipartyTransaction,
} from './multiparty-tx-signer'
