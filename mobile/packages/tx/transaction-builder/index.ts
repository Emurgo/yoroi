// Functional Transaction Builder API
export * from './builder'
export * from './types'
export * from './multiparty'
export * from './helpers'

// Re-export main functions for convenience
export {
  createTransactionBuilder,
  addInput,
  addInputs,
  removeInput,
  addOutput,
  addOutputs,
  addCertificate,
  addCertificates,
  addWithdrawal,
  addReferenceInput,
  addCollateralInput,
  addCollateralInputs,
  removeCollateralInput,
  excludeUtxo,
  excludeUtxos,
  addMetadata,
  setChangeAddress,
  setChangeOutput,
  setFee,
  setTTL,
  setTTLWithBuffer,
  setValidityInterval,
  buildTransaction,
  buildTransactionCBOR,
  isTransactionReady,
  getTransactionState,
} from './builder'
