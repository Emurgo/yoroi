# Migration Summary: Removing `mobile/src/wallets/types`

## ✅ Types Already in Packages (Can Remove Immediately)

### From `other.ts` → `@yoroi/api`:
- ✅ `RawUtxo` - `packages/api/cardano/api-types.ts`
- ✅ `AccountStateRequest` - `packages/api/cardano/api-types.ts`
- ✅ `AccountStateResponse` - `packages/api/cardano/api-types.ts`
- ✅ `TipStatusResponse` - `packages/api/cardano/api-types.ts`
- ✅ `TxHistoryRequest` - `packages/api/cardano/api-types.ts`
- ✅ `FundInfoResponse` - `packages/api/cardano/api-types.ts`
- ✅ `TxSubmissionStatus` - `packages/api/cardano/api-types.ts`
- ✅ `TxStatusRequest` - `packages/api/cardano/api-types.ts`
- ✅ `TxStatusResponse` - `packages/api/cardano/api-types.ts`
- ✅ `BackendConfig` - `packages/api/cardano/api-types.ts`

**Action**: Replace `from '~/wallets/types/other'` → `from '@yoroi/api'`

### Re-exports from `other.ts` → `@yoroi/types`:
- ✅ All transaction types (already re-exported)
- ✅ `BaseAsset` (already re-exported)

**Action**: Remove re-exports, import directly from `@yoroi/types`

---

## ❌ Types Missing from Packages (Need to Create)

### 1. `WalletState` 
**Current**: `{lastGeneratedAddressIndex: number}`  
**Location**: `mobile/src/wallets/types/other.ts`  
**Should go to**: `packages/types/wallet/wallet.ts`  
**Usage**: Used in wallet implementation (`cardano-wallet.ts`, `types.ts`)  
**Status**: ❌ Not in packages

### 2. `Token` / `LegacyToken`
**Current**: `{isDefault: boolean, identifier: string, metadata: TokenMetadata}`  
**Location**: `mobile/src/wallets/types/tokens.ts`  
**Should check**: `@yoroi/types` has `Balance.Token` and `Portfolio.Token`  
**Usage**: Used in wallet utils and operations  
**Status**: ⚠️ Need to verify if equivalent exists

### 3. `TransactionToken`
**Current**: Minimal token metadata for transactions  
**Location**: `mobile/src/wallets/types/tokens.ts`  
**Used in**: `packages/types/wallet/transactions.ts`  
**Should go to**: `packages/types/wallet/transactions.ts`  
**Status**: ❌ Currently imported from `~/wallets/types/tokens` in `@yoroi/types` package!

### 4. `StakingInfo`
**Current**: `{status: 'not-registered' | 'registered' | {status: 'staked', poolId, amount, rewards}}`  
**Location**: `mobile/src/wallets/types/staking.ts`  
**Should go to**: `packages/staking/types.ts` or new `packages/staking/state.ts`  
**Usage**: Used extensively in staking features  
**Status**: ❌ Not in packages

### 5. `StakingStatus`
**Current**: `{isRegistered: false} | {isRegistered: true} | {isRegistered: true, poolKeyHash}`  
**Location**: `mobile/src/wallets/types/staking.ts`  
**Should go to**: `packages/staking/types.ts` or new `packages/staking/state.ts`  
**Usage**: Used in delegation utils  
**Status**: ❌ Not in packages

### 6. `RemotePoolMetaSuccess`
**Current**: Pool metadata with certificate history  
**Location**: `mobile/src/wallets/types/staking.ts`  
**Should check**: `packages/staking/pools/pool-info-api.ts` has `ExplorerPoolInfo` but different structure  
**Usage**: Used in wallet mocks  
**Status**: ⚠️ Similar but not identical - may need adapter or new type

### 7. `YoroiConfig`
**Current**: Large remote config structure (banners, popups, features, dapps, swap, etc.)  
**Location**: `mobile/src/wallets/types/yoroi.ts`  
**Should go to**: `packages/types/index.ts` as `App.Config` or `App.RemoteConfig`  
**Usage**: Used in RemoteConfig feature  
**Status**: ❌ Not in packages

### 8. `YoroiConfigRecommendedDapp`
**Current**: DApp recommendation structure  
**Location**: `mobile/src/wallets/types/yoroi.ts`  
**Should go to**: `packages/types/index.ts` as `App.ConfigRecommendedDapp`  
**Status**: ❌ Not in packages

### 9. `YoroiNftModerationStatus`
**Current**: `'consent' | 'blocked' | 'approved' | 'pending' | 'manual_review'`  
**Location**: `mobile/src/wallets/types/yoroi.ts`  
**Should go to**: `packages/types/index.ts` or `packages/portfolio/types.ts`  
**Usage**: Used in wallet mocks  
**Status**: ❌ Not in packages

