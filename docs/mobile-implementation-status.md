# Mobile Implementation Status

**Last Updated**: 2024

This document provides an accurate status of mobile implementation features based on actual codebase investigation.

## Executive Summary

The mobile codebase has undergone significant refactoring with migration to `@yoroi/tx` package and implementation of advanced transaction features. Most core features are implemented, with some enhancements still pending or partially complete.

---

## Package Status

### ✅ `@yoroi/tx` Package

**Status**: Fully implemented and integrated

**Structure**:
- `mobile/packages/tx/` - Main transaction package
  - `transaction-builder/` - Transaction builder implementation
  - `datum/` - Datum parsing and decoding
  - `governance/` - Governance proposals and votes
  - `scripts/` - Reference script detection
  - `chaining/` - Transaction chaining utilities
  - `cip30/` - CIP-30 validation
  - `minting/` - Mint/burn actions with MintAction types
  - `ledger/` - Hardware wallet integration
  - `utxo/` - UTXO service
  - `utils/` - Transaction utilities

**Key Features**:
- ✅ Functional transaction builder with immutable state
- ✅ Full WASM/CSL integration
- ✅ Multiparty transaction support (CBOR serialization)
- ✅ Modern UTXO types (`ModernUtxo` with `Balance.Amounts`)

### ✅ `@yoroi/p2p-communication` Package

**Status**: Implemented

**Location**: `mobile/packages/p2p-communication/`

**Features**:
- WebRTC-based peer-to-peer communication
- Wallet-to-wallet and dApp-to-wallet communication
- Cross-platform support (React Native and Browser)
- Multiple simultaneous connections

---

## Transaction Review Enhancements

### ✅ Datum Display & Decoding

**Status**: Fully implemented

**Implementation**:
- `DatumTab.tsx` component exists and displays decoded datums
- Uses `parseDatumFromOutput()`, `decodeDatum()`, `decodeDatumToJson()` from `@yoroi/tx`
- Shows datum type (hash/inline/embedded), hash, decoded structure, and JSON
- Integrated into `useFormattedTx` hook
- Tab appears conditionally when datums are present

**Files**:
- `mobile/src/features/ReviewTx/useCases/ReviewTxScreen/ReviewTx/Datum/DatumTab.tsx`
- `mobile/src/features/ReviewTx/common/hooks/useFormattedTx.tsx` (lines 319-347)

### ✅ Governance Actions Tab

**Status**: Fully implemented

**Implementation**:
- `GovernanceTab.tsx` component exists
- Parses governance certificates from transactions
- Displays proposals and votes
- Uses `Proposal` and `Vote` types from `@yoroi/tx`
- Tab appears conditionally when governance actions are present

**Files**:
- `mobile/src/features/ReviewTx/useCases/ReviewTxScreen/ReviewTx/Governance/GovernanceTab.tsx`
- `mobile/src/features/ReviewTx/common/hooks/useFormattedTx.tsx` (lines 685-767)

**Note**: Proposal parsing is simplified - full proposal details require metadata parsing.

### ⚠️ Enhanced Mint/Burn Display

**Status**: Partially implemented

**Current State**:
- `MintTab.tsx` displays mint/burn actions
- Shows mint vs burn (positive/negative amounts)
- Displays policy IDs
- Visual indicators for mint vs burn

**Missing**:
- Does not use `MintAction` types from `@yoroi/tx/minting/types.ts`
- Does not display script type (native/plutus)
- Does not show minting script details
- Does not show script hash

**Files**:
- `mobile/src/features/ReviewTx/useCases/ReviewTxScreen/ReviewTx/Mint/MintTab.tsx`
- `mobile/packages/tx/minting/types.ts` (MintAction type exists but not used in UI)

### ✅ Reference Script Details

**Status**: Fully implemented

**Implementation**:
- Reference script detection in `useFormattedTx` hook
- `ReferenceInputsTab.tsx` displays reference scripts
- Shows script type (native/plutus), hash, and size
- Uses `detectReferenceScript()` from `@yoroi/tx/scripts/reference.ts`

**Files**:
- `mobile/src/features/ReviewTx/useCases/ReviewTxScreen/ReviewTx/ReferenceInputs/ReferenceInputs.tsx`
- `mobile/src/features/ReviewTx/common/hooks/useFormattedTx.tsx` (lines 349-391)
- `mobile/packages/tx/scripts/reference.ts`

