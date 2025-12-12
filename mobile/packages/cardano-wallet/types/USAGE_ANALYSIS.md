# Usage Analysis: Types in `mobile/src/wallets/types`

## Summary: Which Types Are Actually Used?

### ❌ **UNUSED - Can Remove**
1. **`WalletState`** from `other.ts` - Defined but never emitted/used
2. **`Token`** from `tokens.ts` - Only used in ONE test file (`utils.test.ts`)
3. **`YoroiTxInfo`** - Defined but never used as a type annotation
4. **`YoroiStaking`** - Only used as a field in `YoroiTxInfo` (which is unused)
5. **`YoroiVoting`** - Only used as a field in `YoroiTxInfo` (which is unused)
6. **`YoroiMetadata`** - Only used as a field in `YoroiTxInfo` (which is unused)

### ✅ **USED - Need to Migrate**
1. **`TransactionToken`** - Used in `@yoroi/types` package (CRITICAL - circular dependency)
2. **`LegacyToken`** - Used in `api/utils.ts` for `toTokenInfo` function
3. **`StakingInfo`** - Used extensively (23 files)
4. **`StakingStatus`** - Used in multiple files
5. **`RemotePoolMetaSuccess`** - Used in wallet mocks (2 files)
6. **`YoroiConfig`** - Used in RemoteConfig feature
7. **`YoroiConfigRecommendedDapp`** - Used as part of `YoroiConfig`
8. **`YoroiNftModerationStatus`** - Used in wallet mocks
9. **`Address`** (type alias) - Used in `getMinAmounts.ts`
10. **`TokenId`** (type alias) - Used in `utils/utils.ts`
11. **`Device`** - Used in 3 UI components

---

## Detailed Analysis

### 1. `WalletState` from `other.ts`
**Status**: ❌ **UNUSED**
- **Defined**: `{lastGeneratedAddressIndex: number}`
- **Used in**: `WalletEvent` type as `{type: 'state'; state: WalletState}`
- **Actually emitted**: ❌ NO - No `notify({type: 'state', ...})` calls found
- **Conclusion**: Dead code, can be removed

---

### 2. `Token` from `tokens.ts`
**Status**: 🔴 **TEST-ONLY** (Candidate for removal)
- **Defined**: `{isDefault: boolean, identifier: string, metadata: TokenMetadata}`
- **Used in**: 
  - `src/wallets/cardano/utils.test.ts` - Only ONE test file
  - Used as a test mock: `const secondaryToken: Token = {...}`
- **Real usage**: ❌ Not used in real code
- **Conclusion**: **REMOVE** - Replace with `Portfolio.Token.Info` in test or remove test if not valuable

---

### 3. `LegacyToken` from `tokens.ts`
**Status**: ✅ **USED**
- **Defined**: Same as `Token` (duplicate)
- **Used in**: 
  - `src/wallets/cardano/api/utils.ts` - Function `toTokenInfo(token: LegacyToken)`
- **Conclusion**: Actually used, needs migration or replacement

---

### 4. `TransactionToken` from `tokens.ts`
**Status**: ✅ **USED** (CRITICAL - Circular Dependency)
- **Defined**: Minimal token metadata for transactions
- **Used in**: 
  - `packages/types/wallet/transactions.ts` - Imported from `~/wallets/types/tokens` ⚠️
  - `src/wallets/utils/format.ts` - Used in function signatures
- **Conclusion**: **MUST MIGRATE** - Creates circular dependency (package imports from src)

---

### 5. `StakingInfo` from `staking.ts`
**Status**: ✅ **USED EXTENSIVELY**
- **Defined**: `{status: 'not-registered' | 'registered' | {status: 'staked', poolId, amount, rewards}}`
- **Used in**: 23 files including:
  - `cardano-wallet.ts`
  - `staking-operations.ts`
  - `useStakingInfo.ts`
  - `StakePoolInfos.tsx`
  - Many feature files
- **Conclusion**: Actively used, needs migration to `@yoroi/staking`

---

### 6. `StakingStatus` from `staking.ts`
**Status**: ✅ **USED**
- **Defined**: `{isRegistered: false} | {isRegistered: true} | {isRegistered: true, poolKeyHash}`
- **Used in**: 
  - `delegationUtils.ts`
  - `cardano-wallet.ts`
  - `types.ts`
- **Conclusion**: Actively used, needs migration to `@yoroi/staking`

---

### 7. `RemotePoolMetaSuccess` from `staking.ts`
**Status**: 🔴 **MOCK-ONLY** (Candidate for removal)
- **Defined**: Pool metadata with certificate history
- **Used in**: 
  - `src/wallets/mocks/wallet.ts` - Mock `poolInfoAndHistory`
  - `src/features/WalletManager/wallet.mock.ts` - Mock `poolInfoAndHistory`
- **Real usage**: ❌ Not used in real wallet code
- **Conclusion**: **REMOVE** - Type + mock data. Real code uses `StakePoolInfosAndHistories` from `@yoroi/staking`

---

### 8. `YoroiConfig` from `yoroi.ts`
**Status**: ✅ **USED**
- **Defined**: Large remote config structure
- **Used in**: 
  - `src/features/RemoteConfig/hooks/useRemoteConfig.ts` - Main usage
- **Conclusion**: Actively used, needs migration to `@yoroi/types` as `App.Config`