### 10. `YoroiTxInfo` / `YoroiStaking` / `YoroiVoting`
**Current**: UI utility types for transaction building  
**Location**: `mobile/src/wallets/types/yoroi.ts`  
**Should check**: `@yoroi/tx` has `UnsignedTransaction` - may be equivalent  
**Usage**: Used in wallet operations  
**Status**: ⚠️ Need to verify if `@yoroi/tx` types can replace these

### 11. `YoroiMetadata`
**Current**: `{[label: string]: string}`  
**Location**: `mobile/src/wallets/types/yoroi.ts`  
**Should go to**: `packages/types/index.ts` or replace with `TxMetadata` from `@yoroi/types`  
**Status**: ⚠️ May be redundant with `TxMetadata`

### 12. `Address` / `TokenId`
**Current**: Type aliases (`string`)  
**Location**: `mobile/src/wallets/types/yoroi.ts`  
**Should use**: 
- `Address`: `@yoroi/types` or `@yoroi/tx` Address types
- `TokenId`: `Portfolio.Token.Id` from `@yoroi/types`  
**Status**: ❌ Should use proper types from packages

### 13. `Device`
**Current**: `{id: number, name: string}`  
**Location**: `mobile/src/wallets/types/hw.ts`  
**Should use**: `HW.DeviceInfo` from `@yoroi/types` (has `HWDeviceInfo` with more fields)  
**Status**: ⚠️ `HWDeviceInfo` exists but is more complex - may need adapter or simplification

---

## Critical Finding: Circular Dependency

**⚠️ `TransactionToken` is imported in `@yoroi/types` package from `~/wallets/types/tokens`**

This is a circular dependency issue:
- `packages/types/wallet/transactions.ts` imports from `~/wallets/types/tokens`
- But `~/wallets/types/other.ts` re-exports from `@yoroi/types`

**This must be fixed first!**

---

## Migration Priority

### Phase 1: Fix Circular Dependency (CRITICAL)
1. Move `TransactionToken` from `mobile/src/wallets/types/tokens.ts` to `packages/types/wallet/transactions.ts`
2. Update `packages/types/wallet/transactions.ts` to use local `TransactionToken`
3. Remove import from `~/wallets/types/tokens`

### Phase 2: Migrate API Types (Easy)
1. Replace all imports of API types from `~/wallets/types/other` with `@yoroi/api`
2. Remove API type definitions from `other.ts`
3. Remove re-exports from `other.ts`

### Phase 3: Create Missing Types in Packages
1. Add `WalletState` to `packages/types/wallet/wallet.ts`
2. Add `StakingInfo` and `StakingStatus` to `packages/staking/types.ts`
3. Add `YoroiConfig` and related types to `packages/types/index.ts` as `App.Config`
4. Add `YoroiNftModerationStatus` to `packages/types/index.ts` or `packages/portfolio/types.ts`
5. Evaluate `RemotePoolMetaSuccess` - create adapter or new type in `@yoroi/staking`

### Phase 4: Replace Type Aliases
1. Replace `Address` with proper Address types from `@yoroi/types` or `@yoroi/tx`
2. Replace `TokenId` with `Portfolio.Token.Id`

### Phase 5: Evaluate Utility Types
1. Check if `YoroiTxInfo`/`YoroiStaking`/`YoroiVoting` can be replaced with `@yoroi/tx` types
2. Check if `YoroiMetadata` can be replaced with `TxMetadata`
3. Check if `Device` can use `HW.DeviceInfo` or needs adapter

### Phase 6: Final Cleanup
1. Update all imports across codebase
2. Remove `mobile/src/wallets/types` directory
3. Run TypeScript compiler and linter
4. Run tests

---

## Files That Need Updates

### High Priority (Circular Dependency):
- `packages/types/wallet/transactions.ts` - Remove import from `~/wallets/types/tokens`

### Medium Priority (Many Usages):
- `src/wallets/cardano/types.ts` - Uses many types from `~/wallets/types`
- `src/wallets/cardano/cardano-wallet.ts` - Uses `WalletState`, `StakingInfo`
- `src/features/RemoteConfig/hooks/useRemoteConfig.ts` - Uses `YoroiConfig`
- All files importing from `~/wallets/types/*`

---

## Estimated Impact

- **Files to update**: ~50-100 files
- **Types to migrate**: 13 types
- **Types already in packages**: 10+ types
- **Critical issues**: 1 (circular dependency)