**Missing**:
- Estimated script fees (`estimateReferenceScriptFee()` exists but not displayed)
- Policy ID display when script is used for minting

### ✅ CIP-30 Validation Warnings

**Status**: Fully implemented

**Implementation**:
- `validateTransactionCbor()` from `@yoroi/tx/cip30/validation.ts` is used
- Validation runs in `ReviewTxScreen.tsx` before displaying review
- Validation errors and warnings displayed in `OverviewTab.tsx`
- Uses `CIP30TransactionError` for error handling

**Files**:
- `mobile/src/features/ReviewTx/useCases/ReviewTxScreen/ReviewTxScreen.tsx` (lines 130-141)
- `mobile/src/features/ReviewTx/useCases/ReviewTxScreen/ReviewTx/Overview/OverviewTab.tsx` (lines 177-213)
- `mobile/packages/tx/cip30/validation.ts`
- `mobile/src/wallets/cardano/cip30/cip30.ts` (lines 262-276)

### ⚠️ Transaction Chaining Visualization

**Status**: Partially implemented

**Current State**:
- `chainInfo` type exists in `FormattedTx`
- `detectChaining()` function exists in `useFormattedTx.tsx`
- UI displays chain info in `OverviewTab.tsx` when `chainInfo.isChained` is true

**Missing**:
- Actual chaining detection logic is placeholder (lines 772-813 in `useFormattedTx.tsx`)
- Does not use `validateChain()` or `getSubmissionOrder()` from `@yoroi/tx/chaining/`
- Detection always returns `{isChained: false}`

**Files**:
- `mobile/src/features/ReviewTx/common/hooks/useFormattedTx.tsx` (lines 772-813)
- `mobile/src/features/ReviewTx/common/types.ts` (lines 88-92)
- `mobile/packages/tx/chaining/validation.ts` (exists but not used)

### ✅ Smart Contract Interaction Detection

**Status**: Fully implemented

**Implementation**:
- Detects contract interactions in `OverviewTab.tsx`
- Shows interactions based on datums and reference scripts
- Displays informational banner with interaction summary

**Files**:
- `mobile/src/features/ReviewTx/useCases/ReviewTxScreen/ReviewTx/Overview/OverviewTab.tsx` (lines 130-163, 230-239)

---

## Migration Status

### ✅ Phase 1: Migration to `@yoroi/tx` Package

**Status**: Complete

**Completed**:
- ✅ Package structure created (`mobile/packages/tx/`)
- ✅ Ledger integration functions migrated
- ✅ Cardano-specific utilities migrated
- ✅ UTXO service migrated (`UtxoService` class)
- ✅ Modern UTXO types (`ModernUtxo` with `Balance.Amounts`)
- ✅ Generic utilities moved to `@yoroi/common`
- ✅ PoolInfoApi moved to `@yoroi/staking/pools/`
- ✅ Imports migrated from `@emurgo/yoroi-lib` (no remaining imports found)

**Legacy Code**:
- Legacy transaction building methods still exist for backward compatibility
- Will be removed in future cleanup

### ✅ Phase 2: Modern UTXO Management & Flexible Transaction Builder

**Status**: Complete

**Completed**:
- ✅ `TransactionBuilder` class with flexible API
- ✅ Full WASM integration
- ✅ Fee calculation with iterative change recalculation
- ✅ Multiparty transaction support (CBOR serialization/deserialization)
- ✅ `WitnessManager` for managing signatures
- ✅ Reference inputs support
- ✅ Collateral inputs support
- ✅ Metadata support
- ✅ Withdrawals support
- ✅ UTXO exclusion/locking

**Files**:
- `mobile/packages/tx/transaction-builder/builder.ts`
- `mobile/packages/tx/transaction-builder/multiparty.ts`
- `mobile/packages/tx/transaction-builder/witness-manager.ts`

---

## Feature Implementation Status

### ✅ Reference Scripts (CIP-33)

**Status**: Detection implemented, optimization pending

**Implemented**:
- ✅ `detectReferenceScript()` function
- ✅ `findReferenceScripts()` utility
- ✅ Reference script display in transaction review
- ✅ Script type detection (native/plutus)
- ✅ Script hash calculation

**Pending**:
- ⚠️ Automatic reference script optimization in transaction building
- ⚠️ Reference script fee calculation display

### ✅ Governance Features

**Status**: Basic implementation complete

