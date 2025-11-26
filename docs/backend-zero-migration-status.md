# Backend-Zero Migration Status Report

## Executive Summary

This document provides a comprehensive status update on the migration from legacy API to backend-zero, including wallet registration details and endpoint explanations.

---

## ✅ Completed Migrations

### 1. **Core API Methods** (8/8 Complete)

| Method | Backend-Zero Endpoint | Status | Notes |
|--------|----------------------|--------|-------|
| `getTipStatus()` | `GET /v0/bestblock` | ✅ Complete | Maps response to legacy format |
| `submitTransaction()` | `POST /v0/tx` | ✅ Complete | Returns hash (discarded to match legacy) |
| `fetchTxStatus()` | `GET /v0/transactions/{hash}` | ✅ Complete | Infers status from transaction query |
| `getUtxoData()` | `GET /v0/transactions/{hash}` | ✅ Complete | Extracts output from transaction |
| `getPoolInfo()` | `GET /v0/cexplorer-pool-list` | ✅ Complete | Uses cexplorer proxy |
| `getAccountState()` | `GET /v0/wallets/{id}/rewards` | ✅ Complete | Requires wallet registration |
| `fetchNewTxHistory()` | `GET /v0/wallets/{id}/transactions` | ✅ Complete | Requires wallet registration |
| `filterUsedAddresses()` | `GET /v0/wallets/{id}/paymentkeyhashes?used=true` | ✅ Complete | Requires wallet registration |

### 2. **Pool Info Consolidation** (Complete)

- ✅ `PoolInfoApi.getManyChainPoolInfoBatch()` migrated to backend-zero
- ✅ `wallet.fetchPoolInfo()` migrated to backend-zero
- ✅ Native `PoolList` component created
- ✅ Staking Center WebView replaced with native component

### 3. **Code Cleanup** (Complete)

- ✅ `getFrontendFees` completely removed (not used by swap)

---

## 🔄 Wallet Registration

### What is Wallet Registration?

Backend-zero uses a **wallet-centric architecture** instead of the legacy API's address-centric approach. This means:

- **Legacy API**: Queries by addresses directly (`POST /account/state` with addresses)
- **Backend-Zero**: Requires wallets to be registered first, then queries by wallet ID

### When Does Registration Happen?

Wallet registration is **called automatically** when wallet-context-aware methods are invoked:

1. **`getAccountState()`** / `bulkGetAccountState()` - Called from `wallet.fetchAccountState()`
2. **`fetchNewTxHistory()`** - Called when fetching transaction history
3. **`filterUsedAddresses()`** - Called during address discovery

### Registration Frequency

**Current Implementation**: Registration happens **every time** these methods are called.

**Why**: The registration function is **idempotent** - it's safe to call multiple times:
- Returns `201` if wallet is created
- Returns `409` if wallet already exists
- Both status codes are treated as success

**Performance Impact**: Minimal - the registration call is lightweight and backend handles duplicates gracefully.

### Registration Data Structure

```typescript
{
  id: string                    // Wallet ID (hash of master public key)
  paymentKeyHashes: string[]   // Array of payment key hashes (from addresses)
  rewardAddresses: string[]    // Array of reward addresses (staking addresses)
  publicKey: string            // Master public key in hex
}
```

### Current Registration Flow

```typescript
// Example: getAccountState()
if (walletContext) {
  // 1. Register wallet (idempotent - safe to call every time)
  await registerWallet({
    id: walletContext.walletId,
    paymentKeyHashes: walletContext.paymentKeyHashes,
    rewardAddresses: walletContext.rewardAddresses,
    publicKey: walletContext.publicKeyHex,
  }, backendZeroUrl)
  
  // 2. Query wallet-specific endpoint
  const rewards = await fetch(`/v0/wallets/${walletId}/rewards`)
}
```

### Potential Optimization

**Future Enhancement**: We could cache registration status locally and only register once per wallet, but this is **not necessary** because:
- Registration is idempotent (409 = already exists)
- Backend handles duplicates efficiently
- Simpler code (no cache invalidation logic needed)
- Current approach is more resilient (works even if local cache is cleared)

---

## 📋 Wallets Endpoint Details

### `POST /v0/wallets` - Create Wallet

**Purpose**: Register a new wallet with backend-zero

**Request Body**:
```json
{
  "id": "cf5949db5bac66eebb7428985936fa84dd68b3635e36e8256fa61c0a",
  "paymentKeyHashes": ["abc123...", "def456..."],
  "rewardAddresses": ["e139ddd048f9ea44cfdf91e55daefc4304d41214151fb7f9179d8c5c41"],
  "publicKey": "hex-encoded-master-public-key"
}
```

**Responses**:
- `201 Created` - Wallet successfully created
- `409 Conflict` - Wallet ID already exists (treated as success - idempotent)
- `400 Bad Request` - Invalid request body

**Current Usage**: Called automatically before wallet-specific queries

### `GET /v0/wallets/{id}` - Get Wallet

