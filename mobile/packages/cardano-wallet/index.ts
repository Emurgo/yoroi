// Main exports for @yoroi/cardano-wallet package

// Core wallet factory
export {makeCardanoWallet} from './cardano-wallet'

// Types
export type {CardanoTypes, WalletEvent, YoroiWallet} from './types'
export type {Device} from './types/hw'

// Dependencies
export type {
  CardanoWalletDependencies,
  WalletEncryptedStorage,
} from './dependencies'

// Key manager
export {deriveAccountFromRootKey, keyManager} from './key-manager/key-manager'

// Account manager
export type {AddressChain} from './account-manager/account-manager'
export {deriveAddressFromXPub} from './account-manager/derive-address-from-xpub'
export type {ReadOnlyAddressChain} from './account-manager/read-only-account-manager'

// Utils
export {
  createRawTxSigningKey,
  deriveRewardAddressFromAddress,
  deriveRewardAddressHex,
  isByron,
  isShelley,
} from './utils'
// Utils - string
export {isEmptyString} from './utils/string'
// Utils - format
export {
  formatAdaWithText,
  formatDateAndTime,
  formatDateRelative,
  formatTime,
  formatTokenAmount,
  formatTokenFractional,
  formatTokenInteger,
  formatTokenWithSymbol,
  formatTokenWithText,
  getAssetFingerprint,
  getTokenFingerprint,
} from './utils/format'
// Utils - utils (Amounts, Quantities, etc.)
export {Amounts, asQuantity, Entries, Quantities, Utxos} from './utils/utils'
// Utils - timeUtils
export {delay, formatTimeSpan} from './utils/timeUtils'
// Utils - validators
export {
  getWalletNameError,
  validatePassword,
  validateWalletName,
} from './utils/validators'
// Utils - amountUtils
export {editedFormatter, pastedFormatter} from './utils/amountUtils'

// Mnemonic
export {
  generateAdaMnemonic,
  generateWalletRootKey,
  getMasterKeyFromMnemonic,
} from './mnemonic/mnemonic'

// Transaction recipes
export * from './transaction-recipes'
export {
  convertRawUtxosToModernUtxos,
  createVotingRegTxFromWallet,
} from './transaction-recipes'

// Catalyst
export {encryptWithPassword, generatePrivateKeyForCatalyst} from './catalyst'
export {encryptWithPassword as encryptWithPasswordFromCipher} from './catalyst/catalystCipher'

// Wrapped CSL
export {CardanoMobile, CardanoMobileWrapped} from './wrappedCsl'

// Operations
export * from './operations'

// API
export * from './api'

// Errors
export * from './errors'

// Hardware wallet
export {getHWDeviceInfo} from './hw/hw'
export {
  AdaAppClosedError,
  BaseLedgerError,
  BluetoothDisabledError,
  DeprecatedAdaAppError,
  GeneralConnectionError,
  HARDWARE_WALLETS,
  LedgerUserError,
  RejectedByUserError,
  useLedgerPermissions,
} from './hw/hw/hw'
export {withBLE, withUSB} from './hw/hw/hwWallet'

// CIP-30 extensions
export {cip30ExtensionMaker} from './cip30/cip30'
export {cip30LedgerExtensionMaker} from './cip30/cip30-ledger'

// CIP-95 extensions
export {cip95ExtensionMaker, supportsCIP95} from './cip95/cip95'
export type {CIP95Extension} from './cip95/cip95'

// UtxoManager
export {useCollateralInfo} from './utxoManager/useCollateralInfo'
export {useSetCollateralId} from './utxoManager/useSetCollateralId'
export {
  collateralConfig,
  isAmountInCollateralRange,
  isPureUtxo,
  utxosMaker,
} from './utxoManager/utxos'

// AddressInfo
export {
  getSpendingKey,
  getStakingKey,
  toWasmAddress,
} from './addressInfo/addressInfo'

// Common
export {
  assertHasAllSigners,
  convertBech32ToHex,
  getTransactionSigners,
} from './common/signatureUtils'

// DelegationUtils
export * from './delegationUtils'