**Implemented**:
- ✅ `addProposal()` function
- ✅ `addVote()` function
- ✅ `createVoter()` helper
- ✅ Governance tab in transaction review
- ✅ Vote delegation certificate parsing

**Pending**:
- ⚠️ Full proposal metadata parsing
- ⚠️ Governance action ID extraction from metadata
- ⚠️ Governance dashboard UI

### ✅ Datum Parsing & Decoding

**Status**: Fully implemented

**Implemented**:
- ✅ `parseDatumFromOutput()` - Parse datum from transaction output
- ✅ `decodeDatum()` - Decode datum to structured format
- ✅ `decodeDatumToJson()` - Decode datum to JSON
- ✅ `formatDecodedDatum()` - Format decoded datum for display
- ✅ Full datum display in transaction review

**Files**:
- `mobile/packages/tx/datum/parsing.ts`
- `mobile/packages/tx/datum/decoding.ts`

### ❌ Script Evaluation (Phase 2 - Backend Dependent)

**Status**: Not implemented (requires backend)

**Note**: Script evaluation requires backend API changes. See `backend-requirements-phase-2.md` for specifications.

**Pending**:
- Backend endpoint for script evaluation
- Automatic execution unit calculation
- Accurate fee estimation for Plutus transactions

### ✅ Transaction Chaining Utilities

**Status**: Utilities exist, integration incomplete

**Implemented**:
- ✅ `validateChain()` function
- ✅ Chain validation types (`ChainValidationResult`, `TransactionChain`)
- ✅ Circular dependency detection

**Missing**:
- ⚠️ Integration with transaction review
- ⚠️ Actual chaining detection (currently placeholder)
- ⚠️ Submission order calculation

**Files**:
- `mobile/packages/tx/chaining/validation.ts`

### ✅ CIP-30 Improvements

**Status**: Implemented

**Implemented**:
- ✅ `validateTransactionCbor()` - Transaction validation
- ✅ `CIP30TransactionError` - Enhanced error handling
- ✅ Validation warnings in transaction review
- ✅ Message signing support (`signData()`)
- ✅ Hardware wallet support for CIP-30

**Files**:
- `mobile/packages/tx/cip30/validation.ts`
- `mobile/src/wallets/cardano/cip30/cip30.ts`
- `mobile/src/wallets/cardano/cip30/cip30-ledger.ts`

---

## Known Issues & Limitations

### 1. Transaction Chaining Detection

**Issue**: Chaining detection is placeholder implementation
- `detectChaining()` always returns `{isChained: false}`
- Does not actually check for unconfirmed transaction references
- Requires mempool or transaction chain state to function properly

**Location**: `mobile/src/features/ReviewTx/common/hooks/useFormattedTx.tsx` (lines 772-813)

### 2. Mint Tab Enhancement

**Issue**: MintTab does not use `MintAction` types
- Currently displays basic mint/burn information
- Does not show script details or use structured `MintAction` types from `@yoroi/tx`

**Location**: `mobile/src/features/ReviewTx/useCases/ReviewTxScreen/ReviewTx/Mint/MintTab.tsx`

### 3. Governance Proposal Parsing

**Issue**: Proposal parsing is simplified
- Only parses vote delegation certificates
- Full proposal details require metadata parsing
- Governance action IDs not extracted

**Location**: `mobile/src/features/ReviewTx/common/hooks/useFormattedTx.tsx` (lines 685-767)

### 4. Reference Script Fee Display

**Issue**: Reference script fees not displayed
- `estimateReferenceScriptFee()` exists in `@yoroi/tx/scripts/reference.ts` but not used in UI
- Users cannot see script fee breakdown
- Function provides local estimation (Phase 1), accurate calculation requires backend (Phase 2)

### 5. ReviewTx Migration Status

**Issue**: Some transaction flows still use old pattern
- DApp Connector and Swap flows use CBOR directly ✅
- Send, Staking, Catalyst, Pool Transition, Governance flows still use `unsignedTxChanged()` pattern
- Wallet methods return `{cbor: string}` but callers don't always pass it to ReviewTx

**Location**: See `docs/mobile-experimental/reviewtx-migration.md` for details

**Impact**: Low - functionality works, but inconsistent patterns exist

### 6. Legacy Code Status

**Issue**: Some legacy code still exists for backward compatibility
- `@yoroi/tx/legacy` contains deprecated methods that import from `@emurgo/yoroi-lib`
- `createYoroiLib` wrapper removed ✅
- Legacy UTXO types (`BigNumber`-based) still exist alongside `ModernUtxo`
- `buildVotingLedgerPayloadV5` kept for older Ledger app compatibility