**Purpose**: Retrieve wallet information

**Response**: Array of payment key hashes associated with the wallet

**Current Usage**: Not currently used (we have `isWalletRegistered()` helper but it's not called)

### `PATCH /v0/wallets/{id}` - Update Wallet

**Purpose**: Add new payment key hashes to an existing wallet

**Note**: Requires `x-signature` header (not currently implemented)

**Use Case**: When wallet discovers new addresses, they can be added to the registration

**Current Status**: Not implemented - we register with all known addresses upfront

### `DELETE /v0/wallets/{id}` - Delete Wallet

**Purpose**: Remove wallet registration

**Current Usage**: Not implemented (wallet deletion doesn't remove backend registration)

---

## ⚠️ Missing from Migration Plan

### 1. **Address Discovery Integration**

**Status**: ⚠️ **Partially Implemented**

- `filterUsedAddresses()` is migrated but **not integrated** into address discovery flow
- Account managers (`account-manager.ts`, `read-only-account-manager.ts`) still use legacy API
- These don't have wallet context, so they fall back to legacy API

**Action Needed**: 
- Pass wallet context through account managers
- Or create wallet-aware address discovery methods

### 2. **Transaction History Integration**

**Status**: ⚠️ **Partially Implemented**

- `fetchNewTxHistory()` is migrated but **not integrated** into transaction manager
- Transaction manager still uses legacy API for history fetching
- Needs wallet context to be passed through

**Action Needed**:
- Update transaction manager to use wallet-aware `fetchNewTxHistory()`

### 3. **Wallet Update on Address Discovery**

**Status**: ❌ **Not Implemented**

- When wallet discovers new addresses, backend-zero registration is not updated
- `PATCH /v0/wallets/{id}` endpoint exists but requires signature (not implemented)

**Impact**: Low - new addresses will still work, but backend-zero won't track them until next full registration

### 4. **Wallet Deletion**

**Status**: ❌ **Not Implemented**

- When wallet is deleted from app, backend-zero registration is not removed
- `DELETE /v0/wallets/{id}` endpoint exists but not called

**Impact**: Low - orphaned registrations don't cause issues, but cleanup would be nice

---

## 📊 Migration Coverage

### Fully Migrated (Using Backend-Zero)
- ✅ Tip status
- ✅ Transaction submission
- ✅ Transaction status checking
- ✅ UTXO data fetching
- ✅ Pool info (all locations)
- ✅ Account state (when wallet context provided)
- ✅ Transaction history (when wallet context provided)
- ✅ Used address filtering (when wallet context provided)

### Partially Migrated (Fallback to Legacy)
- ⚠️ Account state (falls back if no wallet context)
- ⚠️ Transaction history (falls back if no wallet context)
- ⚠️ Used address filtering (falls back if no wallet context)

### Not Migrated (Still Using Legacy)
- ❌ Address discovery (account managers)
- ❌ Transaction history (transaction manager)
- ❌ Wallet update on address discovery
- ❌ Wallet deletion cleanup

---

## 🎯 Next Steps

### High Priority
1. **Integrate wallet context into account managers**
   - Update `account-manager.ts` to pass wallet context
   - Update `read-only-account-manager.ts` if needed
   - Ensure address discovery uses backend-zero

2. **Integrate wallet context into transaction manager**
   - Update transaction manager to use wallet-aware `fetchNewTxHistory()`
   - Pass wallet context through transaction fetching flow

### Medium Priority
3. **Implement wallet update on address discovery**
   - Use `PATCH /v0/wallets/{id}` when new addresses are discovered
   - Requires signature implementation (see OpenAPI spec)

4. **Add wallet deletion cleanup**
   - Call `DELETE /v0/wallets/{id}` when wallet is removed
   - Ensure proper error handling

### Low Priority
5. **Optimize registration calls** (optional)
   - Cache registration status locally
   - Only register if not already registered
   - Not necessary but could reduce API calls

---

## 📝 Notes

### Why Wallet Registration?

Backend-zero's wallet-centric design provides:
- **Better performance**: Wallet data is pre-indexed
- **Simpler queries**: Query by wallet ID instead of address arrays
- **Future features**: Enables wallet-level analytics and features
- **Scalability**: More efficient for large wallets with many addresses

### Backward Compatibility

All migrated methods maintain **backward compatibility**:
- Accept optional `walletContext` parameter
- Fall back to legacy API if context not provided
- Allows gradual migration without breaking existing code

### Error Handling

Registration failures are handled gracefully:
- If registration fails, methods fall back to legacy API
- No user-facing errors - transparent fallback
- Logs errors for debugging

---

## Summary

**Migration Status**: ~85% Complete

- ✅ Core API methods migrated
- ✅ Pool info consolidated
- ✅ WebView replaced with native component
- ⚠️ Integration into account/transaction managers pending
- ❌ Wallet lifecycle management (update/delete) not implemented

**Wallet Registration**: Working as designed - idempotent, called automatically, safe to call multiple times.

