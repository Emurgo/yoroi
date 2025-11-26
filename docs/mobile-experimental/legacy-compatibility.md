# Legacy and Backward Compatibility Notes

This document flags all legacy code, backward compatibility shims, and deprecated APIs in the `@yoroi/tx` package migration.

## 🔴 Legacy/Deprecated APIs

### 1. **Old Transaction Building Methods** ✅ REMOVED
**Location**: ~~Still in `@emurgo/yoroi-lib`~~ (dependency removed)

**Status**: ✅ **COMPLETED**: 
- `@emurgo/yoroi-lib` dependency has been removed from `package.json`
- No `Cardano.createUnsignedTx()` calls found in codebase
- All transaction building now uses `TransactionBuilder` from `@yoroi/tx`
- Migration complete - no legacy transaction building methods remain

### 2. **createYoroiLib Wrapper** ✅ REMOVED
**Location**: ~~`mobile/src/wallets/wallets.ts`~~

**Status**: ✅ **COMPLETED**: 
- No `createYoroiLib` wrapper exists
- `wallets.ts` only exports `CardanoMobile` (direct WASM access)
- All code uses `@yoroi/tx` imports directly
- No legacy `Cardano.*` API wrapper remains

### 3. **UtxoModels Namespace** ✅ REMOVED
**Location**: ~~`mobile/src/wallets/cardano/utxoManager/utxoManager.ts`~~

**Status**: ✅ **COMPLETED**: 
- No `UtxoModels` namespace exists
- Code imports types directly from `@yoroi/tx`
- No backward compatibility shim remains

### 4. **Legacy UTXO Types** ✅ MIGRATED
**Location**: `@yoroi/tx/types/index.ts`

**Status**: ✅ **COMPLETED**
- ✅ `MultiTokenValue` - **UPDATED**: Now aliases to `Balance.Amounts`
- ✅ `RemoteUnspentOutput` - **MIGRATED**: Now uses `Balance.Amounts` instead of `amount: string` + `UtxoAsset[]`
- ⚠️ `UtxoAsset` - **DEPRECATED**: Still exists for backward compatibility but no longer used

**Migration Status**: 
- ✅ `RemoteUnspentOutput` now uses `balance: Balance.Amounts` (modern format)
- ✅ All conversion functions updated (`rawUtxoToRemoteUnspentOutput`, `cardanoUtxoFromRemoteFormat`)
- ✅ All creation sites updated (`getAddressedUtxos`, `signatureUtils.ts`)
- ✅ `CardanoAddressedUtxo` automatically uses modern format via `RemoteUnspentOutput`
- ✅ `UtxoAsset` marked as deprecated but kept for type compatibility

**Modern Alternative**: Use `ModernUtxo` type from `@yoroi/tx/utxo/models.ts` which uses `Balance.Amounts`.

### 5. **buildVotingLedgerPayloadV5** (Legacy Voting Protocol)
**Location**: `@yoroi/tx/ledger/payload.ts`

**Status**: ⚠️ **LEGACY BUT REQUIRED**: This function uses CIP-15 (older voting protocol). New code should use `buildLedgerPayload()` with CIP-36 metadata.

**Note**: Kept for backward compatibility with Ledger app versions <= 5. This is legitimate backward compatibility, not deprecated code. `MIN_ADA_APP_VERSION_SUPPORTING_CIP36 = 6` requires Ledger app v6+.

### 6. **legacyRootStorage** ✅ MIGRATED
**Location**: ~~`mobile/packages/blockchains/networks/network-manager.ts`~~ (removed)

**Status**: ✅ **MIGRATED**: 
- All usages migrated to global `rootStorage.join('legacy/${network}/v1/')`
- Removed from `NetworkManager` type definition
- Removed from `network-manager.ts` creation

**Migration Details**:
- `wallet-manager.ts` now uses `rootStorage` directly
- `cardano-wallet.ts` now uses `rootStorage` directly
- Storage paths maintained for backward compatibility: `/legacy/${network}/v1/${id}/`

## 🟡 Partial/Incomplete Implementations

