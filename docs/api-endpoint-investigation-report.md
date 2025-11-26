# API Endpoint Investigation Report

**Generated:** 2024  
**Scope:** Comprehensive analysis of API endpoints across legacy backend, backend-zero, extension, and mobile app (develop and mobile-experimental branches)

---

## Executive Summary

This report documents all API endpoints used across the Yoroi ecosystem, including:
- **Legacy Backend**: The original reliable backend service
- **Backend-Zero**: New backend with less testing and features
- **Extension**: Browser extension client
- **Mobile (develop)**: Mobile app on develop branch
- **Mobile (mobile-experimental)**: Mobile app on mobile-experimental branch with additional migrations

### Key Findings

- **Total Endpoints Documented**: 50+
- **Fully Migrated to Backend-Zero**: 8 endpoints
- **Partially Migrated (with fallback)**: 3 endpoints
- **Legacy Only (no backend-zero equivalent)**: 10+ endpoints
- **Backend-Zero Only (not in legacy)**: 15+ endpoints

---

## 1. Core Wallet Operations

### 1.1 Account State / Rewards

#### `POST /api/account/state` (Legacy)
- **Backend**: Legacy only
- **Used by Extension**: ✅ Yes (`remoteFetcher.js:386`)
- **Used by Mobile (develop)**: ✅ Yes (`legacy-api-preserved/api.ts:79`)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (fallback only, `api.ts:500`)
- **Backend-Zero Equivalent**: `GET /v0/wallets/{id}/rewards`
- **Return Type**: `AccountStateResponse` - Object mapping addresses to `{remainingAmount: string, rewards: string, withdrawals: string}`
- **Migration Status**: ⚠️ **Partially Migrated** - Uses backend-zero when wallet context provided, falls back to legacy
- **Differences**:
  - Legacy: Address-centric (POST with addresses array)
  - Backend-Zero: Wallet-centric (GET by wallet ID, requires registration)
  - Backend-Zero returns array of rewards per address, needs mapping to legacy format
  - Backend-Zero combines spendable + nonSpendable for total rewards

#### `GET /v0/wallets/{id}/rewards` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ✅ Yes (`api.ts:456`)
- **Return Type**: `Array<{spendable: string, nonSpendable: string, withdrawals: string, address: string}>`
- **Migration Notes**: Requires wallet registration first. Returns per-address rewards array.

#### `POST /api/account/rewardHistory` (Legacy)
- **Backend**: Legacy only
- **Used by Extension**: ✅ Yes (`remoteFetcher.js:320`)
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ❌ No
- **Backend-Zero Equivalent**: ❌ None
- **Return Type**: `RewardHistoryResponse`
- **Migration Status**: ❌ **Not Migrated**

---

### 1.2 Transaction History

#### `POST /api/v2/txs/history` (Legacy)
- **Backend**: Legacy only
- **Used by Extension**: ✅ Yes (`remoteFetcher.js:156`)
- **Used by Mobile (develop)**: ✅ Yes (`legacy-api-preserved/api.ts:37`)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (fallback only, `api.ts:267`)
- **Backend-Zero Equivalent**: `GET /v0/wallets/{id}/transactions`
- **Return Type**: `Array<RawTransaction>` with fields: `type`, `hash`, `block_hash`, `block_num`, `time`, `tx_state`, `inputs`, `outputs`, `fee`, `certificates`, `withdrawals`
- **Migration Status**: ⚠️ **Partially Migrated**
- **Differences**:
  - Legacy: POST with addresses and pagination cursor
  - Backend-Zero: GET by wallet ID with cursor query params (`block`, `tx`)
  - Backend-Zero returns simplified transaction format, needs mapping to legacy `RawTransaction`
  - Backend-Zero uses `when` (ISO date) vs legacy `time` field
  - Backend-Zero amounts use `$lovelaces` key vs legacy string amounts
  - Backend-Zero doesn't provide `block_num` or `tx_ordinal`

#### `GET /v0/wallets/{id}/transactions` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ✅ Yes (`api.ts:137`)
- **Return Type**: `Array<Tx>` with fields: `hash`, `block`, `inputs`, `outputs`, `fee`, `certificates`, `withdrawals`, `when`
- **Migration Notes**: Requires wallet registration. Uses cursor-based pagination with `block` and `tx` query params.

#### `POST /api/v2/txs/get` (Legacy)
- **Backend**: Legacy only
- **Used by Extension**: ✅ Yes (`remoteFetcher.js:244`)
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ❌ No
- **Backend-Zero Equivalent**: `GET /v0/transactions/{hash}` (individual queries)
- **Return Type**: `Object<txHash, RemoteTransaction>`
- **Migration Status**: ❌ **Not Migrated** (but backend-zero equivalent exists)

#### `POST /api/v2.1/txs/summaries` (Legacy)
- **Backend**: Legacy only
- **Used by Extension**: ✅ Yes (`remoteFetcher.js:228`)
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ❌ No
- **Backend-Zero Equivalent**: ❌ None
- **Return Type**: `GetRecentTransactionHashesResponse`
- **Migration Status**: ❌ **Not Migrated**

---

### 1.3 Address Filtering

#### `POST /api/v2/addresses/filterUsed` (Legacy)
- **Backend**: Legacy only
- **Used by Extension**: ✅ Yes (`remoteFetcher.js:366`)
- **Used by Mobile (develop)**: ✅ Yes (`legacy-api-preserved/api.ts:53`)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (fallback only, `api.ts:355`)
- **Backend-Zero Equivalent**: `GET /v0/wallets/{id}/paymentkeyhashes?used=true`
- **Return Type**: `Array<string>` (array of used addresses)
- **Migration Status**: ⚠️ **Partially Migrated**
- **Differences**:
  - Legacy: POST with addresses array, returns used addresses
  - Backend-Zero: GET by wallet ID, returns payment key hashes (not addresses)
  - Mobile code maps payment key hashes back to addresses using `getSpendingKey()`

