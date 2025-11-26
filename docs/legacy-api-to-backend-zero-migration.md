# Legacy API to Backend-Zero Migration Guide

## Executive Summary

This document provides a detailed migration guide for replacing legacy API calls with backend-zero endpoints. It includes code changes, response transformations, and implementation strategies for each endpoint.

## Pool Info Consolidation & Staking Center WebView Replacement

### Current Pool Info Usage

Pool info is fetched in **5 different locations**:

1. **`PoolInfoApi` class** (`packages/staking/pools/pool-info-api.ts`):
   - `getManyChainPoolInfo()` - Uses legacy `POST /pool/info` ❌
   - `getSingleExplorerPoolInfo()` - Uses backend-zero `/cexplorer-pool-list` ✅
   - `getManyFullPoolInfo()` - Combines chain + explorer info

2. **`wallet.fetchPoolInfo()`** (`cardano-wallet.ts`):
   - Uses legacy API `POST /pool/info` ❌
   - Returns `StakePoolInfosAndHistories`

3. **`usePoolInfo` hook** (`src/features/Staking/hooks/usePoolInfo.ts`):
   - Uses `PoolInfoApi.getSingleFullPoolInfo()`
   - Combines chain + explorer info

4. **`useStakePoolInfoAndHistory`** (`src/features/Dashboard/ui/shared/StakePoolInfo.tsx`):
   - Uses both `wallet.fetchPoolInfo()` AND `PoolInfoApi.getSingleExplorerPoolInfo()`
   - Falls back to explorer info if chain info missing

5. **`usePoolTransition`** (`src/features/Staking/Staking/PoolTransition/usePoolTransition.tsx`):
   - Uses `PoolInfoApi.getTransition()`
   - Needs pool info for transition suggestions

### Staking Center WebView

**Current Implementation:**
- WebView loads: `https://adapools.yoroiwallet.com/?source=mobile&lang={lang}&bias={plate}`
- WebView sends pool hashes via `onMessage` handler
- User selects pool in webview, app receives hash

**Backend-Zero Options:**

1. **`GET /v0/cexplorer-pool-list`** - Cexplorer proxy (supports filtering)
   - Query params: `poolId`, `limit`, `order`, `name`
   - Returns: Cexplorer format with pool details
   - ✅ Already partially used in `PoolInfoApi.getSingleExplorerPoolInfo()`

2. **`GET /v0/pools/info`** - Backend-zero pool list
   - Query params: `pageSize`, `pageNumber`
   - Returns: Basic pool info with metadata
   - ❌ Doesn't support filtering by pool ID

### Migration Strategy

**Phase 1: Consolidate Pool Info Fetching**

1. **Replace chain pool info:**
   - Update `PoolInfoApi.getManyChainPoolInfoBatch()` to use backend-zero
   - **Problem**: Backend-zero `/pools/info` doesn't support filtering by pool IDs
   - **Solution**: Use `/cexplorer-pool-list` for individual queries OR request backend support

2. **Update wallet.fetchPoolInfo():**
   - Replace legacy API call with backend-zero
   - Use `/cexplorer-pool-list` for specific pool queries
   - Map response format to `StakePoolInfosAndHistories`

**Phase 2: Replace Staking Center WebView**

1. **Create native pool list component:**
   - Fetch pools from `GET /v0/cexplorer-pool-list?limit=100&order=ranking`
   - Display native list with:
     - Pool name/ticker
     - ROA (Return on ADA)
     - Saturation percentage
     - Stake amount
   - Implement pagination/infinite scroll

2. **Replace WebView in StakingCenter.tsx:**
   - Remove WebView component
   - Add native PoolList component
   - Handle pool selection natively (no message handler needed)
   - Navigate directly to delegation flow

**Benefits of Native Pool List:**
- ✅ Better UX (native feel, faster loading)
- ✅ No webview dependency
- ✅ Better offline handling
- ✅ Consistent with app design
- ✅ Easier to maintain

**Code Changes Required:**

1. **`packages/staking/pools/pool-info-api.ts`:**
   ```typescript
   // Replace getManyChainPoolInfoBatch() implementation
   // Use /cexplorer-pool-list for individual queries
   ```

2. **`src/wallets/cardano/cardano-wallet.ts`:**
   ```typescript
   // Replace fetchPoolInfo() to use backend-zero
   ```

3. **`src/features/Staking/Staking/StakingCenter/StakingCenter.tsx`:**
   ```typescript
   // Replace WebView with native PoolList component
   // Remove handleOnMessage, use native selection handler
   ```

4. **New component: `src/features/Staking/Staking/PoolList/PoolList.tsx`:**
   ```typescript
   // Native pool list component
   // Fetch from /cexplorer-pool-list
   // Display pool cards with selection
   ```

### Backend-Zero Endpoint Details

**`GET /v0/cexplorer-pool-list`:**
- **Query Parameters:**
  - `poolId` (optional): Filter by specific pool ID (hex hash)
  - `limit` (required): Number of results
  - `order` (required): 'asc' or 'desc'
  - `name` (optional): Filter by pool name
- **Response:** Cexplorer API format
- **Use Case:** Specific pool queries, pool list for staking center

**`GET /v0/pools/info`:**
- **Query Parameters:**
  - `pageSize` (optional, default: 10): Items per page
  - `pageNumber` (optional, default: 1): Page number
- **Response:** Array of pool info with metadata
- **Use Case:** Paginated pool list (if backend adds pool ID filtering)

**Recommendation:**
- Use `/cexplorer-pool-list` for all pool queries (already supports filtering)
- Request backend-zero to add pool ID filtering to `/pools/info` for future optimization

