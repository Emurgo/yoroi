# Legacy API Usage Report

This document lists all remaining usages of the legacy API in the codebase.

---

## 🔴 Functions Still Using Legacy API Directly

### 1. `checkServerStatus()`
**Location**: `mobile/src/wallets/cardano/api/api.ts:26`
**Legacy Endpoint**: `GET /status`
**Status**: ❌ **Not Migrated**
**Backend-Zero Equivalent**: None (health check endpoint may exist but not documented)

```typescript
export const checkServerStatus = (baseApiUrl: string): Promise<ServerStatus> =>
  fetchDefault('status', null, baseApiUrl, 'GET')
```

**Used In**:
- `cardano-wallet.ts:1003` - `wallet.checkServerStatus()`
- `transaction-recipes/wallet-helpers.ts:27` - Transaction building

---

### 2. `getFundInfo()`
**Location**: `mobile/src/wallets/cardano/api/api.ts:503`
**Legacy Endpoint**: `GET /v0/catalyst/fundInfo/` (or `/api/v0/catalyst/fundInfo/` for testnets)
**Status**: ❌ **Not Migrated**
**Backend-Zero Equivalent**: Not available in backend-zero OpenAPI spec

```typescript
export const getFundInfo = (
  baseApiUrl: string,
  isMainnet: boolean,
): Promise<FundInfoResponse> => {
  const prefix = isMainnet ? '' : 'api/'
  return fetchDefault(`${prefix}v0/catalyst/fundInfo/`, null, baseApiUrl, 'GET')
}
```

**Used In**:
- `cardano-wallet.ts:1164` - `wallet.getFundInfo()`

**Note**: Catalyst fund info is governance-related. Backend-zero may not support this endpoint.

---

## 🟡 Functions with Legacy API Fallbacks

These functions use backend-zero when wallet context is provided, but fall back to legacy API otherwise.

### 3. `getAccountState()` / `bulkGetAccountState()`
**Location**: `mobile/src/wallets/cardano/api/api.ts:316`
**Backend-Zero**: `GET /v0/wallets/{id}/rewards` ✅ (when wallet context provided)
**Legacy Fallback**: `POST /account/state` ❌ (when no wallet context)

**Fallback Locations**:
- `api.ts:356` - When wallet registration fails
- `api.ts:390` - When no wallet context provided

**Used In**:
- `cardano-wallet.ts:1143` - `wallet.fetchAccountState()`
- `transaction-recipes/wallet-helpers.ts:133` - Transaction building (⚠️ **No wallet context passed**)

**Issue**: `transaction-recipes/wallet-helpers.ts` calls `getAccountState()` without wallet context, so it always uses legacy API.

---

### 4. `fetchNewTxHistory()`
**Location**: `mobile/src/wallets/cardano/api/api.ts:65`
**Backend-Zero**: `GET /v0/wallets/{id}/transactions` ✅ (when wallet context provided)
**Legacy Fallback**: `POST /v2/txs/history` ❌ (when no wallet context)

**Fallback Locations**:
- `api.ts:111` - When backend-zero request fails
- `api.ts:192` - When no wallet context provided

**Used In**:
- `transactionManager.ts:323` - Transaction sync (✅ **Now passes wallet context**)
- `read-only-account-manager.ts:170` - Address discovery (✅ **Now passes wallet context**)

**Status**: ✅ **Integrated** - Wallet context is now passed through managers.

---

### 5. `filterUsedAddresses()`
**Location**: `mobile/src/wallets/cardano/api/api.ts:208`
**Backend-Zero**: `GET /v0/wallets/{id}/paymentkeyhashes?used=true` ✅ (when wallet context provided)
**Legacy Fallback**: `POST /v2/addresses/filterUsed` ❌ (when no wallet context)

**Fallback Locations**:
- `api.ts:249` - When backend-zero request fails
- `api.ts:271` - When no wallet context provided

**Used In**:
- `account-manager.ts:400` - Address discovery (✅ **Now passes wallet context**)
- `read-only-account-manager.ts` - Address discovery (✅ **Now passes wallet context**)

**Status**: ✅ **Integrated** - Wallet context is now passed through managers.

---

## 🟢 Functions Using Backend-Zero (but via fetchDefault)

These functions use backend-zero endpoints but still use `fetchDefault` utility (which is fine).

### 6. `getTipStatus()`
**Location**: `mobile/src/wallets/cardano/api/api.ts:33`
**Backend-Zero**: `GET /v0/bestblock` ✅
**Status**: ✅ **Migrated** (uses `fetchDefault` but calls backend-zero endpoint)

**Used In**:
- `transactionManager.ts:282` - Transaction sync
- `read-only-account-manager.ts:152` - Address discovery

