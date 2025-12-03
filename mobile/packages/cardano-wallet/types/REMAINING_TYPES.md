# Remaining Types in `mobile/src/wallets/types`

## Summary

After removing dead code and mock-only types, here's what remains:

---

## `other.ts` - API Types (Should Migrate to `@yoroi/api`)

### ✅ Already Exist in `@yoroi/api` (Can Remove Immediately):

- `RawUtxo` - Already in `packages/api/cardano/api-types.ts`
- `AccountStateRequest` - Already in `packages/api/cardano/api-types.ts`
- `AccountStateResponse` - Already in `packages/api/cardano/api-types.ts`
- `TipStatusResponse` - Already in `packages/api/cardano/api-types.ts`
- `TxHistoryRequest` - Already in `packages/api/cardano/api-types.ts`
- `FundInfoResponse` - Already in `packages/api/cardano/api-types.ts`
- `TxSubmissionStatus` - Already in `packages/api/cardano/api-types.ts`
- `TxStatusRequest` - Already in `packages/api/cardano/api-types.ts`
- `TxStatusResponse` - Already in `packages/api/cardano/api-types.ts`
- `BackendConfig` - Already in `packages/api/cardano/api-types.ts`

### ⚠️ Internal Types (Not Exported, Used for RawTransaction):

- `RemoteAsset` - Internal helper type
- `BestblockResponse` - Internal helper type
- `RemoteTransactionInputBase` - Internal helper type
- `RemoteTransactionUtxoInput` - Internal helper type
- `RemoteTransactionInput` - Internal helper type
- `RemoteTransactionOutput` - Internal helper type
- `RemoteTxBlockMeta` - Internal helper type
- `RemoteTxInfo` - Internal helper type
- `FundInfo` - Internal helper type

### ❌ Problem:

- `RawTransaction` - **EXPORTED** but should be internal to API adapters (we already made it internal in adapters, but it's still exported here)

### Re-exports (Should Remove):

- All transaction types from `@yoroi/types` - Just re-exports
- `BaseAsset` from `@yoroi/types` - Just re-export

**Action**: Replace imports with `@yoroi/api` and remove re-exports

---

## `tokens.ts` - Token Types

### ✅ Used Types:

- `LegacyToken` - Used in `src/wallets/cardano/api/utils.ts` (`toTokenInfo` function)
- `TransactionToken` - **CRITICAL**: Used in `packages/types/wallet/transactions.ts` (circular dependency!)

### Internal Types:

- `TokenCommonMetadata` - Internal helper
- `TokenMetadata` - Internal helper

**Action**:

- `TransactionToken` - **MUST MIGRATE FIRST** (fixes circular dependency)
- `LegacyToken` - Migrate or replace with `Portfolio.Token.Info`

---

## `yoroi.ts` - Yoroi-Specific Types

### ✅ Used Types:

- `YoroiConfig` - Used in `src/features/RemoteConfig/hooks/useRemoteConfig.ts`
- `YoroiConfigRecommendedDapp` - Used as part of `YoroiConfig`
- `Address` - Type alias, used in `src/wallets/cardano/getMinAmounts.ts`
- `TokenId` - Type alias, used in `src/wallets/utils/utils.ts`

**Action**:

- `YoroiConfig` + `YoroiConfigRecommendedDapp` - Migrate to `@yoroi/types` as `App.Config`
- `Address` - Replace with proper Address type from packages or keep as `string`
- `TokenId` - Replace with `Portfolio.Token.Id`

---

## `staking.ts` - Staking Types

### ✅ Used Types:

- `StakingInfo` - Used in **23 files** (extensively used)
- `StakingStatus` - Used in multiple files

**Action**: Migrate to `@yoroi/staking` package

---

## `hw.ts` - Hardware Wallet Types

### ✅ Used Type:

- `Device` - Used in 3 UI components:
  - `src/features/SetupWallet/useCases/RestoreHwWallet/ConnectNanoXScreen.tsx`
  - `src/ui/LedgerConnect/LedgerConnect.tsx`
  - `src/features/HW/LedgerConnect/DeviceItem/DeviceItem.tsx`

**Action**: Replace with `HW.DeviceInfo` from `@yoroi/types` or create adapter

---

## Migration Priority

### 🔴 **CRITICAL** (Must Fix First):

1. **`TransactionToken`** - Circular dependency (package imports from src)

### 🟡 **HIGH PRIORITY** (Actively Used):

2. **API Types** (`RawUtxo`, `AccountStateRequest`, etc.) - Replace imports with `@yoroi/api`
3. **`StakingInfo`** - 23 files use it
4. **`StakingStatus`** - Multiple files use it
5. **`YoroiConfig`** + **`YoroiConfigRecommendedDapp`** - RemoteConfig feature

### 🟢 **MEDIUM PRIORITY**:

6. **`LegacyToken`** - Used in API utils
7. **`Address`** / **`TokenId`** - Simple aliases, easy to replace
8. **`Device`** - Used in 3 components, can use `HW.DeviceInfo`

### ⚪ **CLEANUP**:

9. **Remove re-exports** from `other.ts` (transaction types, BaseAsset)
10. **Remove `RawTransaction` export** from `other.ts` (should be internal only)

---

## Files That Need Updates

### High Impact:

- All files importing from `~/wallets/types/other` → Replace with `@yoroi/api`
- `packages/types/wallet/transactions.ts` → Fix `TransactionToken` circular dependency
- 23+ files using `StakingInfo` → Migrate to `@yoroi/staking`
- `src/features/RemoteConfig/hooks/useRemoteConfig.ts` → Migrate `YoroiConfig`

### Medium Impact:

- `src/wallets/cardano/api/utils.ts` → Update `LegacyToken` usage
- `src/wallets/cardano/getMinAmounts.ts` → Replace `Address` alias
- `src/wallets/utils/utils.ts` → Replace `TokenId` alias
- 3 UI components → Replace `Device` with `HW.DeviceInfo`
