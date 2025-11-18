# Backend-Zero Integration Plan

## Feature Flag: `useBackendZero`

A feature flag has been implemented to allow switching between backend-zero and legacy API implementations.

**Location**: `mobile/src/kernel/features.ts`  
**Default**: `useBackendZero: true`

### Behavior

- **When `useBackendZero: true`** (default):
  - Uses backend-zero endpoints when available
  - Falls back to legacy API (`legacy-api/fallback.ts`) if backend-zero fails or wallet context unavailable
  - This is the current production behavior

- **When `useBackendZero: false`**:
  - Bypasses backend-zero entirely
  - Uses complete legacy implementations from `legacy-api-preserved/api.ts`
  - No fallback logic needed (direct legacy calls)
  - Useful for rollback if backend-zero endpoints are untested or failing

### Implementation

All migrated API methods in `mobile/src/wallets/cardano/api/api.ts` check the feature flag at the start:
- If flag is `false`, route directly to `legacy-api-preserved/api.ts`
- If flag is `true`, use backend-zero with fallback to `legacy-api/fallback.ts`

### Rollback Procedure

To rollback to legacy API:
1. Set `useBackendZero: false` in `mobile/src/kernel/features.ts`
2. Restart the app
3. All API calls will use legacy endpoints directly

---

# Backend-Zero Integration Plan

## 1. Memory Cache for Wallet Registration

### Current Problem
- Registration is called every time wallet-context-aware methods are invoked
- Can spam the endpoint unnecessarily

### Solution: In-Memory Cache

**Implementation Location**: `mobile/src/wallets/cardano/api/wallet-registration.ts`

```typescript
// Simple in-memory cache: Map<walletId, Set<backendZeroUrl>>
const registrationCache = new Map<string, Set<string>>()

export const registerWallet = async (
  walletData: WalletRegistrationData,
  backendZeroUrl: string,
): Promise<boolean> => {
  const cacheKey = `${walletData.id}:${backendZeroUrl}`
  
  // Check cache first
  if (registrationCache.has(walletData.id)) {
    const registeredUrls = registrationCache.get(walletData.id)!
    if (registeredUrls.has(backendZeroUrl)) {
      return true // Already registered in this session
    }
  }
  
  try {
    const response = await fetch(`${backendZeroUrl}/v0/wallets`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        id: walletData.id,
        paymentKeyHashes: walletData.paymentKeyHashes,
        rewardAddresses: walletData.rewardAddresses,
        publicKey: walletData.publicKey,
      }),
    })

    if (response.status === 201 || response.status === 409) {
      // Cache successful registration
      if (!registrationCache.has(walletData.id)) {
        registrationCache.set(walletData.id, new Set())
      }
      registrationCache.get(walletData.id)!.add(backendZeroUrl)
      return true
    }
    return false
  } catch {
    return false
  }
}

// Optional: Clear cache on wallet deletion (if needed)
export const clearRegistrationCache = (walletId: string) => {
  registrationCache.delete(walletId)
}
```

**Benefits**:
- Reduces API calls within same session
- No persistence needed (memory-only)
- Simple implementation
- Cache cleared on app restart

---

## 2. Read-Only Wallet Support

### Current Situation
- Read-only wallets have:
  - `accountPubKeyHex` (optional - might not exist for single-address wallets)
  - `id` (wallet ID exists)
  - Addresses (can be single address or list)
  - May not have `publicKeyHex` (master public key)

### Problem
- Wallet registration requires `publicKey` (master public key)
- Read-only wallets might only have `accountPubKeyHex` (account-level key)
- Single-address read-only wallets might not have any public key

### Solution: Conditional Registration

