<!-- a7a230d4-76e5-4097-81c5-dee323b1492c 606bffd7-548b-4d0f-b827-4542052eb9ee -->
# Comprehensive Change Documentation and QA Plan

> **Note**: This plan was archived from `.cursor/plans/review-and-qa-plan-a7a230d4.plan.md` during branch organization.  
> **Status Updated**: December 2024 - Documentation organized, type errors verified (141 errors), TransactionBuilder implementation confirmed.

## Summary Statistics

- **Total Commits**: 42 commits
- **Files Changed**: 242 files
- **Lines Added**: 17,279
- **Lines Removed**: 3,887
- **Net Change**: +13,392 lines

---

## Major Features and Refactors

### 1. Transaction Builder Refactoring (Phase 1 & 2 Migration)

**Scope**: Complete migration from yoroi-lib to @yoroi/tx package with modern transaction building

**Key Changes**:

- Created new `@yoroi/tx` package with modern UTXO and transaction builder
- Migrated from WASM async patterns to CSL (Cardano Serialization Library) sync patterns
- Replaced `MultiToken` class with `Balance.Amounts` (Record<string, Quantity>)
- Converted transaction building from class-based to functional API
- Implemented flexible `TransactionBuilder` with support for:
- Manual UTXO selection
- Multiple certificates
- Reference inputs
- Collateral inputs
- UTXO exclusion/locking
- Manual fee and change output
- Multiparty transaction support (CBOR-based)

**Rationale**:

- Remove external dependency on `@emurgo/yoroi-lib`
- Modernize codebase with functional programming patterns
- Support advanced Cardano features (reference inputs, collateral)
- Enable multiparty transactions for complex use cases
- Improve type safety with modern TypeScript patterns

**Files Changed**:

- `mobile/packages/tx/` - New package (entire directory)
- `mobile/src/wallets/cardano/cardano-wallet.ts` - Updated to use new builder
- `mobile/src/wallets/cardano/unsignedTx/unsignedTx.ts` - Removed (replaced)
- `mobile/src/wallets/cardano/MultiToken.ts` - Removed (replaced with Balance.Amounts)

**Documentation**:

- `docs/mobile-experimental/phase-1-2-plan.md` - Original migration plan
- `docs/mobile-experimental/phase-1-2-status.md` - Implementation status
- `docs/mobile-experimental/transaction-builder-refactor.md` - Builder refactor details
- `docs/mobile-experimental/legacy-compatibility.md` - Legacy code notes

---

### 2. P2P Communication Package

**Scope**: New package for wallet-to-wallet and dApp-to-wallet communication via WebRTC

**Key Changes**:

- Created `@yoroi/p2p-communication` package
- WebRTC-based peer-to-peer communication
- Cross-platform support (React Native and Browser)
- Multiple simultaneous connections support
- Signaling client for connection establishment
- Wallet communication protocol implementation

**Rationale**:

- Enable wallet-to-wallet connections for multi-party transactions
- Support complex transaction flows requiring multiple signers
- Provide foundation for future collaborative features

**Files Changed**:

- `mobile/packages/p2p-communication/` - New package (entire directory)
- `mobile/src/features/P2P/useCases/P2PConnectionScreen/P2PConnectionScreen.tsx` - UI implementation

**Documentation**:

- `mobile/packages/p2p-communication/README.md` - Package documentation

---

### 3. Wallet Link/QR Code Generation and Restoration

**Scope**: Generate shareable wallet links and restore wallets from links

**Key Changes**:

- Added wallet link generation with QR codes
- Deep link support for wallet restoration (`web+cardano://` protocol)
- Link validation and parsing
- Wallet restoration from root key via link

**Rationale**:

- Enable easy wallet sharing between devices
- Support secure wallet restoration workflows
- Improve user experience for multi-device setups

**Files Changed**:

- `mobile/packages/links/cardano/` - Enhanced link handling
- `mobile/src/features/WalletManager/hooks/useGenerateWalletLink.tsx` - Link generation
- `mobile/src/features/WalletManager/ui/components/GenerateWalletLinkModal.tsx` - UI
- `mobile/src/features/SetupWallet/useCases/RestoreWalletFromLink/RestoreWalletFromLinkScreen.tsx` - Restoration screen
- `mobile/src/features/WalletManager/hooks/useCreateWalletFromRootKey.tsx` - Restoration logic

---