#### `GET /v0/wallets/{id}/paymentkeyhashes` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ✅ Yes (`api.ts:330`)
- **Return Type**: `Array<string>` (array of payment key hashes)
- **Query Params**: `used` (boolean, default: false)
- **Migration Notes**: Returns key hashes, not addresses. Requires address-to-hash conversion.

---

### 1.4 UTXO Operations

#### `POST /api/txs/utxoForAddresses` (Legacy)
- **Backend**: Legacy only
- **Used by Extension**: ✅ Yes (`remoteFetcher.js:125`)
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ❌ No
- **Backend-Zero Equivalent**: `GET /v0/wallets/{id}/utxos`
- **Return Type**: `AddressUtxoResponse` - Array of UTXOs with `receiver`, `amount`, `assets`
- **Migration Status**: ❌ **Not Migrated**

#### `GET /v0/wallets/{id}/utxos` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ❌ No
- **Return Type**: `Array<UTXO>` with fields: `blockHash`, `txHash`, `amount`, `address`, `index`, `datumHash`
- **Migration Notes**: Requires wallet registration. Supports cursor-based pagination.

#### `GET /api/txs/io/{txHash}/o/{txIndex}` (Legacy)
- **Backend**: Legacy only
- **Used by Extension**: ✅ Yes (`remoteFetcher.js:526`)
- **Used by Mobile (develop)**: ✅ Yes (via `getUtxoData`, calls legacy endpoint directly)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (via `getUtxoData`, calls backend-zero and maps)
- **Backend-Zero Equivalent**: `GET /v0/transactions/{hash}` (extract output)
- **Return Type**: `Api.Cardano.UtxoData` - UTXO output data in standardized format
- **Migration Status**: ✅ **Migrated** (mobile-experimental uses backend-zero `/transactions/{hash}` and extracts output)
- **Differences**:
  - **Develop branch**: Calls legacy endpoint directly which returns `Api.Cardano.UtxoData` format - no mapping needed
  - **Mobile-experimental branch**: Calls backend-zero `/transactions/{hash}`, extracts output, then maps to `Api.Cardano.UtxoData` format
  - **Why mapping?**: The `getUtxoData` function is part of `Api.Cardano.Api` interface which returns `Api.Cardano.UtxoData`. Consuming code (e.g., `useFormattedTx.tsx`, `toRawUtxo()`) expects this type. The mapping maintains compatibility with this interface - it's not about matching legacy backend format, but maintaining the API contract.
  - Backend-Zero returns full transaction object with different structure (`amount` as object with `$lovelaces` key vs string, different field names)

#### `GET /v0/transactions/{hash}` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ✅ Yes (`api.ts:654`, `utxo-data.ts:41`)
- **Return Type**: `Tx` object with full transaction details
- **Migration Notes**: Used for both transaction status and UTXO data extraction.

#### `GET /v0/wallets/{id}/spentoutputs` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ❌ No
- **Return Type**: `Array<OutputIdentifier>` - Outputs spent after cursor
- **Migration Notes**: Requires wallet registration and cursor. Not yet used by clients.

---

### 1.5 Transaction Submission

#### `POST /api/txs/signed` (Legacy)
- **Backend**: Legacy only
- **Used by Extension**: ✅ Yes (`remoteFetcher.js:82`)
- **Used by Mobile (develop)**: ✅ Yes (`legacy-api-preserved/api.ts:68`)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (fallback only, `api.ts:370`)
- **Backend-Zero Equivalent**: `POST /v0/tx`
- **Return Type**: `{txId: string}` (extension), `void` (mobile)
- **Migration Status**: ✅ **Migrated** (mobile uses backend-zero)
- **Differences**:
  - Legacy: POST with `{signedTx: string[]}` (base64 encoded)
  - Backend-Zero: POST with JSON string (CBOR hex)
  - Backend-Zero returns hash but mobile discards it to match legacy interface

#### `POST /v0/tx` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ✅ Yes (`api.ts:377`)
- **Return Type**: Transaction hash (string)
- **Migration Notes**: Accepts JSON string body with CBOR hex transaction.

---

### 1.6 Transaction Status

#### `POST /api/tx/status` (Legacy)
- **Backend**: Legacy only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ✅ Yes (`legacy-api-preserved/api.ts:128`)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (fallback only, `api.ts:644`)
- **Backend-Zero Equivalent**: `GET /v0/transactions/{hash}` (infer status)
- **Return Type**: `TxStatusResponse` with `submissionStatus` and optional `depth`
- **Migration Status**: ✅ **Migrated**
- **Differences**:
  - Legacy: POST with `{txHashes: string[]}`, returns status per hash
  - Backend-Zero: GET individual transactions, infer status from `block` field presence
  - Backend-Zero: `block` present = SUCCESS, no `block` = WAITING, 404 = WAITING
  - Legacy provides depth calculation, backend-zero doesn't

#### `POST /api/v2.1/tx/status` (Legacy)
- **Backend**: Legacy only
- **Used by Extension**: ✅ Yes (`remoteFetcher.js:302`)
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ❌ No
- **Backend-Zero Equivalent**: ❌ None
- **Return Type**: `{slot: Object<txHash, slot>}`
- **Migration Status**: ❌ **Not Migrated**

---

## 2. Blockchain Data

### 2.1 Best Block / Tip Status

#### `GET /api/v2/bestblock` (Legacy)
- **Backend**: Legacy only
- **Used by Extension**: ✅ Yes (`remoteFetcher.js:340`)
- **Used by Mobile (develop)**: ✅ Yes (`legacy-api-preserved/api.ts:31` via `/v2/tipStatus`)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (fallback only, `api.ts:50`)
- **Backend-Zero Equivalent**: `GET /v0/bestblock`
- **Return Type**: `BestBlockResponse` with `safeBlock` and `bestBlock` objects
- **Migration Status**: ✅ **Migrated**
- **Differences**:
  - Legacy: Returns separate `safeBlock` and `bestBlock` (may differ)
  - Backend-Zero: Returns single block object
  - Mobile maps backend-zero response to both `safeBlock` and `bestBlock` (same data)