---

### 9. `YoroiConfigRecommendedDapp` from `yoroi.ts`
**Status**: ✅ **USED**
- **Defined**: DApp recommendation structure
- **Used in**: 
  - Part of `YoroiConfig` type
- **Conclusion**: Used as part of `YoroiConfig`, migrate together

---

### 10. `YoroiNftModerationStatus` from `yoroi.ts`
**Status**: 🔴 **MOCK-ONLY** (Candidate for removal)
- **Defined**: `'consent' | 'blocked' | 'approved' | 'pending' | 'manual_review'`
- **Used in**: 
  - `src/wallets/mocks/wallet.ts` - Mock `fetchNftModerationStatus` function
- **Real usage**: ❌ `fetchNftModerationStatus` is NOT a real wallet method
- **Conclusion**: **REMOVE** - Type + `fetchNftModerationStatus` mock (not a real API)

---

### 11. `YoroiTxInfo` from `yoroi.ts`
**Status**: ❌ **UNUSED**
- **Defined**: UI utility type for transaction building
- **Used in**: Nowhere - only defined
- **Conclusion**: Dead code, can be removed

---

### 12. `YoroiStaking` from `yoroi.ts`
**Status**: ❌ **UNUSED** (only used in unused `YoroiTxInfo`)
- **Defined**: Staking operations structure
- **Used in**: Only as a field in `YoroiTxInfo` (which is unused)
- **Conclusion**: Dead code, can be removed

---

### 13. `YoroiVoting` from `yoroi.ts`
**Status**: ❌ **UNUSED** (only used in unused `YoroiTxInfo`)
- **Defined**: Voting registration structure
- **Used in**: Only as a field in `YoroiTxInfo` (which is unused)
- **Conclusion**: Dead code, can be removed

---

### 14. `YoroiMetadata` from `yoroi.ts`
**Status**: ❌ **UNUSED** (only used in unused `YoroiTxInfo`)
- **Defined**: `{[label: string]: string}`
- **Used in**: Only as a field in `YoroiTxInfo` (which is unused)
- **Conclusion**: Dead code, can be removed

---

### 15. `Address` (type alias) from `yoroi.ts`
**Status**: ✅ **USED**
- **Defined**: `type Address = string`
- **Used in**: 
  - `src/wallets/cardano/getMinAmounts.ts` - Function parameter type
- **Conclusion**: Simple alias, can be replaced with `string` or proper Address type from packages

---

### 16. `TokenId` (type alias) from `yoroi.ts`
**Status**: ✅ **USED**
- **Defined**: `type TokenId = string`
- **Used in**: 
  - `src/wallets/utils/utils.ts` - Imported but usage unclear
- **Conclusion**: Simple alias, should use `Portfolio.Token.Id` instead

---

### 17. `Device` from `hw.ts`
**Status**: ✅ **USED**
- **Defined**: `{id: number, name: string}`
- **Used in**: 
  - `src/features/SetupWallet/useCases/RestoreHwWallet/ConnectNanoXScreen.tsx`
  - `src/ui/LedgerConnect/LedgerConnect.tsx`
  - `src/features/HW/LedgerConnect/DeviceItem/DeviceItem.tsx`
- **Conclusion**: Used in UI components. Should use `HW.DeviceInfo` from `@yoroi/types` or create adapter

---

## Migration Priority

### 🔴 **CRITICAL** (Must Fix First)
1. **`TransactionToken`** - Circular dependency issue

### 🟡 **HIGH PRIORITY** (Actively Used)
2. **`StakingInfo`** - Used in 23 files
3. **`StakingStatus`** - Used in multiple files
4. **`YoroiConfig`** + **`YoroiConfigRecommendedDapp`** - Used in RemoteConfig
5. **`LegacyToken`** - Used in API utils

### 🟢 **LOW PRIORITY** (Can Remove or Replace)
6. **`Device`** - Replace with `HW.DeviceInfo` or adapter
7. **`Address`** / **`TokenId`** - Replace with proper types from packages

### 🔴 **MOCK-ONLY - CANDIDATE FOR REMOVAL** (Types + Mocks + Tests)
8. **`RemotePoolMetaSuccess`** - Only in mocks (`wallet.ts`, `wallet.mock.ts`)
   - **Action**: Remove type + remove from mocks + check if tests still work
9. **`YoroiNftModerationStatus`** - Only in mocks (`wallet.ts`)
   - **Action**: Remove type + remove `fetchNftModerationStatus` from mocks (not a real wallet method)
10. **`Token`** - Only in ONE test (`utils.test.ts`)
   - **Action**: Replace with `Portfolio.Token.Info` in test or remove test if not valuable

### ⚪ **DEAD CODE** (Can Remove Immediately)
11. **`WalletState`** - Never emitted
12. **`YoroiTxInfo`** - Never used
13. **`YoroiStaking`** - Never used
14. **`YoroiVoting`** - Never used
15. **`YoroiMetadata`** - Never used

### 🔴 **MOCK/TEST-ONLY** (Remove Type + Mock/Test)
16. **`Token`** - Only in one test file (`utils.test.ts`)
17. **`RemotePoolMetaSuccess`** - Only in mocks (not a real type)
18. **`YoroiNftModerationStatus`** - Only in mocks (`fetchNftModerationStatus` not a real method)

