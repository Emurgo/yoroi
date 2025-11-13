# Legacy and Backward Compatibility Notes

This document flags all legacy code, backward compatibility shims, and deprecated APIs in the `@yoroi/tx` package migration.

## 🔴 Legacy/Deprecated APIs

### 1. **Old Transaction Building Methods** (Phase 2 Replacement Planned)
**Location**: Still in `@emurgo/yoroi-lib` (not yet migrated)
- `Cardano.createUnsignedTx()` - **DEPRECATED**: Will be replaced by `TransactionBuilder` in Phase 2
- `Cardano.createUnsignedDelegationTx()` - **DEPRECATED**: Will be replaced by `TransactionBuilder.addCertificate()`
- `Cardano.createUnsignedWithdrawalTx()` - **DEPRECATED**: Will be replaced by `TransactionBuilder.addWithdrawal()`
- `Cardano.createUnsignedVotingTx()` - **DEPRECATED**: Will be replaced by `TransactionBuilder` with metadata

**Status**: These are kept for backward compatibility during migration but will be removed in Phase 2.

### 2. **createYoroiLib Wrapper** (Legacy Initialization)
**Location**: `mobile/src/wallets/wallets.ts`
```typescript
export const Cardano = createYoroiLib(CardanoMobile)
```

**Status**: ⚠️ **LEGACY**: This is a wrapper around the old yoroi-lib API. It's kept for backward compatibility but should be replaced with direct `@yoroi/tx` imports.

**Migration Path**: Replace direct `Cardano.*` calls with `@yoroi/tx` imports.

### 3. **UtxoModels Namespace** (Backward Compatibility Shim)
**Location**: `mobile/src/wallets/cardano/utxoManager/utxoManager.ts`
```typescript
// Legacy UtxoModels namespace for backward compatibility
const UtxoModels = {
  Utxo,
  UtxoAtSafePoint,
  UtxoDiffToBestBlock,
} as const
```

**Status**: ⚠️ **BACKWARD COMPATIBILITY SHIM**: This maintains the old `UtxoModels.*` namespace pattern for existing code. Should be removed once all code uses direct imports.

### 4. **Legacy UTXO Types** (BigNumber-based)
**Location**: `@yoroi/tx/types/index.ts`

**Status**: ⚠️ **LEGACY**: These types use `BigNumber` for amounts:
- `MultiTokenValue` - Uses `BigNumber` instead of `Balance.Amounts`
- `RemoteUnspentOutput` - Uses string amounts instead of `Balance.Amounts`
- `UtxoAsset` - Uses string amounts

**Modern Alternative**: Use `ModernUtxo` type from `@yoroi/tx/utxo/models.ts` which uses `Balance.Amounts`.

### 5. **buildVotingLedgerPayloadV5** (Legacy Voting Protocol)
**Location**: `@yoroi/tx/ledger/payload.ts`

**Status**: ⚠️ **LEGACY**: This function uses CIP-15 (older voting protocol). New code should use `buildLedgerPayload()` with CIP-36 metadata.

**Note**: Kept for backward compatibility with older Ledger app versions.

## 🟡 Partial/Incomplete Implementations

### 1. **TransactionBuilder WASM Integration**
**Location**: `@yoroi/tx/transaction-builder/index.ts`

**Status**: ⚠️ **PARTIAL**: Structure is complete but WASM integration has TODO comments:
- `build()` method needs full WASM implementation
- `buildCBOR()` needs CBOR serialization
- `loadFromCBOR()` needs CBOR deserialization

### 2. **buildLedgerSignedTx Auxiliary Data**
**Location**: `@yoroi/tx/ledger/signing.ts`

**Status**: ⚠️ **PARTIAL**: Catalyst registration metadata handling is commented out with TODO. The `useCIP36` parameter is currently unused.

### 3. **Enhanced Transaction Analysis Integration**
**Location**: `mobile/src/features/ReviewTx/common/hooks/useFormattedTx.tsx`

**Status**: ⚠️ **PARTIAL**: Hooks are created but full integration with transaction review UI is not yet complete.

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

### Legacy Wrapper (Temporary)
- ⚠️ `@yoroi/tx/legacy` - **TEMPORARY**: Contains deprecated transaction building methods that still import from `@emurgo/yoroi-lib`. This is intentional and will be removed in Phase 2 when `TransactionBuilder` is complete.
  - Only used internally by old transaction building code
  - Will be completely removed once all code migrates to `TransactionBuilder`
  - The `@emurgo/yoroi-lib` dependency in `package.json` can be removed once this wrapper is gone

## 📝 Notes for Developers

1. **When adding new code**: Use `@yoroi/tx` directly, avoid `Cardano.*` wrapper
2. **When refactoring**: Replace `UtxoModels.*` with direct type imports
3. **For new UTXO code**: Use `ModernUtxo` type instead of legacy types
4. **For transaction building**: Wait for Phase 2 `TransactionBuilder` completion before using
5. **For Ledger signing**: Use `buildLedgerPayload()` instead of `buildVotingLedgerPayloadV5()` for new code

## 🔄 Migration Timeline

- **Phase 1 (Current)**: Migration complete, legacy APIs maintained for compatibility
- **Phase 2 (Next)**: Complete `TransactionBuilder` implementation, deprecate old methods
- **Phase 3 (Future)**: Remove all legacy APIs and backward compatibility shims

