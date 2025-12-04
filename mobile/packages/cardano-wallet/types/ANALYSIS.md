# Analysis: Removing `mobile/src/wallets/types` Directory

## Overview
All types in `mobile/src/wallets/types` should be migrated to appropriate packages. This document analyzes each file and provides migration paths.

---

## File-by-File Analysis

### 1. `other.ts` - API Types

#### Types Defined:
- `WalletState` - `{lastGeneratedAddressIndex: number}`
- `RawUtxo` - Already exists in `@yoroi/api` ✅
- `AccountStateRequest` - Already exists in `@yoroi/api` ✅
- `AccountStateResponse` - Already exists in `@yoroi/api` ✅
- `TipStatusResponse` - Already exists in `@yoroi/api` ✅
- `TxHistoryRequest` - Already exists in `@yoroi/api` ✅
- `FundInfoResponse` - Already exists in `@yoroi/api` ✅
- `TxSubmissionStatus` - Already exists in `@yoroi/api` ✅
- `TxStatusRequest` - Already exists in `@yoroi/api` ✅
- `TxStatusResponse` - Already exists in `@yoroi/api` ✅
- `BackendConfig` - Already exists in `@yoroi/api` ✅
- `RawTransaction` - **REMOVED** (now internal to API adapters) ✅

#### Re-exports:
- Transaction types from `@yoroi/types` - These are just re-exports ✅

#### Migration Plan:
1. ✅ **Already migrated**: Most API types are in `packages/api/cardano/api-types.ts` and exported from `@yoroi/api`
2. ❌ **Missing**: `WalletState` - This is wallet-specific state, should go to `@yoroi/types/wallet/wallet.ts` or stay in wallet implementation
3. **Action**: Replace all imports from `~/wallets/types/other` with `@yoroi/api` for API types

---

### 2. `tokens.ts` - Token Types

#### Types Defined:
- `Token` - `{isDefault: boolean, identifier: string, metadata: TokenMetadata}`
- `LegacyToken` - Same as `Token` (duplicate)
- `TransactionToken` - Minimal token metadata for transactions

#### Current Usage:
- Used in `packages/types/wallet/transactions.ts` (TransactionToken)
- Used in wallet utils and operations

#### Migration Plan:
1. **Check**: `@yoroi/types` has `Balance.Token` and `Portfolio.Token` types
2. **Check**: `@yoroi/portfolio` has token management types
3. **Action**: 
   - `TransactionToken` is used in `@yoroi/types` - should move there or be replaced
   - `Token` and `LegacyToken` - check if equivalent exists in `@yoroi/types` or `@yoroi/portfolio`
   - If not, create proper token types in `@yoroi/types` or `@yoroi/portfolio`

---

### 3. `yoroi.ts` - Yoroi-Specific Types

#### Types Defined:
- `YoroiTxInfo` - UI utility type for transaction building
- `YoroiStaking` - Staking operations structure
- `YoroiVoting` - Voting registration structure
- `YoroiMetadata` - `{[label: string]: string}`
- `YoroiNftModerationStatus` - NFT moderation status enum
- `YoroiConfig` - Remote config structure (large, complex)
- `YoroiConfigRecommendedDapp` - DApp recommendation structure
- `Address` - Type alias for `string`
- `TokenId` - Type alias for `string`

#### Current Usage:
- `YoroiConfig` - Used in RemoteConfig feature
- `YoroiNftModerationStatus` - Used in wallet mocks
- `YoroiTxInfo`, `YoroiStaking`, `YoroiVoting` - Used in wallet operations
- `Address`, `TokenId` - Used as type aliases

#### Migration Plan:
1. **YoroiConfig**: Should go to `@yoroi/types` as `App.Config` or similar
2. **YoroiTxInfo/YoroiStaking/YoroiVoting**: These are UI/builder types - check if `@yoroi/tx` has equivalents
3. **YoroiMetadata**: Simple type - could go to `@yoroi/types`
4. **YoroiNftModerationStatus**: Should go to `@yoroi/types` or `@yoroi/portfolio`
5. **Address/TokenId**: These are just aliases - should use `Portfolio.Token.Id` and proper Address types from `@yoroi/types`