#### `GET /api/v2/tipStatus` (Legacy)
- **Backend**: Legacy only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ✅ Yes (`legacy-api-preserved/api.ts:31`)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (fallback only)
- **Backend-Zero Equivalent**: `GET /v0/bestblock`
- **Return Type**: `TipStatusResponse` (same as bestblock)
- **Migration Status**: ✅ **Migrated** (uses same backend-zero endpoint)

#### `GET /v0/bestblock` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ✅ Yes (`api.ts:55`)
- **Return Type**: `{hash: string, height: number, epoch: number, slot: number, globalSlot: number}`
- **Migration Notes**: Returns single block (not separate safe/best).

---

### 2.2 Blocks

#### `GET /v0/blocks` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ❌ No
- **Return Type**: `Array<Block>` with `hash` and `height`
- **Query Params**: `from` (number), `to` (number) - required

#### `GET /v0/blocks/{hash}/cbor` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ❌ No
- **Return Type**: Block CBOR (string)

#### `POST /api/v2.1/lastBlockBySlot` (Legacy)
- **Backend**: Legacy only
- **Used by Extension**: ✅ Yes (`remoteFetcher.js:549`)
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ❌ No
- **Backend-Zero Equivalent**: ❌ None
- **Return Type**: `{blockHashes: Object<slot, blockHash>}`
- **Migration Status**: ❌ **Not Migrated**

---

### 2.3 Protocol Parameters

#### `GET /v0/protocolparameters` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ✅ Yes (via `cardano-api-maker.ts`)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (via `cardano-api-maker.ts`)
- **Return Type**: `ProtocolParameters` object with all Cardano protocol parameters
- **Migration Notes**: Not available in legacy API.

#### `GET /v0/protocolparameters/costmodels` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ❌ No
- **Return Type**: Base64 encoded cost models (string)

---

## 3. Staking & Governance

### 3.1 Pool Information

#### `POST /api/pool/info` (Legacy)
- **Backend**: Legacy only
- **Used by Extension**: ✅ Yes (`remoteFetcher.js:406`)
- **Used by Mobile (develop)**: ✅ Yes (`legacy-api-preserved/api.ts:97`)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (fallback only, `api.ts:545`)
- **Backend-Zero Equivalent**: `GET /v0/cexplorer-pool-list` or `GET /v0/pools/info`
- **Return Type**: `StakePoolInfosAndHistories` - Object mapping pool IDs to `{info: {...}, history: [...]}`
- **Migration Status**: ✅ **Migrated** (mobile uses backend-zero)
- **Differences**:
  - Legacy: POST with `{poolIds: string[]}`, returns pool info + history
  - Backend-Zero: Uses cexplorer proxy (`/cexplorer-pool-list`) for individual queries
  - Backend-Zero doesn't provide history (returns empty array)
  - Backend-Zero cexplorer format differs from legacy format

#### `GET /v0/cexplorer-pool-list` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ✅ Yes (`api.ts:561`)
- **Return Type**: Cexplorer API format with nested `data.data` array
- **Query Params**: `poolId` (optional), `limit` (required), `order` (required: 'asc'|'desc'), `name` (optional)
- **Migration Notes**: Proxy to Cexplorer API. Used for pool queries in mobile.

#### `GET /v0/pools/info` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ❌ No
- **Return Type**: `Array<PoolInfo>` with `id`, `rewardAccount`, `margin`, `costs`, `pledge`, `metadataHash`, `metadata`
- **Query Params**: `pageSize` (default: 10), `pageNumber` (default: 1)
- **Migration Notes**: Doesn't support filtering by pool IDs (unlike legacy).

#### `POST /api/v2.1/pools/poolTransitionInfo` (Legacy)
- **Backend**: Legacy only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ✅ Yes (`legacy-api-preserved/api.ts:114`)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (`legacy-api-preserved/api.ts:114`)
- **Backend-Zero Equivalent**: ❌ None
- **Return Type**: `{new: {...}, old: {...}, saturationThreshold?: number}` or `null`
- **Migration Status**: ❌ **Not Migrated**

---

### 3.2 Stake Key & DRep State

#### `GET /stakekeys/{stakeKeyHash}/state` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ✅ Yes (via `@yoroi/staking/governance` package, `governanceApiMaker`, `api.ts:55`, `config.ts:14`)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (via `@yoroi/staking/governance` package, `governanceApiMaker`, `api.ts:55`, `config.ts:14`)
- **Return Type**: `StakeKeyState` - Object with optional `drepDelegation` containing tx, epoch, slot, drep info
- **Migration Notes**: Used for governance features to check stake key delegation state. Called via `governanceApi.getStakingKeyState(stakeKeyHash)`. Not available in legacy API.

#### `GET /dreps/{drepId}/state` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ✅ Yes (via `@yoroi/staking/governance` package, `governanceApiMaker`, `api.ts:29`, `config.ts:15`)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (via `@yoroi/staking/governance` package, `governanceApiMaker`, `api.ts:29`, `config.ts:15`)
- **Return Type**: `DRepState` - Object with optional `registration` and `deregistration` info (tx, epoch, slot, deposit, anchor)
- **Migration Notes**: Used for governance features to check DRep registration state. Called via `governanceApi.getDRepById(drepId)`. Not available in legacy API.

#### `GET /v0/dreps/active` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ❌ No
- **Return Type**: `DrepInfo` object
- **Query Params**: `pageSize` (required), `page` (required)

---

### 3.3 Catalyst

#### `GET /api/v0/catalyst/fundInfo` (Legacy)
- **Backend**: Legacy only
- **Used by Extension**: ✅ Yes (`remoteFetcher.js:472`)
- **Used by Mobile (develop)**: ✅ Yes (`legacy-api/index.ts:35`)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (`legacy-api/index.ts:35`)
- **Backend-Zero Equivalent**: ❌ None
- **Return Type**: `FundInfoResponse` / `CatalystRoundInfoResponse`
- **Migration Status**: ❌ **Not Migrated** - No backend-zero equivalent

