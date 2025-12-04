# Removal Candidates: Types + Mocks + Tests

## Types That Are Only Used in Mocks/Tests

### 1. `Token` from `tokens.ts`
**Files to remove/update:**
- ❌ Remove type from `src/wallets/types/tokens.ts`
- ⚠️ Update `src/wallets/cardano/utils.test.ts`:
  - Replace `const secondaryToken: Token = {...}` with `Portfolio.Token.Info`
  - Or remove test if not valuable

**Impact**: Low - Only affects one test file

---

### 2. `RemotePoolMetaSuccess` from `staking.ts`
**Files to remove/update:**
- ❌ Remove type from `src/wallets/types/staking.ts`
- ❌ Remove from `src/wallets/mocks/wallet.ts`:
  - Remove `poolInfoAndHistory: RemotePoolMetaSuccess` constant
  - Update `fetchPoolInfo` mock to return `StakePoolInfosAndHistories` directly
- ❌ Remove from `src/features/WalletManager/wallet.mock.ts`:
  - Same updates as above

**Impact**: Medium - Affects mocks used in multiple test files
**Note**: Real code uses `StakePoolInfosAndHistories` from `@yoroi/staking`, so mocks should use that too

---

### 3. `YoroiNftModerationStatus` from `yoroi.ts`
**Files to remove/update:**
- ❌ Remove type from `src/wallets/types/yoroi.ts`
- ❌ Remove from `src/wallets/mocks/wallet.ts`:
  - Remove entire `fetchNftModerationStatus` mock object (lines 326-362)
  - Remove from `mocks` export (line 797)

**Impact**: Low - `fetchNftModerationStatus` is not a real wallet method, so removing it is safe

**Verification**: Check if any tests actually use `mocks.fetchNftModerationStatus`

---

## Summary

### Safe to Remove (No Real Usage):
1. ✅ `Token` - Only in test
2. ✅ `RemotePoolMetaSuccess` - Only in mocks, real code uses `StakePoolInfosAndHistories`
3. ✅ `YoroiNftModerationStatus` - Only in mocks, not a real API

### Action Plan:
1. **Phase 1**: Remove `YoroiNftModerationStatus` + `fetchNftModerationStatus` mock (safest)
2. **Phase 2**: Remove `RemotePoolMetaSuccess` + update mocks to use `StakePoolInfosAndHistories`
3. **Phase 3**: Remove `Token` + update test to use `Portfolio.Token.Info`