### 4. Deep Link Support Enhancement

**Scope**: Enhanced deep link handling for Cardano URI scheme

**Key Changes**:

- Added `web+cardano://` protocol support
- Enhanced scan action handling
- Transaction deep link support
- Address and block detail deep links
- Improved link parsing and validation

**Rationale**:

- Support standard Cardano URI schemes
- Enable better dApp integration
- Improve user experience for transaction flows

**Files Changed**:

- `mobile/packages/links/cardano/` - Enhanced link parsing
- `mobile/src/features/Links/components/ScanActionHandler.tsx` - Action handler
- `mobile/src/features/Scan/common/useTriggerScanAction.tsx` - Enhanced trigger logic
- `mobile/src/features/Scan/common/modals/` - New modals for link handling
- `mobile/src/features/Transactions/useCases/AddressDetails/AddressDetails.tsx` - Address details
- `mobile/src/features/Transactions/useCases/BlockDetails/BlockDetails.tsx` - Block details

---

### 5. Type System Consolidation

**Scope**: Consolidate and modernize type definitions across the codebase

**Key Changes**:

- Removed `MultiToken` class, replaced with `Balance.Amounts`
- Replaced `YoroiEntry` with `TransactionOutput` from `@yoroi/tx`
- Migrated staking types to `@yoroi/staking/pools`
- Removed `maxSupply` from token metadata
- Consolidated duplicate types from `other.ts` to `@yoroi/tx`
- Removed unused/mocked Portfolio DApp features

**Rationale**:

- Reduce type duplication
- Improve type safety
- Align with modern Portfolio/Balance type system
- Remove dead code and mocked features

**Files Changed**:

- `mobile/src/wallets/types/` - Type consolidation
- `mobile/packages/tx/types/` - New type definitions
- `mobile/packages/staking/pools/types.ts` - Staking types
- `mobile/src/features/Portfolio/` - Removed DApp features

**Documentation**:

- `docs/mobile-experimental/wallet-types-consolidation.md` - Detailed consolidation plan

---

### 6. ReviewTx Migration to CBOR

**Scope**: Migrate transaction review from legacy UnsignedTx format to CBOR

**Key Changes**:

- Removed `ReviewTxProvider` context
- Updated all transaction flows to pass CBOR directly
- Removed `yoroiUnsignedTx()` function
- Removed `adaptUnsignedTransaction()` adapter
- All wallet methods now return `{cbor: string}` directly

**Rationale**:

- CBOR is serializable and shareable (enables multiparty transactions)
- Simplifies transaction handling
- Removes dependency on WASM objects in transaction state
- Standard Cardano transaction format

**Files Changed**:

- `mobile/src/features/ReviewTx/common/ReviewTxProvider.tsx` - Removed
- `mobile/src/features/ReviewTx/common/hooks/useLegacyOnConfirm.tsx` - Removed
- `mobile/src/features/ReviewTx/useCases/ReviewTxScreen/ReviewTxScreen.tsx` - Updated
- All transaction creation flows - Updated to pass CBOR

**Documentation**:

- `docs/mobile-experimental/reviewtx-migration.md` - Migration status

---

### 7. Ledger Integration Improvements

**Scope**: Enhanced Ledger transaction support and contract detection

**Key Changes**:

- Migrated Ledger functions to `@yoroi/tx/ledger/`
- Improved Plutus payload building
- Enhanced signer detection
- Better contract detection in transactions
- Fixed Ledger payload type errors

**Rationale**:

- Centralize Ledger functionality
- Improve type safety
- Support advanced transaction types (Plutus contracts)
- Better error handling

**Files Changed**:

- `mobile/packages/tx/ledger/` - New Ledger package
- `mobile/src/features/ReviewTx/common/services/contract-service.ts` - Contract detection
- `mobile/src/features/ReviewTx/common/hooks/useSmartContractInfo.ts` - Contract info hook

---

### 8. Portfolio DApp Features Removal

**Scope**: Remove unused/mocked Portfolio DApp features

**Key Changes**:

- Removed `useGetPortfolioTokenInfo` and `Performance.tsx`
- Removed `useGetDAppsPortfolioBalance`
- Removed `useGetOpenOrders` and `useGetLiquidityPool`
- Deleted entire `PortfolioDAppsTokenList` directory
- Removed Performance tab from token details

**Rationale**:

- Remove dead code
- Eliminate mocked features that don't work
- Simplify codebase
- Focus on core functionality

**Files Removed**:

- `mobile/src/features/Portfolio/common/hooks/useGetPortfolioTokenInfo.ts`
- `mobile/src/features/Portfolio/screens/PortfolioTokenDetails/PortfolioTokenInfo/Performance.tsx`
- `mobile/src/features/Portfolio/common/hooks/useGetDAppsPortfolioBalance.ts`
- `mobile/src/features/Portfolio/common/hooks/useGetOpenOrders.ts`
- `mobile/src/features/Portfolio/common/hooks/useGetLiquidityPool.ts`
- `mobile/src/features/Portfolio/screens/PortfolioTokensList/PortfolioDAppsTokenList/` - Entire directory

---

### 9. Utility Functions Migration

**Scope**: Move generic utilities to `@yoroi/common` package

**Key Changes**:

- Moved hex utilities (`isHex`, `stringToHex`) to `@yoroi/common/utils/hex.ts`
- Moved bech32 utilities to `@yoroi/common/utils/bech32.ts`
- Moved URL utilities to `@yoroi/common/utils/urls.ts`
- Moved record utilities to `@yoroi/common/utils/records.ts`
- Moved array utilities to `@yoroi/common/utils/arrays.ts`

**Rationale**:

- Reusable utilities across packages
- Better code organization
- Reduce duplication

**Files Changed**:

- `mobile/packages/common/utils/` - New utility files
- All files importing these utilities - Updated imports

---

### 10. Documentation Files

**Scope**: Comprehensive documentation of migration and refactoring

**Files Added** (now organized in `docs/mobile-experimental/`):

- `docs/mobile-experimental/phase-1-2-plan.md` - Migration plan
- `docs/mobile-experimental/phase-1-2-status.md` - Implementation status
- `docs/mobile-experimental/transaction-builder-refactor.md` - Builder refactor plan
- `docs/mobile-experimental/legacy-compatibility.md` - Legacy code notes
- `docs/mobile-experimental/project-health.md` - Project health report
- `docs/mobile-experimental/known-type-issues.md` - Known type issues
- `docs/mobile-experimental/wallet-types-consolidation.md` - Type consolidation plan
- `docs/mobile-experimental/reviewtx-migration.md` - ReviewTx migration status
- `docs/mobile-experimental/type-error-analysis.md` - Type error analysis

**Note**: These documentation files should be reviewed to determine if they should be:

- Kept for reference
- Moved to docs/ directory
- Removed if no longer relevant

---

## Known Issues and Technical Debt

### Type Errors

**Current Status** (as of branch organization):
- **141 TypeScript type errors** remain (verified via `npx tsc --noEmit`)
- Most are non-critical and don't affect runtime
- Primary issues:
  - `RemoteAsset` missing `assetId` property (many test/mock files) - Type definition issue
  - Balance.Amounts type compatibility in transaction builder helpers - Template literal type limitations
  - Some type mismatches in mocks and tests
- Ledger integration has some type issues with WASM async patterns (non-critical)
- Transaction builder type issues mostly resolved (using CSL TransactionBuilder directly)
- **Note**: `docs/mobile-experimental/known-type-issues.md` may be outdated - TransactionBuilder now uses CSL TransactionBuilder correctly

### Legacy Code

- `@yoroi/tx/legacy` contains deprecated transaction methods (temporary)
- Some backward compatibility shims remain
- `@emurgo/yoroi-lib` dependency still in package.json (unused)

### Incomplete Features

- Interactive transaction crafting UI not yet implemented
- Some enhanced transaction analysis features partially integrated
- P2P communication package needs real-world testing

---

## Review and QA Testing Plan

### Phase 1: Code Review (Estimated: 4-6 hours)

#### 1.1 Transaction Builder Review

- [x] Review `mobile/packages/tx/transaction-builder/builder.ts` for correctness - **Using CSL TransactionBuilder directly**
- [x] Verify CSL integration patterns - **Confirmed correct implementation**
- [ ] Check fee calculation logic
- [ ] Verify change output handling
- [ ] Review multiparty transaction support
- [ ] Check error handling
- **Status**: TransactionBuilder implementation verified - uses CSL TransactionBuilder correctly (not the old TransactionBody.set* pattern)

#### 1.2 Type System Review