#### `GET /api/v0/catalyst/fundInfo/` (Legacy - Testnet variant)
- **Backend**: Legacy only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ✅ Yes (`legacy-api/index.ts:35` with `/api/` prefix for testnets)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (`legacy-api/index.ts:35`)
- **Migration Notes**: Same endpoint with different path prefix for testnets.

---

## 4. Token & Asset Operations

### 4.1 Token Information

#### `GET /metadata/{tokenId}` (Token Info Service)
- **Backend**: Separate Token Info Service (not legacy or backend-zero)
- **Used by Extension**: ✅ Yes (`remoteFetcher.js:427`)
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ❌ No
- **Return Type**: Token metadata object with `name`, `decimals`, `ticker`, `logo`
- **Migration Notes**: Separate service, not part of main backend migration.

#### `GET /tokens/info/{tokenId}` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ✅ Yes (via `@yoroi/portfolio` package, `portfolioApiMaker`, `api-maker.ts:139`)
- **Used by Mobile (develop)**: ✅ Yes (via `@yoroi/portfolio` package, `portfolioApiMaker`, `api-maker.ts:139`)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (via `@yoroi/portfolio` package, `portfolioApiMaker`, `api-maker.ts:139`)
- **Return Type**: `TokenInfo` object
- **Migration Notes**: Used by portfolio package for fetching individual token information. Called via `tokenManager.api.tokenInfo(id)` throughout both mobile app and extension.

#### `POST /tokens/info/multi` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ✅ Yes (via `@yoroi/portfolio` package, `portfolioApiMaker`, `api-maker.ts:90`, `build-token-manager.ts:29`)
- **Used by Mobile (develop)**: ✅ Yes (via `@yoroi/portfolio` package, `portfolioApiMaker`, `api-maker.ts:90`)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (via `@yoroi/portfolio` package, `portfolioApiMaker`, `api-maker.ts:90`)
- **Return Type**: Object mapping token IDs to `[statusCode, TokenInfo | error, ...]` arrays (Dullahan API format)
- **Migration Notes**: Batch token info endpoint. Used by portfolio package's `tokenManager.sync()` for efficient batch fetching of multiple token infos. Supports caching via ETag/hash mechanism. Extension uses it via `usePortfolioTokenInfo.ts` hook.

---

### 4.2 NFT Operations

#### `GET /tokens/nft/traits/{tokenId}` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No (extension doesn't have NFT details screen with traits)
- **Used by Mobile (develop)**: ✅ Yes (via `@yoroi/portfolio` package, `portfolioApiMaker`, `api-maker.ts:183`)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (via `@yoroi/portfolio` package, `portfolioApiMaker`, `api-maker.ts:183`)
- **Return Type**: `NftTraitsRarity` object with collection info and traits
- **Migration Notes**: Used by portfolio package for fetching NFT traits and rarity data. Called via `tokenManager.api.tokenTraits(id)` in `MediaDetailsScreen.tsx` for NFT details display.

#### `GET /tokens/discovery/{tokenId}` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No (extension doesn't use token discovery endpoint)
- **Used by Mobile (develop)**: ✅ Yes (via `@yoroi/portfolio` package, `portfolioApiMaker`, `api-maker.ts:48`)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (via `@yoroi/portfolio` package, `portfolioApiMaker`, `api-maker.ts:48`)
- **Return Type**: `TokenDiscovery` object with supply, source, metadata info
- **Migration Notes**: Used by portfolio package for fetching token discovery/metadata information. Called via `tokenManager.api.tokenDiscovery(id)` in:
  - `MediaDetailsScreen.tsx` (NFT details screen)
  - `TokenDetails.tsx` (token details screen)
  - Used to display token metadata, supply information, and source details

#### NFT Image Storage
- **Backend**: Separate NFT storage service (not legacy or backend-zero)
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ✅ Yes (`nfts.ts:38` - `storageUrl` config)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (`nfts.ts:38`)
- **URL Pattern**: `{storageUrl}/{fingerprint}.jpeg` (full), `{storageUrl}/p_{fingerprint}.jpeg` (thumbnail)
- **Migration Notes**: Separate service for moderated NFT images. Controlled by `features.moderatingNftsEnabled` flag.

---

### 4.5 External Swap APIs (Third-Party)

**Note**: The mobile app uses external swap aggregator APIs (DexHunter, Steelswap, Minswap, Muesliswap) which are **not part of the legacy backend or backend-zero**. These are third-party services and are excluded from this report as they operate independently of Yoroi's backend infrastructure.

---

### 4.3 Native Asset Metadata

#### `GET /v0/nativeassets/{fingerprint}/metadata` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ❌ No
- **Return Type**: `NativeAssetMetadata` - Object with numeric keys (20, 721) mapping to metadata
- **Migration Notes**: NFT metadata endpoint. Not yet used.

---

### 4.4 Multi-Asset Operations

#### `POST /api/multiAsset/metadata` (Legacy)
- **Backend**: Legacy only
- **Used by Extension**: ✅ Yes (`remoteFetcher.js:485`)
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ❌ No
- **Backend-Zero Equivalent**: ❌ None
- **Return Type**: `MultiAssetMintMetadataResponse`
- **Migration Status**: ❌ **Not Migrated**

#### `POST /api/multiAsset/supply` (Legacy)
- **Backend**: Legacy only
- **Used by Extension**: ✅ Yes (`remoteFetcher.js:504`)
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ❌ No
- **Backend-Zero Equivalent**: ❌ None
- **Return Type**: `{supplies: Object<assetId, supply>}`
- **Query Params**: `numberFormat=string`
- **Migration Status**: ❌ **Not Migrated**