### 1. **TransactionBuilder** ✅ FULLY FUNCTIONAL
**Location**: `@yoroi/tx/transaction-builder/builder.ts`

**Status**: ✅ **COMPLETE**: TransactionBuilder is fully functional and actively used throughout the codebase:
- `buildTransaction()` is implemented and working
- CBOR serialization is complete
- All transaction recipes use TransactionBuilder successfully
- Minor TODOs remain for future enhancements (reference inputs, validity intervals) but core functionality is complete

### 2. **buildLedgerSignedTx Auxiliary Data**
**Location**: `@yoroi/tx/ledger/signing.ts`

**Status**: ⚠️ **MINOR TODO**: The `useCIP36` parameter has a TODO comment but CIP-36 support is implemented via `buildLedgerPayload()`. This is a minor enhancement opportunity, not a blocker.

### 3. **Enhanced Transaction Analysis Integration**
**Location**: `mobile/src/features/ReviewTx/common/hooks/useFormattedTx.tsx`

**Status**: ✅ **COMPLETE**: `useFormattedTx` hook is fully implemented and integrated with transaction review UI. All transaction types are supported.

## 🟢 Migration Status

### Fully Migrated (No Legacy Code)
- ✅ `normalizeToAddress()` - Fully migrated, no legacy code
- ✅ `parseTokenList()` - Fully migrated, no legacy code
- ✅ `AssetNameUtils` - Fully migrated, no legacy code
- ✅ `createSignedLedgerTxFromCbor()` - Fully migrated
- ✅ `signRawTransaction()` - Fully migrated
- ✅ `createLedgerPlutusPayload()` - Fully migrated to `@yoroi/tx/ledger/plutus.ts`
- ✅ `getAllSigners()` - Fully migrated to `@yoroi/tx/ledger/signers.ts`
- ✅ `PoolInfoApi` - Fully migrated to `@yoroi/staking`
- ✅ Error types - Fully migrated (`NotEnoughMoneyToSendError`, `NoOutputsError`)

### Removed from Mobile App
- ✅ `createYoroiLib()` - **REMOVED**: The wrapper has been completely removed from `wallets.ts`. All `Cardano.*` method calls have been replaced with direct `@yoroi/tx` imports.
- ✅ `Cardano.Wasm.*` - **REPLACED**: Now using `CardanoMobile.*` directly for WASM access.

### Legacy Wrapper ✅ REMOVED
- ✅ `@yoroi/tx/legacy` - **REMOVED**: This directory never existed. The `@emurgo/yoroi-lib` dependency has been removed from `package.json`.
  - All transaction building code uses `TransactionBuilder` directly
  - No legacy wrapper remains

## 📝 Notes for Developers

1. **When adding new code**: Use `@yoroi/tx` directly ✅ (legacy wrappers removed)
2. **When refactoring**: Use direct type imports ✅ (UtxoModels namespace removed)
3. **For new UTXO code**: Use `ModernUtxo` type instead of legacy types (where possible)
4. **For transaction building**: Use `TransactionBuilder` ✅ (migration complete)
5. **For Ledger signing**: Use `buildLedgerPayload()` for CIP-36, `buildVotingLedgerPayloadV5()` only for Ledger app v5 and below

## 🔄 Migration Timeline

- **Phase 1 (Completed)**: ✅ Migration complete, legacy wrappers removed
- **Phase 2 (Completed)**: ✅ `TransactionBuilder` implementation complete, old methods removed
- **Phase 3 (Remaining)**: Migrate `RemoteUnspentOutput`/`UtxoAsset` types (pending CIP-30 migration)

## ✅ Completed Migrations

- ✅ Removed `@emurgo/yoroi-lib` dependency
- ✅ Removed `createYoroiLib` wrapper
- ✅ Removed `UtxoModels` namespace
- ✅ Updated `MultiTokenValue` to use `Balance.Amounts`
- ✅ All transaction building uses `TransactionBuilder`
- ✅ No legacy transaction building methods remain

## ⚠️ Remaining Items

- `UtxoAsset` type (deprecated but kept for type compatibility, no longer used)
- `buildVotingLedgerPayloadV5` (required for Ledger app v5 compatibility - correctly implemented)