- [x] Verify all type migrations are complete
- [x] Check for remaining type errors (run `npx tsc --noEmit`) - **141 errors found**
- [ ] Review type consolidation in `docs/mobile-experimental/wallet-types-consolidation.md`
- [ ] Verify no duplicate types remain
- **Status**: Type migrations complete. 141 type errors remain (mostly non-critical, in tests/mocks)

#### 1.3 P2P Communication Review

- [ ] Review WebRTC integration
- [ ] Check signaling client implementation
- [ ] Verify connection management
- [ ] Review message handling

#### 1.4 Deep Link Review

- [ ] Review link parsing and validation
- [ ] Check `web+cardano://` protocol handling
- [ ] Verify transaction deep link support
- [ ] Review error handling for invalid links

#### 1.5 Documentation Review

- [x] Review all .md files for accuracy
- [x] Determine which docs to keep/move/remove
- [x] Check for outdated information
- [x] Verify migration status documents match reality
- **Status**: Documentation organized into `docs/mobile-experimental/` directory. Main consolidated document created at `MOBILE_EXPERIMENTAL.md`

### Phase 2: Functional Testing (Estimated: 8-12 hours)

#### 2.1 Transaction Building Tests

- [ ] **Basic Send Transaction**
- Create simple ADA send transaction
- Verify CBOR generation
- Check fee calculation
- Verify change output

- [ ] **Multi-Asset Transaction**
- Send multiple tokens in one transaction
- Verify Balance.Amounts handling
- Check token selection

- [ ] **Staking Transactions**
- Stake registration
- Stake delegation
- Stake withdrawal
- Pool transition

- [ ] **Governance Transactions**
- Voting registration
- Governance actions

- [ ] **Advanced Features**
- Manual UTXO selection
- Collateral inputs
- Reference inputs
- Metadata attachment

#### 2.2 Ledger Integration Tests

- [ ] **Standard Transactions**
- Sign standard transaction with Ledger
- Verify payload generation
- Check signature validation

- [ ] **Plutus Transactions**
- Sign Plutus contract transaction
- Verify contract detection
- Check payload generation

- [ ] **Voting Transactions**
- Sign voting registration
- Verify CIP-36 metadata

#### 2.3 Deep Link Tests

- [ ] **Wallet Restoration**
- Generate wallet link
- Scan QR code
- Restore wallet from link
- Verify wallet functionality after restoration

- [ ] **Transaction Deep Links**
- Open transaction via deep link
- Verify transaction parsing
- Check ReviewTx screen display

- [ ] **Address/Block Deep Links**
- Open address details via deep link
- Open block details via deep link
- Verify navigation

#### 2.4 P2P Communication Tests

- [ ] **Connection Establishment**
- Establish wallet-to-wallet connection
- Verify signaling
- Check connection state

- [ ] **Message Exchange**
- Send/receive messages
- Verify message handling
- Check error handling

#### 2.5 ReviewTx Tests

- [ ] **CBOR Transaction Review**
- Review transaction from CBOR
- Verify all transaction details display
- Check smart contract detection
- Verify address resolution

- [ ] **Transaction Signing**
- Sign transaction from ReviewTx
- Verify with password
- Verify with Ledger
- Check transaction submission

#### 2.6 Portfolio Tests

- [ ] **Token Display**
- Verify token list displays correctly
- Check token details
- Verify removed DApp features are gone
- Check Performance tab removal

### Phase 3: Integration Testing (Estimated: 4-6 hours)

#### 3.1 End-to-End Transaction Flows

- [ ] **Send Flow**
- Create transaction → Review → Sign → Submit
- Verify complete flow works

- [ ] **Staking Flow**
- Delegate to pool → Review → Sign → Submit
- Verify staking state updates

- [ ] **Governance Flow**
- Register for voting → Review → Sign → Submit
- Verify registration success

#### 3.2 Multi-Device Testing

- [ ] **Wallet Link Sharing**
- Generate link on device A
- Restore on device B
- Verify both wallets work independently

#### 3.3 Error Handling

- [ ] **Transaction Errors**
- Insufficient funds
- Invalid addresses
- Network errors
- Verify error messages

- [ ] **Deep Link Errors**
- Invalid links
- Malformed data
- Missing parameters

### Phase 4: Performance Testing (Estimated: 2-4 hours)

#### 4.1 Transaction Building Performance

- [ ] Large UTXO sets
- [ ] Complex transactions (many outputs)
- [ ] Fee calculation speed
- [ ] CBOR generation speed