#### `POST /tokens/activity/multi/{window}` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ✅ Yes (via `useMultiTokenActivity.ts:15`, `PortfolioTokenActivityProvider.tsx:73-83`)
- **Used by Mobile (develop)**: ✅ Yes (via `@yoroi/portfolio` package, `portfolioApiMaker`, `api-maker.ts:226`)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (via `@yoroi/portfolio` package, `portfolioApiMaker`, `api-maker.ts:226`)
- **Return Type**: Object mapping token IDs to `[statusCode, TokenActivity | error]` arrays
- **Path Params**: `window` - One of: "24h", "7d", "30d", "1y", "all" (ActivityWindow enum)
- **Migration Notes**: Used for fetching token activity/price data. 
  - **Extension**: Called directly via `useMultiTokenActivity` hook in `PortfolioTokenActivityProvider.tsx` (fetches 24h, 7d, 30d intervals)
  - **Mobile**: Called via `tokenManager.api.tokenActivity(ids, window)` in:
    - `PortfolioTokenActivityProvider.tsx` (portfolio token activity)
    - `useSwapTokenActivity.ts` (swap feature for token prices)
    - `PairedBalance.tsx` (displaying token values)

---

## 5. Wallet Management (Backend-Zero Only)

### 5.1 Wallet Registration

#### `POST /v0/wallets` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ✅ Yes (`wallet-registration.ts` - automatic)
- **Request Body**: `{id: string, paymentKeyHashes: string[], rewardAddresses: string[], publicKey: string}`
- **Return Type**: `Wallet` object (201 Created) or error (409 Conflict if exists)
- **Migration Notes**: Idempotent operation. Called automatically before wallet-specific queries.

#### `GET /v0/wallets/{id}` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ❌ No (helper exists but not called)
- **Return Type**: `Array<Ed25519KeyHash>` - Payment key hashes for wallet
- **Migration Notes**: Not currently used, but available for checking registration.

#### `PATCH /v0/wallets/{id}` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ❌ No
- **Request Body**: `{paymentKeyHashes: string[], rewardAddresses: string[]}`
- **Headers**: `x-signature` (required) - Signature for URL and body
- **Return Type**: `Array<Ed25519KeyHash>` - Updated payment key hashes
- **Migration Notes**: Requires signature (not implemented). Would be used to add new addresses.

#### `DELETE /v0/wallets/{id}` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ❌ No
- **Return Type**: 204 No Content
- **Migration Notes**: Not implemented. Would be used for wallet deletion cleanup.

---

## 6. Other Services

### 6.1 Server Status

#### `GET /api/status` (Legacy)
- **Backend**: Legacy only
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ✅ Yes (`legacy-api/index.ts:23`)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (`legacy-api/index.ts:23`)
- **Backend-Zero Equivalent**: ❌ None
- **Return Type**: `ServerStatus`
- **Migration Status**: ❌ **Not Migrated** - No backend-zero equivalent

---

### 6.2 Swap Fees

#### `GET /api/v2.1/swap/feesInfo` (Legacy)
- **Backend**: Legacy only
- **Used by Extension**: ✅ Yes (`remoteFetcher.js:571`)
- **Used by Mobile (develop)**: ❌ No
- **Used by Mobile (mobile-experimental)**: ❌ No
- **Backend-Zero Equivalent**: ❌ None
- **Return Type**: `GetSwapFeeTiersResponse`
- **Migration Status**: ❌ **Not Migrated**

---

## 7. Summary Tables

### 7.1 Migration Status by Endpoint

| Endpoint | Legacy | Backend-Zero | Extension | Mobile (develop) | Mobile (experimental) | Status |
|----------|--------|--------------|-----------|-----------------|---------------------|--------|
| Account State | ✅ | ✅ | ✅ | ✅ | ✅ (fallback) | ⚠️ Partial |
| Rewards | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ Migrated |
| Transaction History | ✅ | ✅ | ✅ | ✅ | ✅ (fallback) | ⚠️ Partial |
| Filter Used Addresses | ✅ | ✅ | ✅ | ✅ | ✅ (fallback) | ⚠️ Partial |
| UTXO Data | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ Migrated |
| Submit Transaction | ✅ | ✅ | ✅ | ✅ | ✅ (fallback) | ✅ Migrated |
| Transaction Status | ✅ | ✅ | ❌ | ✅ | ✅ (fallback) | ✅ Migrated |
| Best Block | ✅ | ✅ | ✅ | ✅ | ✅ (fallback) | ✅ Migrated |
| Pool Info | ✅ | ✅ | ✅ | ✅ | ✅ (fallback) | ✅ Migrated |
| Pool Transition | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ Legacy Only |
| Catalyst Fund Info | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ Legacy Only |
| Server Status | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ Legacy Only |
| Swap Fees | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ Legacy Only |
| Reward History | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ Legacy Only |
| Multi-Asset Metadata | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ Legacy Only |
| Multi-Asset Supply | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ Legacy Only |
| Transaction Summaries | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ Legacy Only |
| Last Block By Slot | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ Legacy Only |
| Protocol Parameters | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ Backend-Zero Only |
| Stake Key State | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ Backend-Zero Only |
| DRep State | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ Backend-Zero Only |
| Wallet Registration | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ Backend-Zero Only |
| Token Info (multi) | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ Backend-Zero Only (`/tokens/info/*`) |
| NFT Traits | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ Backend-Zero Only (`/tokens/nft/traits/*`) |
| Token Activity | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ Backend-Zero Only (`/tokens/activity/multi/*`) |
| Token History | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ Backend-Zero Only (`/tokens/history/price`) |
| Token Discovery | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ Backend-Zero Only (`/tokens/discovery/*`) |
| Native Asset Metadata | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ Backend-Zero Only |
| Wallet UTXOs | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ Backend-Zero Only |
| Spent Outputs | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ Backend-Zero Only |

### 7.2 Endpoints Missing in Backend-Zero (from Legacy)

