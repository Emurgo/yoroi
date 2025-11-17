# QA Change Analysis: mobile-experimental vs develop

> **Purpose**: Analysis of actual differences between final states for QA testing  
> **Branch**: `mobile-experimental` vs `develop`  
> **Method**: Final state comparison (not commit history)  
> **Total Changes**: 412 files changed

---

## New Features

### Send
- **Favorite contacts**: Added favorite contacts feature with ADA handle support
  - Shows previously used domains and own wallet handles in send screen
  - App-wide favorite contacts storage
  - Extracts ADA handles from NFT metadata
  - Custom ADA Handle icon component
  - Normalizes domains before saving to favorites
- **MAX ADA send enhancement**: Improved MAX ADA send with automatic fee subtraction
  - Automatically subtracts fees from output amount when sending MAX
  - Handles edge cases with iterative reduction
  - Accounts for minimum ADA required for change outputs with non-ADA assets

### Transactions
- **Memo feature**: Implemented memo feature for transactions
  - Memo input in ReviewTx screen (OverviewTab) for all transaction types
  - Memo display in TxDetails screen with transaction date
  - Memo input moved to footer before confirm button
  - ReviewTxMemoContext manages memo state across ReviewTx flow
- **Operation display**: Added operation display to transaction list items
  - Icons for withdrawal, swap, smart contract, and stake/delegation operations
  - Smart contract icon changed from Transaction to DigitalAsset
  - Icons for stake registration, deregistration, delegation, undelegation, and vote delegation
  - Operation-based icon selection with matching colors and styles
- **Transaction type detection**: Enhanced transaction history labels
  - Detects withdrawal transactions (no certs, SELF direction, withdrawals present)
  - Detects swap transactions from metadata (checks for 'swap', 'cancel', and aggregator names)
  - Detects smart contract transactions (checks for script addresses in inputs/outputs)
  - Prioritizes certificate logic over swap/smart contract detection
- **Collateral creation detection**: Added collateral creation transaction type detection
  - Detects intrawallet transactions with exactly 5 ADA output as collateral creation
  - Uses Lock icon for collateral creation transactions
  - Styled with same colors as Intrawallet (gray_900/gray_100)
- **Net balance calculation**: Improved transaction amount calculation
  - Calculates net change as (outputs - inputs) for all transaction types
  - Fees display correctly as negative amounts (costs) in transaction list
  - Works correctly for SENT, RECEIVED, intra-wallet, and MULTI transactions
- **Address and block details**: Added address details and block details screens
  - Deep link support for address and block detail views
  - New AddressDetails and BlockDetails components

### ReviewTx
- **Datum tab**: Added Datum tab to ReviewTx feature
  - Displays transaction datum information
  - Copiable display with improved formatting
  - Moved copiable icon to section title to prevent clipping
  - Removed numberOfLines limit from raw data
- **Governance tab**: Added Governance tab to ReviewTx feature
  - Displays governance-related transaction information
  - Shows governance operations and certificates
- **Metadata tab improvements**: Enhanced Metadata tab display
  - Truncated metadata hash to single line with middle ellipsis
  - Improved copiable display formatting

### Wallet Management
- **Share wallet**: Added share wallet functionality with disclaimer
  - Generates deeplinks for full and read-only wallet restoration
  - Security disclaimer modal using markdown files (17 languages)
  - Password modal for full wallet sharing
  - QR code and copyable link for generated wallet links
  - Handles wallet name clashes during restoration
- **Read-only wallet support**: Enhanced read-only wallet support
  - Shows Send and Swap buttons for read-only wallets (only Buy hidden)
  - Blocks read-only wallets from signing transactions at ReviewTx screen
  - Hides memo and confirm button for read-only wallets
  - Shows 'Go to transactions' button instead of confirm for read-only wallets
- **Read-only wallet restoration**: Added read-only wallet restoration screens
  - RestoreReadOnlyWalletChooseTypeScreen
  - RestoreReadOnlyWalletFromAddressesScreen
  - RestoreReadOnlyWalletFromKeyScreen
  - useRestoreAddress hook for address restoration

### Links & Deep Links
- **web+cardano:// deep links**: Implemented web+cardano:// deep link support with PIN security
  - useDeepLinkWatcher hook listens for web+cardano:// links
  - PendingScanActionContext stores actions before authentication
  - ScanActionHandler processes actions only after PIN authentication
  - Supports wallet restoration from deep links when app is closed
  - Security warning modal for wallet restoration from links
