# Phase 1 & 2 Implementation Status

## ✅ Phase 1: Migration to `@yoroi/tx` Package

### ✅ Completed Tasks

**1.1 Create New Package Structure** ✅
- ✅ Created `yoroi/mobile/packages/tx/` directory structure
- ✅ Created package index file (`index.ts`)
- ✅ Set up TypeScript path mapping in `tsconfig.json`
- ✅ Updated build script to include `tx` package

**1.2 Migrate Core Transaction Building** ⚠️ PARTIAL
- ⚠️ **LEGACY/DEPRECATED**: Old transaction building methods (`createUnsignedTx`, etc.) - **See LEGACY_AND_BACKWARD_COMPATIBILITY.md** - These are kept for backward compatibility but will be replaced in Phase 2
- ✅ **DONE**: Ledger integration functions - Migrated to `@yoroi/tx/ledger/`
  - ✅ `buildLedgerPayload()` - Standard transaction payload
  - ✅ `buildVotingLedgerPayloadV5()` - Legacy voting payload
  - ✅ `buildLedgerSignedTx()` - Build signed tx from Ledger response
  - ✅ `createSignedLedgerTxFromCbor()` - Sign from CBOR
  - ✅ `signRawTransaction()` - Sign raw CBOR with private keys
  - ✅ Transformation utilities (inputs, outputs, certificates, withdrawals)
- ✅ **DONE**: Cardano-specific utilities - Migrated to `@yoroi/tx/utils/`
  - ✅ `normalizeToAddress()` - Address normalization
  - ✅ `parseTokenList()` - Token list parsing
  - ✅ `calculateTxId()` - Transaction ID calculation
  - ✅ `hashTransaction()` - Transaction hashing
  - ✅ `getBalanceForStakingCredentials()` - Staking balance calculation
  - ✅ `AssetNameUtils` - Asset name utilities
  - ✅ Asset conversion utilities (cardanoValueFromMultiToken, etc.)

**1.3 Migrate UtxoService** ✅
- ✅ Moved `UtxoService` class to `@yoroi/tx/utxo/`
- ✅ Moved `UtxoStorage` interface
- ✅ Moved `initUtxo()` factory function
- ✅ Migrated UTXO models (legacy types maintained for backward compatibility - **See LEGACY_AND_BACKWARD_COMPATIBILITY.md**)

**1.4 Move PoolInfoApi to Staking Package** ✅
- ✅ PoolInfoApi moved to `@yoroi/staking/pools/`
- ✅ Pool-related types moved
- ✅ Updated staking package exports

**1.5 Organize Utils & Types** ✅
- ✅ Moved generic utilities to `@yoroi/common`:
  - ✅ `isHex()`, `stringToHex()` → `@yoroi/common/utils/hex.ts`
  - ✅ `bech32ToHex()` → `@yoroi/common/utils/bech32.ts`
  - ✅ `joinUrl()` → `@yoroi/common/utils/urls.ts`
  - ✅ Record utilities → `@yoroi/common/utils/records.ts`
  - ✅ Array utilities → `@yoroi/common/utils/arrays.ts`
- ✅ Transaction-specific types remain in `@yoroi/tx/types/`
- ✅ MultiToken class migrated to `@yoroi/tx/types/multi-token.ts`

**1.6 Remove Unused Features** ❌ NOT DONE
- ❌ AccountService removal (not yet removed, still in yoroi-lib)
- ❌ Encryption functions removal (not yet removed)
- ❌ Governance APIs removal (not yet removed)
- ❌ Protocol Parameters APIs removal (not yet removed)
- ❌ Assets APIs removal (not yet removed)

**1.7 Update Imports** ❌ NOT DONE
- ❌ Mobile app still uses `@emurgo/yoroi-lib` - needs migration
- ❌ Need to update all imports throughout the codebase

**1.8 Testing & Validation** ❌ NOT DONE
- ❌ Tests not yet run
- ❌ Functionality not yet validated

---

## ✅ Phase 2: Modern UTXO Management & Flexible Transaction Builder

### ✅ Completed Tasks

**2.1 Modernize UTXO Data Types** ✅
- ✅ Created `ModernUtxo` type matching `useUtxoList.ts` pattern
- ✅ Uses `Balance.Amounts` instead of `BigNumber`
- ✅ Includes derivation path support
- ✅ Legacy types maintained for backward compatibility