1. `GET /api/status` - Server health check
2. `GET /api/v0/catalyst/fundInfo` - Catalyst governance
3. `POST /api/account/rewardHistory` - Reward history
4. `POST /api/v2.1/txs/summaries` - Transaction summaries
5. `POST /api/v2.1/tx/status` - Transaction slots
6. `POST /api/v2.1/pools/poolTransitionInfo` - Pool transitions
7. `POST /api/multiAsset/metadata` - Multi-asset metadata
8. `POST /api/multiAsset/supply` - Multi-asset supply
9. `POST /api/v2.1/lastBlockBySlot` - Block by slot
10. `GET /api/v2.1/swap/feesInfo` - Swap fees
11. `POST /api/txs/utxoForAddresses` - UTXOs for addresses (has wallet equivalent)
12. `POST /api/v2/txs/get` - Get transactions by hashes (has individual equivalent)

### 7.3 Endpoints Missing in Legacy (from Backend-Zero)

1. `GET /v0/protocolparameters` - Protocol parameters
2. `GET /v0/protocolparameters/costmodels` - Cost models
3. `GET /v0/stakekeys/{hash}/state` - Stake key state
4. `GET /v0/dreps/{drep}/state` - DRep state
5. `GET /v0/dreps/active` - Active DReps
6. `POST /v0/wallets` - Wallet registration
7. `GET /v0/wallets/{id}` - Get wallet
8. `PATCH /v0/wallets/{id}` - Update wallet
9. `DELETE /v0/wallets/{id}` - Delete wallet
10. `GET /v0/wallets/{id}/utxos` - Wallet UTXOs
11. `GET /v0/wallets/{id}/spentoutputs` - Spent outputs
12. `GET /v0/tokens/info/{tokenId}` - Token info
13. `POST /v0/tokens/info/multi` - Batch token info
14. `GET /tokens/nft/traits/{tokenId}` - NFT traits
15. `GET /tokens/discovery/{tokenId}` - Token discovery
16. `POST /tokens/activity/multi/{window}` - Token activity
17. `POST /tokens/history/price` - Token price history
17. `GET /v0/nativeassets/{fingerprint}/metadata` - Native asset metadata
18. `GET /v0/blocks` - Blocks by range
19. `GET /v0/blocks/{hash}/cbor` - Block CBOR

---

## 8. Key Differences & Adaptations

### 8.1 Architecture Differences

**Legacy Backend:**
- Address-centric: Queries by addresses directly
- POST-heavy: Most operations use POST with request bodies
- Batch operations: Many endpoints accept arrays
- Direct queries: No registration required

**Backend-Zero:**
- Wallet-centric: Requires wallet registration, queries by wallet ID
- GET-heavy: Most operations use GET with path/query params
- Individual queries: Many endpoints query one item at a time
- Registration required: Wallet must be registered before wallet-specific queries

### 8.2 Response Format Differences

**Amount Format:**
- Legacy: String amounts (e.g., `"1000000"`)
- Backend-Zero: Object with `$lovelaces` key and asset IDs (e.g., `{$lovelaces: "1000000", "policy.asset": "100"}`)

**Transaction Format:**
- Legacy: `RawTransaction` with `block_hash`, `block_num`, `time`, `tx_state`, `tx_ordinal`
- Backend-Zero: `Tx` with `block`, `when` (ISO date), no `block_num` or `tx_ordinal`

**Address Format:**
- Legacy: Returns addresses directly
- Backend-Zero: Returns payment key hashes, requires conversion back to addresses

**Pagination:**
- Legacy: Uses `after` object with `{block, tx}` in request body
- Backend-Zero: Uses cursor query params `?block={hash}&tx={hash}`

### 8.3 Required Adaptations

1. **Wallet Registration**: Must register wallet before wallet-specific queries
2. **ID Conversion**: Wallet IDs must be converted to Ed25519KeyHash format
3. **Response Mapping**: Map backend-zero response formats to legacy formats
4. **Amount Parsing**: Extract `$lovelaces` and parse asset amounts from object format
5. **Address Conversion**: Convert payment key hashes back to addresses
6. **Pagination**: Convert cursor format from body to query params
7. **Error Handling**: Handle 404s differently (backend-zero uses 404 for not found vs legacy error objects)

---

## 9. Recommendations

### 9.1 High Priority Migrations

1. **Transaction Summaries** (`POST /api/v2.1/txs/summaries`) - Used by extension, no backend-zero equivalent
2. **Pool Transition Info** (`POST /api/v2.1/pools/poolTransitionInfo`) - Used by mobile, no backend-zero equivalent
3. **Catalyst Fund Info** (`GET /api/v0/catalyst/fundInfo`) - Used by both extension and mobile, no backend-zero equivalent

### 9.2 Medium Priority Migrations

1. **Reward History** (`POST /api/account/rewardHistory`) - Used by extension only
2. **Multi-Asset Operations** - Used by extension only
3. **Server Status** (`GET /api/status`) - Used by mobile only

### 9.3 Backend-Zero Features Not Yet Used

1. **Token Info Multi** - Batch token info endpoint available but unused
2. **Token Activity** - DeFi activity data available but unused
3. **NFT Traits** - NFT rarity data available but unused
4. **Wallet UTXOs** - Wallet-specific UTXO endpoint available but unused
5. **Spent Outputs** - Spent output tracking available but unused

---

## 10. Appendix: Endpoint URLs by Network

### Legacy Backend URLs
- **Mainnet**: `https://api.yoroiwallet.com`
- **Preprod**: `https://preprod-backend.yoroiwallet.com`
- **Preview**: `https://preview-backend.emurgornd.com`

### Backend-Zero URLs
- **Mainnet**: `https://zero.yoroiwallet.com`
- **Preprod**: `https://yoroi-backend-zero-preprod.emurgornd.com`
- **Preview**: `https://yoroi-backend-zero-preview.emurgornd.com`

### Token Info Service URLs
- Configured per network in extension config
- Separate service, not part of main backend