**For Read-Only Wallets**:
1. **If `accountPubKeyHex` exists**: Use it as `publicKey` (not ideal but works)
2. **If only addresses exist (no public key)**: 
   - Use wallet `id` as `publicKey` (it's a hex string, passes pattern validation)
   - **Note**: `publicKey` is only used for signature verification in PATCH endpoint
   - Since PATCH won't be implemented, any hex string works for our use case
   - This allows read-only wallets to use backend-zero endpoints

**Implementation**:
```typescript
export const canRegisterWallet = (wallet: {
  id: string
  publicKeyHex?: string
  accountPubKeyHex?: string
  externalAddresses: string[]
  internalAddresses: string[]
}): boolean => {
  // Can register if we have:
  // 1. Wallet ID (required, also used as publicKey fallback)
  // 2. At least one address (to extract payment key hashes)
  // NOTE: publicKey field can be wallet ID if no public key available
  // This works because PATCH won't be implemented (no signature verification needed)
  return !!(
    wallet.id &&
    (wallet.externalAddresses.length > 0 || wallet.internalAddresses.length > 0)
  )
}

export const getWalletRegistrationData = (wallet: {
  id: string
  publicKeyHex?: string
  accountPubKeyHex?: string
  externalAddresses: string[]
  internalAddresses: string[]
  rewardAddressHex?: string
}): WalletRegistrationData | null => {
  if (!canRegisterWallet(wallet)) {
    return null
  }

  const allAddresses = [...wallet.externalAddresses, ...wallet.internalAddresses]
  const paymentKeyHashes = extractPaymentKeyHashes(allAddresses)
  const rewardAddresses = wallet.rewardAddressHex ? [wallet.rewardAddressHex] : []
  
  // Use publicKeyHex if available, otherwise accountPubKeyHex, otherwise wallet ID
  // NOTE: publicKey is only used for signature verification in PATCH endpoint.
  // Since PATCH won't be implemented, any hex string works for our use case.
  // For read-only wallets without a proper public key, we use wallet ID.
  const publicKey = wallet.publicKeyHex || wallet.accountPubKeyHex || wallet.id

  return {
    id: wallet.id,
    paymentKeyHashes,
    rewardAddresses,
    publicKey,
  }
}
```

**Fallback Strategy**:
- If wallet can't be registered (no public key), methods fall back to legacy API
- This is transparent to the user

---

## 3. Code Location: Not in API Package

### Current Location
- **Wallet-specific API**: `mobile/src/wallets/cardano/api/`
- **Not in**: `mobile/packages/api/` (that's for generic API utilities)

### Why?
- Wallet registration is wallet-specific logic
- It requires wallet context (ID, addresses, public keys)
- It's part of the wallet implementation, not a generic API utility

### This is Correct ✅
- Keep wallet registration in `mobile/src/wallets/cardano/api/`
- Keep generic API utilities in `mobile/packages/api/`

---

## 4. Integration Plan with Managers

### 4.1 Account Manager Integration

**Current State**:
- `account-manager.ts` calls `filterUsedAddresses()` without wallet context
- `read-only-account-manager.ts` calls `fetchNewTxHistory()` without wallet context
- Both fall back to legacy API

**Solution**: Pass wallet context through account managers

#### Step 1: Update Account Manager Interface

```typescript
// account-manager.ts
export type AccountManager = {
  // ... existing methods ...
  filterUsedAddresses: (
    addresses: string[],
    baseApiUrl: string,
    walletContext?: WalletContext, // Add optional wallet context
  ) => Promise<string[]>
}

type WalletContext = {
  walletId: string
  publicKeyHex?: string
  accountPubKeyHex?: string
  paymentKeyHashes: string[]
  rewardAddresses: string[]
}
```

#### Step 2: Update Account Manager Implementation

```typescript
// In account-manager.ts
async filterUsedAddresses(
  addresses: string[],
  baseApiUrl: string,
  walletContext?: WalletContext,
): Promise<string[]> {
  return legacyApi.filterUsedAddresses(
    addresses,
    baseApiUrl,
    walletContext, // Pass through
  )
}
```

#### Step 3: Update CardanoWallet to Pass Context

```typescript
// cardano-wallet.ts
async filterUsedAddresses(addresses: string[]): Promise<string[]> {
  const walletContext = this.getWalletContext() // New helper method
  return this.accountManager.filterUsedAddresses(
    addresses,
    this.networkManager.legacyApiBaseUrl,
    walletContext,
  )
}

private getWalletContext(): WalletContext | undefined {
  // Only return context if wallet can be registered
  const registrationData = getWalletRegistrationData({
    id: this.id,
    publicKeyHex: this.publicKeyHex,
    accountPubKeyHex: this.accountPubKeyHex, // For read-only
    externalAddresses: this.externalAddresses,
    internalAddresses: this.internalAddresses,
    rewardAddressHex: this.rewardAddressHex,
  })
  
  if (!registrationData) return undefined
  
  return {
    walletId: registrationData.id,
    publicKeyHex: this.publicKeyHex,
    accountPubKeyHex: this.accountPubKeyHex,
    paymentKeyHashes: registrationData.paymentKeyHashes,
    rewardAddresses: registrationData.rewardAddresses,
  }
}
```

#### Step 4: Update Read-Only Account Manager

```typescript
// read-only-account-manager.ts
async discoverAddresses(): Promise<void> {
  // ... existing discovery logic ...
  
  // When calling fetchNewTxHistory, pass wallet context if available
  const walletContext = this.getWalletContext() // If accountPubKeyHex exists
  const response = await legacyApi.fetchNewTxHistory(
    payload,
    baseApiUrl,
    walletContext, // Pass context
  )
}
```

### 4.2 Transaction Manager Integration

**Current State**:
- `transactionManager.ts` calls `fetchNewTxHistory()` without wallet context
- Falls back to legacy API

**Solution**: Pass wallet context through transaction manager

#### Step 1: Update Transaction Manager Interface

```typescript
// transactionManager.ts
type SyncParams = {
  api: Pick<typeof yoroiApi, 'getTipStatus' | 'fetchNewTxHistory'>
  baseApiUrl: string
  walletContext?: WalletContext // Add optional wallet context
  // ... other params
}
```

#### Step 2: Update Sync Method

```typescript
// In transactionManager.ts
async sync(params: SyncParams) {
  // ... existing sync logic ...
  
  const response = await params.api.fetchNewTxHistory(
    historyPayload,
    params.baseApiUrl,
    params.walletContext, // Pass context
  )
}
```

#### Step 3: Update CardanoWallet Sync Call

```typescript
// cardano-wallet.ts
async sync() {
  const walletContext = this.getWalletContext()
  
  await this.transactionManager.sync({
    api: {
      getTipStatus: legacyApi.getTipStatus,
      fetchNewTxHistory: legacyApi.fetchNewTxHistory,
    },
    baseApiUrl: this.networkManager.legacyApiBaseUrl,
    walletContext, // Pass context
    // ... other params
  })
}
```

---

## 5. Wallet Update (PATCH) - Not Needed

### What PATCH Does
- Adds new payment key hashes to existing wallet registration
- Used when wallet discovers new addresses

### Why We Don't Need It

1. **We register with all known addresses upfront**
   - When wallet is created/loaded, we register with all current addresses
   - New addresses discovered later are rare

2. **Signature requirement is bad UX**
   - Requires signing every update
   - Doesn't work with read-only wallets
   - Adds complexity

3. **Fallback works fine**
   - If new addresses aren't registered, methods fall back to legacy API
   - This is transparent and works correctly

### Recommendation: Skip PATCH Implementation ✅
- Don't implement `PATCH /v0/wallets/{id}`
- Register once with all known addresses
- If new addresses are discovered, they'll work via legacy API fallback
- This is simpler and better UX

---

## 6. Avoid Double Mapping

### Current Problem
- Backend-zero responses → `RawTransaction` → `ModernUtxo`
- Should be: Backend-zero responses → `ModernUtxo` directly

### Solution: Map Directly to Modern Types

**For Transactions**:
```typescript
// Instead of mapping to RawTransaction, map directly to WalletTransaction or ModernUtxo
// But wait - transactions aren't UTXOs, so this doesn't apply here

// For UTXO data:
// getUtxoData() already maps directly to Api.Cardano.UtxoData format
// Which is then converted to ModernUtxo elsewhere
// This is correct ✅
```

**For Transaction History**:
- `fetchNewTxHistory()` returns `RawTransaction[]`
- This is correct because:
  - `RawTransaction` is the expected format for transaction history
  - It's converted to `WalletTransaction` by transaction manager
  - Not double mapping ✅

**For UTXO Data**:
- `getUtxoData()` returns `Api.Cardano.UtxoData`
- This is converted to `ModernUtxo` via `rawUtxoToModernUtxo()`
- This is correct - single mapping ✅

### Verification Needed
- Check if any backend-zero responses are mapped to legacy format, then to modern format
- If found, map directly to modern format

---

## 7. Implementation Checklist

### Phase 1: Memory Cache
- [ ] Add in-memory cache to `registerWallet()`
- [ ] Test cache hit/miss behavior
- [ ] Verify cache doesn't persist across app restarts

### Phase 2: Read-Only Wallet Support
- [ ] Add `canRegisterWallet()` helper
- [ ] Add `getWalletRegistrationData()` helper
- [ ] Update registration to handle read-only wallets
- [ ] Test with single-address read-only wallet
- [ ] Test with multi-address read-only wallet

### Phase 3: Account Manager Integration
- [ ] Add `WalletContext` type
- [ ] Update `AccountManager` interface
- [ ] Update `account-manager.ts` implementation
- [ ] Update `read-only-account-manager.ts` implementation
- [ ] Add `getWalletContext()` to `CardanoWallet`
- [ ] Update `filterUsedAddresses()` calls

### Phase 4: Transaction Manager Integration
- [ ] Update `TransactionManager.sync()` to accept `walletContext`
- [ ] Update `CardanoWallet.sync()` to pass context
- [ ] Test transaction history fetching

### Phase 5: Verification
- [ ] Verify no double mapping occurs
- [ ] Test all wallet types (full, read-only, single-address)
- [ ] Verify fallback to legacy API works
- [ ] Performance test (cache reduces API calls)

---

## Summary

1. **Memory Cache**: Simple Map-based cache per session ✅
2. **Read-Only Wallets**: Conditional registration, fallback to legacy ✅
3. **Code Location**: Correct (wallet-specific API) ✅
4. **Manager Integration**: Pass wallet context through interfaces ✅
5. **Wallet Update**: Skip - not needed ✅
6. **Double Mapping**: Verify and fix if needed ✅