---

### 4. `staking.ts` - Staking Types

#### Types Defined:
- `StakingInfo` - `{status: 'not-registered' | 'registered' | {status: 'staked', poolId, amount, rewards}}`
- `StakingStatus` - `{isRegistered: false} | {isRegistered: true} | {isRegistered: true, poolKeyHash}`
- `RemotePoolMetaSuccess` - Pool metadata with history

#### Current Usage:
- Used extensively in staking features and wallet operations
- `RemotePoolMetaSuccess` - Used in wallet mocks

#### Migration Plan:
1. **Check**: `@yoroi/staking` package exists and has types
2. **Action**: 
   - `StakingInfo` and `StakingStatus` - Should be in `@yoroi/staking` as they're domain types
   - `RemotePoolMetaSuccess` - Check if equivalent exists in `@yoroi/staking/pools`

---

### 5. `hw.ts` - Hardware Wallet Types

#### Types Defined:
- `Device` - `{id: number, name: string}`

#### Current Usage:
- Used in HW wallet connection screens
- Used in LedgerConnect components

#### Migration Plan:
1. **Check**: `@yoroi/types/hw/hw.ts` has `HWDeviceInfo`, `HWFeatures`, `HWDeviceObj`
2. **Action**: 
   - `Device` type is simpler than `HWDeviceInfo`
   - Check if `Device` can be replaced with `HW.DeviceInfo` from `@yoroi/types`
   - If not, add `Device` type to `@yoroi/types/hw/hw.ts`

---

## Summary by Package

### ✅ Already in Packages (Can Remove Immediately):

#### `@yoroi/api`:
- `RawUtxo`
- `AccountStateRequest`
- `AccountStateResponse`
- `TipStatusResponse`
- `TxHistoryRequest`
- `FundInfoResponse`
- `TxSubmissionStatus`
- `TxStatusRequest`
- `TxStatusResponse`
- `BackendConfig`

#### `@yoroi/types`:
- All transaction types (re-exported)
- `BaseAsset` (re-exported)
- `HWDeviceInfo` (similar to `Device`)

### ❌ Missing from Packages (Need to Create):

1. **`WalletState`** - Should go to `@yoroi/types/wallet/wallet.ts`
2. **`Token` / `LegacyToken`** - Check if equivalent in `@yoroi/types` or `@yoroi/portfolio`
3. **`TransactionToken`** - Used in `@yoroi/types` - should be moved there
4. **`StakingInfo`** - Should go to `@yoroi/staking`
5. **`StakingStatus`** - Should go to `@yoroi/staking`
6. **`RemotePoolMetaSuccess`** - Check `@yoroi/staking/pools`
7. **`YoroiConfig`** - Should go to `@yoroi/types` as `App.Config`
8. **`YoroiNftModerationStatus`** - Should go to `@yoroi/types` or `@yoroi/portfolio`
9. **`YoroiTxInfo` / `YoroiStaking` / `YoroiVoting`** - Check if needed or can use `@yoroi/tx` types
10. **`Device`** - Should use `HW.DeviceInfo` or add to `@yoroi/types/hw`

---

## Migration Steps

1. **Phase 1**: Migrate types that already exist in packages
   - Replace imports from `~/wallets/types/other` with `@yoroi/api`
   - Remove re-exports

2. **Phase 2**: Create missing types in packages
   - Add `WalletState` to `@yoroi/types/wallet`
   - Add staking types to `@yoroi/staking`
   - Add config types to `@yoroi/types`
   - Add token types if missing

3. **Phase 3**: Update all imports
   - Find all imports from `~/wallets/types/*`
   - Replace with package imports
   - Remove `mobile/src/wallets/types` directory

4. **Phase 4**: Verify
   - Run TypeScript compiler
   - Run linter
   - Run tests