### NFT Storage URLs
- Configured in mobile `BackendConfig.NFT_STORAGE_URL`
- Separate service for moderated NFT images

---

## 11. Planned/Required Endpoints (Not Yet Implemented)

This section documents endpoints that are required for planned features but are not yet implemented in either legacy backend or backend-zero.

---

### 11.1 Token Price History (CRITICAL - Missing Implementation)

**Status**: Endpoint was planned but never implemented. Currently breaks chart functionality for all non-primary tokens.

**Question for Backend Team**: 
**Is this endpoint planned for implementation?** If not, or if implementation is significantly delayed, we will explore alternative solutions using swap aggregator APIs (e.g., Minswap, Dexhunter APIs) to fetch historical price data directly from DEX sources.

#### `POST /tokens/history/price` (Backend-Zero)
- **Backend**: Backend-Zero only
- **Used by Extension**: ❌ No (extension uses different endpoint for primary token charts: `fetchPtPriceActivity`)
- **Used by Mobile (develop)**: ✅ Yes (via `@yoroi/portfolio` package, `portfolioApiMaker`, `api-maker.ts:275`)
- **Used by Mobile (mobile-experimental)**: ✅ Yes (via `@yoroi/portfolio` package, `portfolioApiMaker`, `api-maker.ts:275`)
- **Request**:
  ```typescript
  interface TokenHistoryRequest {
    tokenId: string // Portfolio.Token.Id format (e.g., "policyId.assetNameHex")
    period: '1d' | '1w' | '1m' | '6m' | '1y' | 'all'
  }
  ```
- **Response**:
  ```typescript
  interface TokenHistoryResponse {
    prices: Array<{
      ts: number // Timestamp in milliseconds
      open: string // Opening price (BigNumber string)
      close: string // Closing price (BigNumber string)
      low: string // Low price (BigNumber string)
      high: string // High price (BigNumber string)
      change: number // Percentage change
    }>
  }
  ```
- **Migration Notes**: Used by portfolio package for fetching token price history for charts. Called via `tokenManager.api.tokenHistory(tokenId, period)` in `useGetPortfolioTokenChart.ts` for displaying token price charts.

---

### 11.2 Governance Action Discovery

#### `GET /api/v1/governance/actions` (Planned)
- **Backend**: Not implemented in legacy or backend-zero
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No (planned for DRep voting feature)
- **Used by Mobile (mobile-experimental)**: ❌ No (planned for DRep voting feature)
- **Purpose**: List active governance actions (proposals) that DReps can vote on
- **Request**:
  ```typescript
  interface GetGovernanceActionsRequest {
    network: 'mainnet' | 'preprod' | 'preview'
    status?: 'active' | 'passed' | 'rejected' | 'expired'
    type?: 'parameterChange' | 'hardFork' | 'treasuryWithdrawal' | 'infoAction'
    epoch?: number
    limit?: number // Default: 50
    offset?: number
  }
  ```
- **Response**:
  ```typescript
  interface GovernanceActionsResponse {
    actions: Array<{
      actionId: {txHash: string; txIndex: number}
      type: 'parameterChange' | 'hardFork' | 'treasuryWithdrawal' | 'infoAction'
      status: 'active' | 'passed' | 'rejected' | 'expired'
      deposit: string
      rewardAccount: string
      anchor?: {url: string; hash: string}
      parameters?: Record<string, unknown>
      submittedEpoch: number
      expiresEpoch?: number
      votingResults?: {yes: string; no: string; abstain: string}
    }>
    total: number
    limit: number
    offset: number
  }
  ```
- **Priority**: **HIGH** - Needed for DRep voting feature

---

### 11.3 Governance Action Details

#### `GET /api/v1/governance/actions/:txHash/:txIndex` (Planned)
- **Backend**: Not implemented in legacy or backend-zero
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No (planned for DRep voting feature)
- **Used by Mobile (mobile-experimental)**: ❌ No (planned for DRep voting feature)
- **Purpose**: Get detailed information about a specific governance action including all votes
- **Response**:
  ```typescript
  interface GovernanceActionDetailsResponse {
    actionId: {txHash: string; txIndex: number}
    type: 'parameterChange' | 'hardFork' | 'treasuryWithdrawal' | 'infoAction'
    status: 'active' | 'passed' | 'rejected' | 'expired'
    deposit: string
    rewardAccount: string
    anchor?: {url: string; hash: string}
    parameters: Record<string, unknown>
    submittedEpoch: number
    expiresEpoch?: number
    votingResults: {yes: string; no: string; abstain: string}
    votes: Array<{
      voter: {type: 'drep' | 'pool' | 'committee'; credential: string}
      vote: 'yes' | 'no' | 'abstain'
      votingPower: string
      txHash: string
      epoch: number
      slot: number
    }>
  }
  ```
- **Priority**: **HIGH** - Needed for DRep voting feature

---

### 11.4 Vote Discovery

#### `GET /api/v1/governance/votes` (Planned)
- **Backend**: Not implemented in legacy or backend-zero
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No (planned for DRep voting feature)
- **Used by Mobile (mobile-experimental)**: ❌ No (planned for DRep voting feature)
- **Purpose**: List votes cast by a specific DRep, stake pool, or constitutional committee member on a specific governance action
- **Note**: Stake pools can vote on limited governance actions (no-confidence, committee actions, hard forks, security parameter changes), while DReps can vote on all action types
- **Request**:
  ```typescript
  interface GetVotesRequest {
    network: 'mainnet' | 'preprod' | 'preview'
    actionId?: {txHash: string; txIndex: number}
    voter?: {type: 'drep' | 'pool' | 'committee'; credential: string}
    epoch?: number
    limit?: number
    offset?: number
  }
  ```
- **Response**:
  ```typescript
  interface VotesResponse {
    votes: Array<{
      actionId: {txHash: string; txIndex: number}
      voter: {type: 'drep' | 'pool' | 'committee'; credential: string}
      vote: 'yes' | 'no' | 'abstain'
      votingPower: string
      anchor?: {url: string; hash: string}
      txHash: string
      epoch: number
      slot: number
    }>
    total: number
    limit: number
    offset: number
  }
  ```
