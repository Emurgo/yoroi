// Main exports for @yoroi/cardano-wallet package

// Core wallet factory
export {makeCardanoWallet} from './cardano-wallet'

// Types
export type {YoroiWallet, WalletEvent, CardanoTypes} from './types'

// Dependencies
export type {CardanoWalletDependencies, WalletEncryptedStorage} from './dependencies'

// Key manager
export {keyManager, deriveAccountFromRootKey} from './key-manager/key-manager'

// Account manager
export {deriveAddressFromXPub} from './account-manager/derive-address-from-xpub'
export type {AddressChain} from './account-manager/account-manager'
export type {ReadOnlyAddressChain} from './account-manager/read-only-account-manager'

// Utils
export {
  deriveRewardAddressHex,
  isByron,
  isShelley,
} from './utils'
export * from './utils'

// Mnemonic
export {getMasterKeyFromMnemonic, generateAdaMnemonic, generateWalletRootKey} from './mnemonic/mnemonic'

// Transaction recipes
export {
  createVotingRegTxFromWallet,
  convertRawUtxosToModernUtxos,
} from './transaction-recipes'
export * from './transaction-recipes'

// Catalyst
export {
  generatePrivateKeyForCatalyst,
  encryptWithPassword,
} from './catalyst'

// Wrapped CSL
export {CardanoMobileWrapped} from './wrappedCsl'

// Operations
export * from './operations'

// API
export * from './api'

// Errors
export * from './errors'

// Hardware wallet
export {
  HARDWARE_WALLETS,
  useLedgerPermissions,
  BaseLedgerError,
  RejectedByUserError,
  BluetoothDisabledError,
} from './hw/hw/hw'
export {withBLE, withUSB} from './hw/hw/hwWallet'