- **Wallet link restoration**: Added wallet link/QR code generation and restoration
  - Wallet link generation with QR codes
  - Deep link support for wallet restoration (web+cardano:// protocol)
  - Link validation and parsing
  - Wallet restoration from root key via link
  - RestoreWalletFromLinkScreen for restoration UI

### P2P Communication
- **P2P package**: Created new @yoroi/p2p-communication package (experimental)
  - WebRTC-based peer-to-peer communication
  - Cross-platform support (React Native and Browser)
  - Multiple simultaneous connections support
  - Signaling client for connection establishment
  - Wallet communication protocol implementation
  - P2PConnectionScreen UI implementation

### DApp Connector
- **Collateral management**: Enhanced collateral management
  - Prevents duplicate collateral reorganization transactions
  - Sets collateral ID immediately after reorganization transaction submission
  - Tracks pending collateral transactions to prevent duplicates
  - Checks for pending collateral before creating new reorganization transaction
- **Remote config**: Use remote config for dapp list instead of cloudfront
  - Cloudfront kept for logos
  - Use name if available for review created by instead of full URL

---

## Refactors & Infrastructure Changes

### Transaction Building (Core Infrastructure)
- **TransactionBuilder migration**: Complete migration from yoroi-lib to @yoroi/tx package
  - Created new @yoroi/tx package with modern UTXO and transaction builder
  - Migrated from WASM async patterns to CSL (Cardano Serialization Library) sync patterns
  - Converted from class-based to functional API using CSL directly
  - Removed deprecated yoroiUnsignedTx function and unused utilities
  - Removed legacy YoroiUnsignedTx/YoroiSignedTx types
- **CBOR migration**: Complete migration to CBOR format
  - Removed ReviewTxProvider context
  - All wallet methods now return {cbor: string} directly
  - Removed yoroiUnsignedTx() function and adaptUnsignedTransaction() adapter
  - All transaction flows pass CBOR directly
- **MultiToken replacement**: Replaced MultiToken class with Balance.Amounts
  - Uses Record<string, Quantity> instead of class
  - Better integration with Portfolio system
  - Migrated TransactionInfo to use Balance.Amounts
- **UTXO management**: Refactored to use ModernUtxo type directly
  - Removed redundant utxoId field (constructed from txHash and txIndex)
  - Migrated getAddressedUtxos() to return ModernUtxo[] with addressing
  - Refactored UTXO list to use ModernUtxo type directly
- **UTXO selection optimization**: Optimized UTXO selection in transaction recipes
  - createDelegationTx: Selects UTXOs for fees + deposit (if registering)
  - createWithdrawalTx: Selects UTXOs for fees + deposit (if deregistering)
  - createVotingRegTx: Selects UTXOs for fees only
  - createUnsignedGovernanceTx: Selects UTXOs for fees only

### Type System
- **Type consolidation**: Consolidated wallet types and migrated to @yoroi packages
  - Replaced YoroiEntry with TransactionOutput from @yoroi/tx
  - Migrated staking types to @yoroi/staking/pools
  - Removed maxSupply from token metadata
  - Consolidated duplicate types from other.ts to @yoroi/tx
- **Package organization**: Removed index.ts files and use direct imports
  - Renamed utxo-selection/index.ts to selection.ts
  - Removed re-export only index.ts files from multiple packages
  - Updated main tx/index.ts to import directly from source files

### Collateral Management
- **Unified collateral flows**: Unified collateral creation flows (settings and CIP30)
  - Uses shared helpers for collateral creation
  - Autolocks collateral after creation using transaction ID
  - Excludes collateral UTXO from transaction building and balance calculations
  - Removed collateral illustration from CollateralInfoModal, added to ManageCollateralScreen

### Code Organization
- **Logger consolidation**: Removed require statements and consolidated logger injection
  - Created shared logger utility in @yoroi/common
  - Removed all require() statements from packages
  - Removed logger injection from all package configs/types
  - Replaced all console.log/error/warn with injected logger
- **CSL memory management**: Improved cslScope memory management by passing csl parameter
- **Transaction recipes**: Abstracted transaction recipe usage with wallet helpers
- **Token activity query**: Extracted token activity query to reusable hook
- **Token ID parsing**: Refactored to use getTokenIdParts helper

### Portfolio
- **DApp features removal**: Removed unused/mocked Portfolio DApp features
  - Removed useGetPortfolioTokenInfo and Performance.tsx
  - Removed useGetDAppsPortfolioBalance
  - Removed useGetOpenOrders and useGetLiquidityPool
  - Deleted entire PortfolioDAppsTokenList directory
  - Removed Performance tab from token details

### Staking
- **PoolInfoApi migration**: Migrated PoolInfoApi to @yoroi/staking/pools
  - Moved pool-related types
  - Updated staking package exports

### Transaction Builder
- **Advanced features**: Added advanced TransactionBuilder features
  - Manual UTXO selection
  - Multiple certificates support
  - Reference inputs support
  - Collateral inputs support
  - UTXO exclusion/locking
  - Manual fee and change output
  - Multiparty transaction support (CBOR-based)
- **Helper functions**: Added helper functions for TransactionBuilder
  - Certificate helpers (stake registration, deregistration, delegation, vote delegation)
  - UTXO filter helpers (by address, min ADA, pure ADA, collateral range, sorting, selection)
  - Metadata helpers (CIP-15 and CIP-36 voting metadata)
- **Ledger integration**: Migrated Ledger functions to @yoroi/tx/ledger/
  - Improved Plutus payload building
  - Enhanced signer detection
  - Better contract detection in transactions

### Utilities
- **Common utilities**: Migrated generic utilities to @yoroi/common
  - Hex utilities (isHex, stringToHex) → @yoroi/common/utils/hex.ts
  - Bech32 utilities → @yoroi/common/utils/bech32.ts
  - URL utilities → @yoroi/common/utils/urls.ts
  - Record utilities → @yoroi/common/utils/records.ts
  - Array utilities → @yoroi/common/utils/arrays.ts

### Package Structure
- **@yoroi/tx package**: New package for transaction building
  - Modern UTXO types and transaction builder
  - CSL-based transaction building
  - Functional API design
  - CBOR serialization support
- **@yoroi/common package**: Enhanced with new utilities
  - Logger utility
  - Hex, bech32, URL, record, array utilities
- **@yoroi/p2p-communication package**: New package for P2P communication
  - WebRTC implementation
  - Connection management
  - Signaling client
- **@yoroi/staking/pools**: New staking pools package
  - PoolInfoApi migration
  - Pool-related types

---

## Testing Priorities

### High Priority
1. **Send**: MAX ADA send with automatic fee subtraction
2. **Send**: Favorite contacts with ADA handles
3. **Transactions**: Memo feature functionality
4. **Transactions**: Net balance change calculation accuracy
5. **Transactions**: Operation type detection and icons
6. **ReviewTx**: Datum and Governance tabs
7. **Wallet Management**: Share wallet and read-only wallet flows
8. **Deep Links**: web+cardano:// deep link handling with PIN security
9. **DApp Connector**: Collateral management and duplicate prevention

### Medium Priority
1. **Links**: Wallet restoration from links
2. **Staking**: Certificate creation and withdrawal flows
3. **ReviewTx**: Metadata tab improvements
4. **Transactions**: Address and block details screens
5. **Transaction Building**: CBOR-based transaction flows

### Low Priority
1. **P2P Communication**: WebRTC connection flows (experimental)
2. **Infrastructure**: Transaction builder refactoring (internal, test via transaction flows)
3. **Code Quality**: Type system consolidation (test via type safety)

---

## Notes for QA

- **Breaking Changes**: CBOR format replaces UnsignedTx object format in transaction flows
- **Experimental Features**: P2P communication is experimental and may have limited testing coverage
- **Read-only Wallets**: Enhanced support but cannot sign transactions
- **Deep Links**: Requires PIN authentication before processing actions
- **Type Errors**: All TypeScript errors have been resolved

---

## Key Differences from develop

### User-Facing Changes
- New memo feature for transactions
- Favorite contacts in send screen
- Enhanced MAX ADA send with fee handling
- Improved transaction history with operation detection
- Share wallet functionality
- Enhanced read-only wallet support
- Deep link support with PIN security
- New Datum and Governance tabs in ReviewTx

### Technical Changes
- Complete migration to @yoroi/tx package (CBOR-based)
- TransactionBuilder refactored to functional API
- MultiToken replaced with Balance.Amounts
- Enhanced UTXO management
- Improved collateral handling
- New P2P communication package (experimental)