- **Priority**: **HIGH** - Needed for DRep voting feature

---

### 11.5 DRep Information (Enhanced)

#### `GET /api/v1/governance/dreps/:drepId` (Planned)
- **Backend**: Not implemented in legacy or backend-zero
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No (planned for DRep voting feature)
- **Used by Mobile (mobile-experimental)**: ❌ No (planned for DRep voting feature)
- **Purpose**: Get comprehensive DRep information including voting power, history, and statistics
- **Response**:
  ```typescript
  interface DRepInfoResponse {
    drepId: string
    credential: {type: 'key' | 'script'; hash: string}
    registration: {
      tx: string
      epoch: number
      slot: number
      deposit: string
      anchor?: {url: string; hash: string}
    }
    deregistration?: {tx: string; epoch: number; slot: number}
    votingPower: string
    delegations: {count: number; totalStake: string}
    votingHistory: {
      totalVotes: number
      activeVotes: number
      passedVotes: number
      rejectedVotes: number
    }
    recentVotes?: Array<{
      actionId: {txHash: string; txIndex: number}
      vote: 'yes' | 'no' | 'abstain'
      epoch: number
    }>
  }
  ```
- **Note**: Basic DRep state endpoint exists (`GET /v0/dreps/{drep}/state`), but this enhanced version provides more comprehensive information
- **Priority**: **HIGH** - Needed for DRep voting feature

---

### 11.6 DRep List

#### `GET /api/v1/governance/dreps` (Planned)
- **Backend**: Not implemented in legacy or backend-zero
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No (planned for DRep voting feature)
- **Used by Mobile (mobile-experimental)**: ❌ No (planned for DRep voting feature)
- **Purpose**: List all registered DReps with basic information
- **Request**:
  ```typescript
  interface GetDRepsRequest {
    network: 'mainnet' | 'preprod' | 'preview'
    sortBy?: 'votingPower' | 'registrationEpoch' | 'name'
    order?: 'asc' | 'desc'
    limit?: number
    offset?: number
  }
  ```
- **Response**:
  ```typescript
  interface DRepsListResponse {
    dreps: Array<{
      drepId: string
      credential: {type: 'key' | 'script'; hash: string}
      votingPower: string
      delegations: {count: number; totalStake: string}
      registration: {epoch: number; anchor?: {url: string}}
    }>
    total: number
    limit: number
    offset: number
  }
  ```
- **Note**: Basic active DReps endpoint exists (`GET /v0/dreps/active`), but this provides more comprehensive listing with sorting
- **Priority**: **HIGH** - Needed for DRep voting feature

---

### 11.7 Stake Pool Governance Participation

#### `GET /api/v1/governance/pools/:poolId` (Planned)
- **Backend**: Not implemented in legacy or backend-zero
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No (planned for governance features)
- **Used by Mobile (mobile-experimental)**: ❌ No (planned for governance features)
- **Purpose**: Get governance participation data for stake pools
- **Note**: Under CIP-1694 (Voltaire), stake pools **do participate in governance voting**, but with **limited scope** compared to DReps. Pools can vote on:
  - No-confidence motions
  - Committee-related actions (normal/no-confidence)
  - Hard forks
  - Protocol parameter security changes
  - They **cannot** vote on treasury withdrawals, most protocol parameter changes (economic, technical, governance, network), or constitution changes (these require DRep votes)
- **Response**:
  ```typescript
  interface PoolGovernanceResponse {
    poolId: string
    votingHistory?: Array<{
      actionId: {txHash: string; txIndex: number}
      vote: 'yes' | 'no' | 'abstain'
      votingPower: string
      epoch: number
    }>
    drepDelegation?: {drepId: string; tx: string; epoch: number}
    totalVotes: number
  }
  ```
- **Priority**: **MEDIUM** - Useful for governance transparency (shows which pools voted on actions they're allowed to vote on)

---

### 11.8 Governance Statistics

#### `GET /api/v1/governance/stats` (Planned)
- **Backend**: Not implemented in legacy or backend-zero
- **Used by Extension**: ❌ No
- **Used by Mobile (develop)**: ❌ No (planned for governance features)
- **Used by Mobile (mobile-experimental)**: ❌ No (planned for governance features)
- **Purpose**: Get overall governance statistics for the network
- **Response**:
  ```typescript
  interface GovernanceStatsResponse {
    currentEpoch: number
    activeActions: number
    totalDReps: number
    totalVotingPower: string
    participationRate: string
    recentActions: Array<{
      actionId: {txHash: string; txIndex: number}
      type: string
      status: string
      submittedEpoch: number
    }>
  }
  ```
- **Priority**: **MEDIUM** - Useful for governance dashboard

---

### 11.9 Summary of Planned Endpoints

| Endpoint | Priority | Purpose | Status |
|----------|----------|---------|--------|
| `GET /api/v1/governance/actions` | **HIGH** | List governance actions | Not implemented |
| `GET /api/v1/governance/actions/:txHash/:txIndex` | **HIGH** | Governance action details | Not implemented |
| `GET /api/v1/governance/votes` | **HIGH** | Vote discovery | Not implemented |
| `GET /api/v1/governance/dreps/:drepId` | **HIGH** | Enhanced DRep info | Not implemented |
| `GET /api/v1/governance/dreps` | **HIGH** | DRep list with sorting | Not implemented |
| `GET /api/v1/governance/pools/:poolId` | **MEDIUM** | Pool governance participation | Not implemented |
| `GET /api/v1/governance/stats` | **MEDIUM** | Governance statistics | Not implemented |

**Implementation Notes**:
- **Governance APIs**: Data sources from governance actions in transaction metadata/certificates, votes in metadata. Voting power calculated from stake delegations.

---

**End of Report**

