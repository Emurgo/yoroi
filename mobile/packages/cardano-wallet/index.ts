// Main exports for @yoroi/cardano-wallet package

// Core wallet factory
export {makeCardanoWallet} from './cardano-wallet'

// Types
export type {YoroiWallet, WalletEvent, CardanoTypes} from './types'
export type {Device} from './types/hw'

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
  deriveRewardAddressFromAddress,
  createRawTxSigningKey,
} from './utils'
// Utils - string
export {isEmptyString} from './utils/string'
// Utils - format
export {
  formatTokenAmount,
  formatTokenWithText,
  formatDateAndTime,
  formatTokenWithSymbol,
  formatTokenInteger,
  formatTokenFractional,
  formatAdaWithText,
  formatTime,
  formatDateRelative,
  getTokenFingerprint,
  getAssetFingerprint,
} from './utils/format'
// Utils - utils (Amounts, Quantities, etc.)
export {Amounts, Quantities, asQuantity, Utxos, Entries} from './utils/utils'
// Utils - timeUtils
export {delay, formatTimeSpan} from './utils/timeUtils'
// Utils - validators
export {validatePassword, validateWalletName, getWalletNameError} from './utils/validators'
// Utils - amountUtils
export {pastedFormatter, editedFormatter} from './utils/amountUtils'

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
export {encryptWithPassword as encryptWithPasswordFromCipher} from './catalyst/catalystCipher'

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
  getHWDeviceInfo,
} from './hw/hw/hw'
export {withBLE, withUSB} from './hw/hw/hwWallet'

// CIP-30 extensions
export {cip30ExtensionMaker} from './cip30/cip30'
export {cip30LedgerExtensionMaker} from './cip30/cip30-ledger'

// CIP-95 extensions
export {cip95ExtensionMaker} from './cip95/cip95'
export type {CIP95Extension} from './cip95/cip95'

// UtxoManager
export {collateralConfig, isPureUtxo, isAmountInCollateralRange} from './utxoManager/utxos'
export {useCollateralInfo} from './utxoManager/useCollateralInfo'
export {useSetCollateralId} from './utxoManager/useSetCollateralId'

// AddressInfo
export {getSpendingKey, getAddressInfo} from './addressInfo/addressInfo'

// Common
export {convertBech32ToHex, assertHasAllSigners} from './common/signatureUtils'

// DelegationUtils
export * from './delegationUtils'

