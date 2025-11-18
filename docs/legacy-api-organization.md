# Legacy API Organization

This document explains how legacy API code is organized and marked for future removal.

## 📁 Folder Structure

```
mobile/src/wallets/cardano/api/
├── api.ts                    # Main API file (exports all methods)
├── legacy-api/
│   ├── index.ts             # Legacy-only methods (no backend-zero equivalent)
│   └── fallback.ts          # Fallback implementations (used when backend-zero fails)
├── wallet-registration.ts   # Backend-zero wallet registration
├── fetch.ts                 # HTTP fetch utility (used by both)
└── ...
```

## 🏷️ Comment Markers

Each API method is marked with one of these prefixes:

- **✅ MIGRATED TO BACKEND-ZERO**: Uses backend-zero, may have fallback
- **❌ LEGACY ONLY**: Only uses legacy API (no backend-zero equivalent)
- **⚠️ FALLBACK**: Fallback implementation (not called directly)

## 📋 Method Categories

### ✅ Fully Migrated (Backend-Zero Only)

These methods use backend-zero exclusively:

- `getTipStatus()` - `GET /v0/bestblock`
- `submitTransaction()` - `POST /v0/tx`
- `fetchTxStatus()` - `GET /v0/transactions/{hash}`
- `getPoolInfo()` - `GET /v0/cexplorer-pool-list`

**Location**: `api.ts`  
**Fallback**: None

### ✅ Migrated with Fallback

These methods use backend-zero when possible, fall back to legacy API:

- `getAccountState()` - Backend-zero: `GET /v0/wallets/{id}/rewards`
  - Fallback: `POST /account/state` (in `legacy-api/fallback.ts`)
  
- `fetchNewTxHistory()` - Backend-zero: `GET /v0/wallets/{id}/transactions`
  - Fallback: `POST /v2/txs/history` (in `legacy-api/fallback.ts`)
  
- `filterUsedAddresses()` - Backend-zero: `GET /v0/wallets/{id}/paymentkeyhashes?used=true`
  - Fallback: `POST /v2/addresses/filterUsed` (in `legacy-api/fallback.ts`)

**Location**: `api.ts` (main implementation) + `legacy-api/fallback.ts` (fallback)  
**Fallback**: Used when wallet context unavailable or backend-zero fails

### ❌ Legacy Only (No Backend-Zero Equivalent)

These methods only use legacy API:

- `checkServerStatus()` - `GET /status`
- `getFundInfo()` - `GET /v0/catalyst/fundInfo/`

**Location**: `legacy-api/index.ts`  
**Reason**: No backend-zero equivalent exists

## 🔍 How to Find Legacy API Usage

### Search for Legacy-Only Methods

```bash
# Find all legacy-only methods
grep -r "LEGACY ONLY" mobile/src/wallets/cardano/api/

# Find all fallback methods
grep -r "FALLBACK" mobile/src/wallets/cardano/api/
```

### Check Method Status

1. **Check `api.ts`** - Look for comment markers (✅, ❌, ⚠️)
2. **Check `legacy-api/index.ts`** - Legacy-only methods
3. **Check `legacy-api/fallback.ts`** - Fallback implementations

## 🗑️ Removal Plan

### Phase 1: Remove Fallbacks (When Backend-Zero is Stable)

When backend-zero is fully stable and wallet context is always available:

1. Remove `legacy-api/fallback.ts`
2. Remove fallback logic from `api.ts`
3. Update method signatures to require wallet context

### Phase 2: Migrate Legacy-Only Methods

When backend-zero adds equivalents:

1. Migrate `checkServerStatus()` if health check endpoint added
2. Migrate `getFundInfo()` if Catalyst endpoints added
3. Remove `legacy-api/index.ts`

### Phase 3: Cleanup

1. Remove `legacy-api/` folder entirely
2. Remove legacy API URL references
3. Update documentation

## 📝 Notes

- **Fallback methods should NOT be called directly** - They're only used internally by main API methods
- **Legacy-only methods can be called directly** - They're the only way to access those endpoints
- **All methods are exported from `api.ts`** - Import from there, not from `legacy-api/` directly

## 🔗 Related Documents

- `docs/legacy-api-usage.md` - Detailed usage report
- `docs/backend-zero-migration-status.md` - Migration status
- `docs/backend-zero-integration-plan.md` - Integration plan