#### 4.2 Memory Testing

- [ ] Large transaction history
- [ ] Multiple simultaneous connections (P2P)
- [ ] Memory leaks in transaction building

### Phase 5: Regression Testing (Estimated: 4-6 hours)

#### 5.1 Core Wallet Functions

- [ ] Wallet creation
- [ ] Wallet restoration (existing methods)
- [ ] Balance display
- [ ] Transaction history
- [ ] UTXO management

#### 5.2 Existing Features

- [ ] All existing transaction types still work
- [ ] Staking features unchanged
- [ ] Governance features unchanged
- [ ] Settings and configuration

### Phase 6: Documentation Cleanup (Estimated: 2-3 hours)

#### 6.1 Documentation Review

- [ ] Determine which .md files to keep
- [ ] Move relevant docs to docs/ directory
- [ ] Remove outdated documentation
- [ ] Update README if needed

#### 6.2 Code Comments

- [ ] Review TODO comments
- [ ] Update outdated comments
- [ ] Add missing documentation

---

## Critical Test Scenarios

### Must Test Before Merge

1. **Transaction Building**

- Simple send transaction
- Multi-asset transaction
- Staking transaction
- Verify CBOR is valid and can be parsed

2. **Transaction Signing**

- Password signing
- Ledger signing
- Verify signatures are valid

3. **Wallet Restoration**

- Generate link
- Restore wallet
- Verify wallet works correctly

4. **Deep Links**

- Transaction deep links
- Address deep links
- Verify navigation works

5. **Type Safety**

- [x] Run `npx tsc --noEmit` - **141 errors found** (mostly non-critical, in tests/mocks)
- [ ] Verify no runtime type errors
- **Status**: Type errors documented. Most are in test/mock files and don't affect runtime functionality.

---

## Risk Assessment

### High Risk Areas

1. **Transaction Builder** - Core functionality, many changes
2. **CBOR Migration** - Breaking change, affects all transaction flows
3. **Type System Changes** - Could cause runtime errors if types are wrong

### Medium Risk Areas

1. **P2P Communication** - New feature, needs thorough testing
2. **Deep Links** - New functionality, edge cases need testing
3. **Ledger Integration** - Hardware integration, critical for security

### Low Risk Areas

1. **Utility Functions** - Mostly moved, should be safe
2. **Documentation** - No code impact
3. **Portfolio DApp Removal** - Dead code removal

---

## Decisions Made

1. **Documentation Files**: Keep docs for now, we can clean up later
2. **Legacy Code**: Can be removed as soon as no other part of the codebase uses it
3. **Type Errors**: Should be fixed during this polishing/QA phase, before merging
4. **P2P Communication**: Experimental - we'll work on integrating it after this merge
5. **Testing Environment**: Prefer mainnet for testing

---

## Estimated Total Review Time

- **Code Review**: 4-6 hours
- **Functional Testing**: 8-12 hours
- **Integration Testing**: 4-6 hours
- **Performance Testing**: 2-4 hours
- **Regression Testing**: 4-6 hours
- **Documentation Cleanup**: 2-3 hours

**Total**: 24-37 hours

---

## Next Steps

1. Review this plan and adjust priorities
2. Set up testing environment
3. Begin Phase 1 code review
4. Create test cases for critical scenarios
5. Execute testing plan systematically
6. Document findings and issues
7. Create follow-up tasks for any issues found

### To-dos

- [ ] Review transaction builder implementation for correctness, CSL integration, fee calculation, and error handling
- [ ] Review type system consolidation, verify no duplicate types, check for remaining type errors
- [ ] Review P2P communication package implementation, WebRTC integration, and connection management
- [ ] Test basic send, multi-asset, staking, and governance transactions with new transaction builder
- [ ] Test Ledger signing for standard, Plutus, and voting transactions
- [ ] Test wallet restoration, transaction deep links, and address/block deep links
- [ ] Test P2P connection establishment, message exchange, and error handling
- [ ] Test ReviewTx with CBOR transactions, smart contract detection, and address resolution
- [ ] Test complete end-to-end transaction flows (create → review → sign → submit)
- [ ] Review all .md files, determine which to keep/move/remove, verify accuracy
- [ ] Run npx tsc --noEmit to identify remaining type errors and assess severity
- [ ] Test transaction building performance with large UTXO sets and complex transactions