**2.2 Flexible Transaction Builder** ✅
- ✅ Created `TransactionBuilder` class with flexible API
- ✅ Supports manual UTXO selection
- ✅ Supports multiple certificates
- ✅ Supports reference inputs
- ✅ Supports metadata
- ✅ Supports withdrawals
- ✅ Builder pattern with method chaining
- ⚠️ **PARTIAL**: WASM integration not yet implemented (TODO comments added)

**2.3 Multiparty Transaction Support** ✅
- ✅ Added `buildCBOR()` method for serializing to CBOR hex
- ✅ Added `loadFromCBOR()` static method for deserializing
- ✅ Created `WitnessManager` class for managing signatures
- ✅ Added `getRequiredSigners()` helper function
- ⚠️ **PARTIAL**: Full WASM implementation not yet complete

**2.4 Enhanced Transaction Analysis** ✅
- ✅ Created `ContractService` for querying smart contract info
- ✅ Created `useSmartContractInfo` hook
- ✅ Created `useAddressResolution` hooks for alias resolution
- ✅ Extended `FormattedInput` and `FormattedOutput` types with:
  - `resolvedName` field for aliases
  - `contractInfo` field for smart contract details
- ⚠️ **PARTIAL**: Integration with `useFormattedTx` not yet complete

**2.5 Interactive Transaction Crafting** ❌ NOT DONE
- ❌ Crafting UI not yet created
- ❌ React hook for builder not yet created
- ❌ Draft transaction saving not yet implemented

---

## Summary

### ✅ Fully Completed
1. Package structure creation
2. UTXO service migration
3. Modern UTXO types
4. Flexible TransactionBuilder class structure
5. Multiparty transaction support structure
6. Enhanced transaction analysis hooks and services
7. Utility functions migration to `@yoroi/common`
8. TypeScript configuration updates

### ⚠️ Partially Completed (Structure Done, Implementation Needed)
1. Transaction building WASM integration
2. CBOR serialization/deserialization implementation
3. Ledger integration migration
4. Cardano-specific utilities migration
5. Integration of enhanced analysis with `useFormattedTx`

### ❌ Not Yet Started
1. PoolInfoApi migration to staking package
2. Removal of unused features from yoroi-lib
3. Import updates throughout mobile app
4. Testing and validation
5. Interactive transaction crafting UI
6. Old transaction building methods migration

---

## Next Steps

### Immediate (Phase 1 Completion)
1. ✅ **Migrate Ledger integration** from yoroi-lib to `@yoroi/tx` (completed)
2. ✅ **Migrate Cardano utilities** (normalizeToAddress, parseTokenList, etc.) (completed)
3. ✅ **Move PoolInfoApi** to `@yoroi/staking/pools/` (completed)
4. ✅ **Update imports** from `@emurgo/yoroi-lib` to `@yoroi/tx` throughout mobile app (mostly completed)
   - ✅ Updated all utility function imports (normalizeToAddress, parseTokenList, etc.)
   - ✅ Updated all type imports (Datum, CardanoAddressedUtxo, SendToken, etc.)
   - ✅ Updated all Ledger function imports (createSignedLedgerTxFromCbor, signRawTransaction)
   - ✅ Updated all PoolInfoApi imports to `@yoroi/staking`
   - ✅ Updated all error imports (NotEnoughMoneyToSendError, NoOutputsError)
   - ⚠️ **TODO**: `createLedgerPlutusPayload`, `getAllSigners` - **See LEGACY_AND_BACKWARD_COMPATIBILITY.md** - Need migration from yoroi-lib
   - ⚠️ **LEGACY**: `createYoroiLib` - **See LEGACY_AND_BACKWARD_COMPATIBILITY.md** - Legacy wrapper, kept for backward compatibility
5. **Remove unused features** from yoroi-lib (or mark as deprecated)

### Short-term (Phase 2 Completion)
1. **Implement WASM integration** for TransactionBuilder
2. **Complete CBOR serialization** implementation
3. **Integrate enhanced analysis** with `useFormattedTx` hook
4. **Create interactive crafting UI** for transactions
5. **Add tests** for new functionality

### Long-term (Cleanup)
1. **Remove deprecated APIs** after migration period
2. **Performance optimization** of UTXO service
3. **Documentation** for new APIs