---

### 7. `fetchTxStatus()`
**Location**: `mobile/src/wallets/cardano/api/api.ts:519`
**Backend-Zero**: `GET /v0/transactions/{hash}` ✅
**Status**: ✅ **Migrated** (uses `fetchDefault` but calls backend-zero endpoint)

**Used In**:
- `cardano-wallet.ts:1171` - `wallet.fetchTxStatus()`

**Note**: Uses `fetchDefault` with backend-zero URL, which is correct.

---

### 8. `submitTransaction()`
**Location**: `mobile/src/wallets/cardano/api/api.ts:285`
**Backend-Zero**: `POST /v0/tx` ✅
**Status**: ✅ **Migrated** (uses direct `fetch` call, not `fetchDefault`)

**Used In**:
- `cardano-wallet.ts:1008` - `wallet.submitTransaction()`
- `cip30/cip30.ts:194` - CIP-30 interface

---

### 9. `getPoolInfo()`
**Location**: `mobile/src/wallets/cardano/api/api.ts:422`
**Backend-Zero**: `GET /v0/cexplorer-pool-list` ✅
**Status**: ✅ **Migrated** (uses direct `fetch` call)

**Used In**:
- `cardano-wallet.ts:1157` - `wallet.fetchPoolInfo()`
- `staking/pools/pool-info-api.ts` - Pool info API

---

## 📊 Summary

### Fully Migrated (No Legacy API)
- ✅ `getTipStatus()` - Uses backend-zero `/v0/bestblock`
- ✅ `submitTransaction()` - Uses backend-zero `/v0/tx`
- ✅ `fetchTxStatus()` - Uses backend-zero `/v0/transactions/{hash}`
- ✅ `getPoolInfo()` - Uses backend-zero `/v0/cexplorer-pool-list`
- ✅ `getUtxoData()` - Uses backend-zero `/v0/transactions/{hash}`

### Partially Migrated (Has Fallbacks)
- 🟡 `getAccountState()` - Uses backend-zero when wallet context provided, legacy otherwise
- 🟡 `fetchNewTxHistory()` - Uses backend-zero when wallet context provided, legacy otherwise
- 🟡 `filterUsedAddresses()` - Uses backend-zero when wallet context provided, legacy otherwise

### Not Migrated (Still Uses Legacy API)
- ❌ `checkServerStatus()` - No backend-zero equivalent
- ❌ `getFundInfo()` - Catalyst endpoint, not in backend-zero

---

## 🔍 Specific Issues

### 1. Transaction Recipes Not Using Wallet Context
**File**: `mobile/src/wallets/cardano/transaction-recipes/wallet-helpers.ts:133`

```typescript
getAccountState: (addresses) =>
  legacyApi.getAccountState(
    {addresses},
    params.networkManager.legacyApiBaseUrl,
    // ❌ Missing wallet context parameter
  ),
```

**Impact**: Always uses legacy API for account state in transaction building.

**Fix Needed**: Pass wallet context from wallet instance to transaction recipes.

---

### 2. Catalyst Fund Info Not Available
**File**: `mobile/src/wallets/cardano/api/api.ts:503`

**Issue**: Catalyst fund info endpoint (`/v0/catalyst/fundInfo/`) is not available in backend-zero.

**Options**:
1. Keep using legacy API for this endpoint
2. Request backend-zero team to add Catalyst endpoints
3. Remove feature if not needed

---

### 3. Server Status Check
**File**: `mobile/src/wallets/cardano/api/api.ts:26`

**Issue**: No backend-zero equivalent for `/status` endpoint.

**Options**:
1. Keep using legacy API for health checks
2. Use backend-zero root endpoint as health check
3. Remove health check feature

---

## 🎯 Migration Priority

### High Priority
1. **Fix transaction recipes** - Pass wallet context to `getAccountState()` calls
   - File: `transaction-recipes/wallet-helpers.ts`
   - Impact: Will use backend-zero for account state in transaction building

### Medium Priority
2. **Investigate Catalyst endpoints** - Determine if backend-zero will support Catalyst fund info
   - If not supported: Document as legacy-only feature
   - If supported: Request endpoint addition

### Low Priority
3. **Server status check** - Determine if health check is needed
   - If needed: Use backend-zero root endpoint or keep legacy
   - If not needed: Remove feature

---

## 📝 Notes

- All wallet-context-aware methods now properly pass context through managers ✅
- Fallbacks to legacy API are intentional and work correctly ✅
- `fetchDefault` utility is used for both legacy and backend-zero endpoints (this is fine) ✅
- Direct `fetch` calls are used for backend-zero endpoints that don't need the `fetchDefault` wrapper ✅