**Location**: See `docs/mobile-experimental/legacy-compatibility.md` for details

**Impact**: Low - legacy code is marked and will be removed in future cleanup

---

## Next Steps & Priorities

### High Priority

1. **Complete Transaction Chaining Detection**
   - Implement actual chaining detection logic
   - Integrate `validateChain()` and `getSubmissionOrder()` from `@yoroi/tx/chaining/`
   - Add mempool/chain state checking

2. **Enhance Mint Tab**
   - Migrate `MintTab.tsx` to use `MintAction` types
   - Display script type and script hash
   - Show minting script details

3. **Complete Governance Proposal Parsing**
   - Extract governance action IDs from metadata
   - Parse full proposal details
   - Display proposal parameters

### Medium Priority

4. **Reference Script Fee Display**
   - Integrate `estimateReferenceScriptFee()` into UI
   - Show script fee breakdown in reference inputs tab
   - Function exists at `@yoroi/tx/scripts/reference.ts` (lines 125-157)

5. **Complete ReviewTx Migration**
   - Migrate remaining flows (Send, Staking, Catalyst, etc.) to CBOR pattern
   - Remove `ReviewTxProvider` context once all flows migrated
   - See `docs/mobile-experimental/reviewtx-migration.md` for migration path

6. **Script Evaluation Integration** (Phase 2 - Backend Dependent)
   - Implement backend API integration
   - Add execution unit calculation
   - Display accurate script fees

### Low Priority

7. **Legacy Code Cleanup**
   - Remove `@yoroi/tx/legacy` wrapper once all code migrates to TransactionBuilder
   - Remove `@emurgo/yoroi-lib` dependency from package.json
   - Clean up legacy UTXO types (BigNumber-based)
   - Remove `buildVotingLedgerPayloadV5` after Ledger app update period
   - See `docs/mobile-experimental/legacy-compatibility.md` for details

---

## Documentation Files Status

### Files Removed (Outdated - Consolidated Here)

- ✅ `docs/review-tx-enhancement-plan.md` - Information consolidated here
- ✅ `docs/yoroi-enhancement-plan.md` - Information consolidated here
- ✅ `docs/mobile-experimental/phase-1-2-status.md` - Information consolidated here
- ✅ `docs/mobile-experimental/review-and-qa-plan-a7a230d4.plan.md` - Information consolidated here
- ✅ `docs/mobile-experimental/transaction-builder-refactor.md` - Refactor complete
- ✅ `docs/mobile-experimental/phase-1-2-plan.md` - Planning complete
- ✅ `docs/mobile-experimental/known-type-issues.md` - Issues resolved
- ✅ `docs/mobile-experimental/project-health.md` - Status consolidated here
- ✅ `docs/mobile-experimental/qa-plan.md` - QA complete
- ✅ `docs/mobile-experimental/qa-change-analysis.md` - Analysis complete
- ✅ `docs/mobile-experimental/type-error-analysis.md` - Analysis complete
- ✅ `docs/mobile-experimental/wallet-types-consolidation.md` - Planning document

### Files Kept (Reference)

- `docs/backend-requirements-phase-2.md` - Still relevant for Phase 2 backend work
- `docs/mobile-experimental/legacy-compatibility.md` - Reference for legacy code status
- `docs/mobile-experimental/reviewtx-migration.md` - Reference for migration details

---

## Summary Statistics

### Completed Features
- ✅ Datum display and decoding
- ✅ Governance tab
- ✅ Reference script detection and display
- ✅ CIP-30 validation
- ✅ Smart contract interaction detection
- ✅ Transaction builder refactoring
- ✅ P2P communication package
- ✅ Migration to `@yoroi/tx` package

### Partially Completed Features
- ⚠️ Mint/burn display (needs MintAction type integration)
- ⚠️ Transaction chaining (detection logic incomplete)
- ⚠️ Governance proposal parsing (simplified implementation)

### Not Started (Backend Dependent)
- ❌ Script evaluation
- ❌ Automatic execution unit calculation

---

## Conclusion

The mobile codebase has successfully migrated to `@yoroi/tx` package and implemented most advanced transaction features. Core functionality is complete, with some enhancements pending integration or backend support. The codebase is in a good state with clear next steps for remaining work.

