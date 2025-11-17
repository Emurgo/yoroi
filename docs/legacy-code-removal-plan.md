# Legacy Code Removal Plan

This document outlines the plan to finish the migration and remove all legacy code, backward compatibility shims, and deprecated APIs.

## Overview

After investigating the codebase, most migration work is complete. Remaining legacy code falls into these categories:
1. ✅ **Unused dependency** - `@emurgo/yoroi-lib` removed
2. ✅ **Legacy types** - MultiTokenValue removed, comments cleaned up
3. ✅ **Legacy SetupWallet screens** - Removed unused legacy screens
4. **Legacy voting protocol** - CIP-15 support still needed for Ledger app v5 and below
5. **Legacy storage** - Async storage compatibility layer
6. **Type migrations** - RemoteUnspentOutput, UtxoAsset (still in use)

## Legacy Code Inventory

### 1. `@emurgo/yoroi-lib` Dependency ✅ COMPLETED

**Status**: Removed

**Action Taken**: 
- Verified no direct or indirect imports
- Removed from `mobile/package.json`
- Cleaned up migration comments referencing yoroi-lib

**Files Modified**:
- `mobile/package.json`
- `mobile/packages/tx/types/index.ts`
- `mobile/packages/staking/pools/index.ts`
- `mobile/packages/staking/pools/pool-info-api.ts`

### 2. Legacy Voting Protocol (`buildVotingLedgerPayloadV5`)

**Status**: Still needed for backward compatibility

**Location**: 
- `mobile/packages/tx/ledger/payload.ts` (lines 98-184)
- `mobile/src/wallets/cardano/cardano-wallet.ts` (line 1079)

**Current Usage**: Used in `createVotingRegTx` when Ledger app version <= 5 (doesn't support CIP-36)

**Findings**:
- `MIN_ADA_APP_VERSION_SUPPORTING_CIP36 = 6` (requires Ledger app v6+)
- Code checks `doesCardanoAppVersionSupportCIP36` and falls back to CIP-15 for older devices
- This is legitimate backward compatibility for users with older Ledger firmware

**Decision**: Keep CIP-15 support for now. Consider deprecation timeline when Ledger app v5 usage drops significantly.

**Files**:
- `mobile/src/wallets/cardano/cardano-wallet.ts`
- `mobile/src/wallets/cardano/transaction-recipes/createVotingRegTx.ts`
- `mobile/packages/tx/ledger/payload.ts`
- `mobile/src/wallets/cardano/hw/hw.ts` (version check logic)

### 3. Legacy Types ✅ PARTIALLY COMPLETED

**Status**: MultiTokenValue removed, comments cleaned up

**Completed Actions**:
- Removed `MultiTokenValue` type alias from `@yoroi/tx/types/index.ts`
- Updated `CardanoTypes.MultiTokenValue` to use `Balance.Amounts` directly
- Cleaned up legacy comments in `wallets.ts`, `tx/index.ts`, `tx/types/index.ts`
- Updated adapter function comments (removed "deprecated" language)
- Clarified Utxo type comment (used for storage/API, not deprecated)

**Remaining**:
- `CardanoAddressedUtxo` still in use (legitimate type, not deprecated)
- `Utxo` type still used for storage/API (legitimate use case)

#### `RemoteUnspentOutput`

**Status**: Used in CIP-30 code

**Location**: 
- `mobile/packages/tx/types/index.ts` (lines 98-105)
- `mobile/src/wallets/cardano/cip30/cip30.ts` (multiple uses)

**Migration Path**: Replace with `ModernUtxo` type or create adapter

**Files to modify**:
- `mobile/src/wallets/cardano/cip30/cip30.ts`
- `mobile/packages/tx/types/index.ts`

#### `MultiTokenValue`

**Status**: Deprecated type alias

**Location**: 
- `mobile/packages/tx/types/index.ts` (line 129)
- `mobile/src/wallets/cardano/types.ts` (line 258)

**Migration Path**: Remove type alias, update all references to use `Balance.Amounts` directly

**Files to modify**:
- `mobile/packages/tx/types/index.ts`
- `mobile/src/wallets/cardano/types.ts`
- Search for all `MultiTokenValue` usages

#### `UtxoAsset`

**Status**: Used in `RemoteUnspentOutput`

**Location**: `mobile/packages/tx/types/index.ts` (lines 107-110)

**Migration Path**: Replace with modern asset types from `@yoroi/types`

### 4. Legacy Storage (`legacyRootStorage`)

**Status**: Used for async storage compatibility

**Location**: 
- `mobile/packages/blockchains/networks/network-manager.ts` (line 35, 63)
- `mobile/src/features/WalletManager/wallet-manager.ts` (lines 440, 625, 957)
- `mobile/src/wallets/cardano/cardano-wallet.ts` (line 166, 170)

**Migration Path**: 
- Check if all storage operations can use `rootStorage` (MMKV)
- If yes, migrate and remove `legacyRootStorage`
- If no, document why async storage is still needed

**Files to modify**:
- `mobile/packages/blockchains/networks/network-manager.ts`
- `mobile/src/features/WalletManager/wallet-manager.ts`
- `mobile/src/wallets/cardano/cardano-wallet.ts`

### 5. Legacy SetupWallet Screens ✅ COMPLETED

**Status**: Removed

**Action Taken**:
- Removed legacy screen registrations from `SetupWalletNavigator.tsx`
- Removed route definitions from `navigation/types.tsx`
- Deleted entire `mobile/src/features/SetupWallet/legacy/` directory
- Verified no navigation calls to removed routes

**Files Modified**:
- `mobile/src/features/SetupWallet/SetupWalletNavigator.tsx`
- `mobile/src/kernel/navigation/types.tsx`
- Deleted: `mobile/src/features/SetupWallet/legacy/` (4 files)

**Replacement**: Modern screens are actively used:
- `RestoreReadOnlyWalletChooseTypeScreen`
- `RestoreReadOnlyWalletFromKeyScreen`
- `RestoreReadOnlyWalletFromAddressesScreen`

### 6. Legacy Comments and Documentation

**Status**: Outdated comments referencing removed code

**Location**: 
- `mobile/src/wallets/wallets.ts` (lines 8-11)
- Various files with "LEGACY" comments

**Action**: Update or remove outdated comments

## Implementation Steps

### Phase 1: Safe Removals (No Breaking Changes)

1. **Remove `@emurgo/yoroi-lib` dependency**
   - Verify no indirect usage
   - Remove from package.json
   - Run `npm install` or `bun install`
   - Test build

2. **Remove deprecated type aliases**
   - Remove `MultiTokenValue` type alias
   - Update all references to `Balance.Amounts`
   - Remove from exports

3. **Clean up legacy comments**
   - Update `wallets.ts` comments
   - Remove outdated "LEGACY" markers

### Phase 2: Type Migrations (May Require Testing)

4. **Migrate `RemoteUnspentOutput`**
   - Create adapter function if needed
   - Update CIP-30 code to use modern types
   - Remove `RemoteUnspentOutput` type

5. **Migrate `UtxoAsset`**
   - Replace with `Balance.TokenInfo` or similar
   - Update all usages
   - Remove type definition

### Phase 3: Feature Migrations (Requires Testing)

6. **Migrate voting protocol**
   - Verify CIP-36 support in all Ledger devices
   - Update `createVotingRegTx` to always use CIP-36
   - Remove `buildVotingLedgerPayloadV5` and CIP-15 helpers
   - Test voting registration flow

7. **Migrate storage**
   - Audit all `legacyRootStorage` usage
   - Migrate to `rootStorage` where possible
   - Document any remaining async storage needs
   - Remove `legacyRootStorage` if fully migrated

8. **Review SetupWallet screens**
   - Determine if legacy screens are actually legacy
   - Migrate to new screens if replacements exist
   - Or rename directory if they're current implementation

### Phase 4: Final Cleanup

9. **Update documentation**
   - Remove legacy-compatibility.md (or update if still needed)
   - Update mobile-implementation-status.md
   - Remove outdated migration notes

10. **Final verification**
    - Run full test suite
    - Verify no broken imports
    - Check for any remaining legacy references

## Testing Requirements

For each phase:
- Build verification
- Unit tests
- Integration tests (especially for voting and storage)
- Manual testing of affected features

## Implementation Status

### ✅ Completed (Phase 1 - Safe Removals)
1. **Removed `@emurgo/yoroi-lib` dependency** - No imports found, safely removed
2. **Removed `MultiTokenValue` type alias** - Updated to use `Balance.Amounts` directly
3. **Cleaned up legacy comments** - Removed outdated migration notes and deprecated language
4. **Removed legacy SetupWallet screens** - Deleted unused `legacy/` directory and routes

### ✅ Completed (Phase 2 - Type Migrations)
5. **Migrated `RemoteUnspentOutput`** - Now uses `Balance.Amounts` instead of string amounts + `UtxoAsset[]`
6. **Migrated `UtxoAsset`** - Deprecated, replaced by `Balance.Amounts` in `RemoteUnspentOutput`
7. **Migrated `CardanoAddressedUtxo`** - Updated to use `Balance.Amounts` via `RemoteUnspentOutput`
8. **Migrated `legacyRootStorage`** - All usages migrated to global `rootStorage` with legacy paths
9. **Removed `legacyRootStorage` from NetworkManager** - No longer needed, removed from type definition

### ✅ Verified (No Changes Needed)
10. **CIP-15 voting protocol** - Correctly implemented, still needed for Ledger app v5 and below (legitimate backward compatibility)

## Risk Assessment

**Low Risk** ✅ Completed:
- Removing `@emurgo/yoroi-lib` (no imports found)
- Removing deprecated type aliases
- Cleaning up comments
- Removing unused SetupWallet screens

**Medium Risk** ✅ Completed:
- ✅ Migrating `RemoteUnspentOutput` (used in CIP-30) - Successfully migrated
- ✅ Migrating storage (affects wallet persistence) - Successfully migrated to `rootStorage`

**Low-Medium Risk** ✅ Verified:
- ✅ CIP-15 voting protocol - Correctly implemented, kept for backward compatibility (Ledger app v5)

## Notes

- **Backend API legacy references**: Keep `legacyApiBaseUrl` and `legacy` in `API_ENDPOINTS` - these refer to backend API endpoints, not code
- **Gradual migration**: Can be done incrementally, testing after each phase
- **Rollback plan**: Keep git history, can revert individual phases if issues arise

