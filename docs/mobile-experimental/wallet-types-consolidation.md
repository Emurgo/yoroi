# Wallet Types Consolidation and Migration Plan

## Overview

This plan consolidates redundant types in `mobile/src/wallets/types`, migrates to `@yoroi/tx` and `@yoroi/staking` packages, simplifies `YoroiEntry`/`YoroiUnsignedTx`/`YoroiSignedTx` using new transaction builder types, removes `maxSupply` from `TokenMetadata`, migrates `Token` types to Portfolio/Balance, and removes unused/mocked Portfolio features.

---

## 1. Token Types Consolidation and Migration

### Current State
- `mobile/src/wallets/types/tokens.ts`: `Token` with metadata:
  - `numberOfDecimals` → Maps to `decimals` in Portfolio/Balance
  - `ticker` → Maps to `ticker` in Portfolio/Balance
  - `longName` → Maps to `name`/`description` in Portfolio/Balance
  - `maxSupply` → **REMOVE** (use `Portfolio.Token.Discovery.supply` instead)
  - `policyId` → Can derive from `identifier` (first 56 chars) or use `Balance.TokenInfo.group`
  - `assetName` → Can derive from `identifier` (after 56 chars) or use `Balance.TokenInfo.name`
- `@yoroi/tx/types/index.ts`: `Token` (transaction-focused: `identifier`, `isDefault`)
- `Portfolio.Token.Info`: Rich token info with all metadata fields
- `Balance.TokenInfo`: Token info with `decimals`, `ticker`, `name`, `description`, `group` (policyId)

### Decision
- **Migrate to Portfolio/Balance types** instead of keeping `Token`/`TokenMetadata`
- **Keep simplified `TransactionToken` type** only for `TransactionInfo.tokens` (transaction processing with minimal data)
- **Remove `maxSupply`** from all token metadata

### Actions
- **Remove `maxSupply` from `TokenMetadata`**:
  - Update `TokenCommonMetadata` to remove `maxSupply`
  - Update `processTransactions.ts` to remove `maxSupply: null` from token creation
  - Update any mocks that use `maxSupply`
- **Migrate `Token` usage to Portfolio/Balance types**:
  - Replace `Token` with `Balance.TokenInfo` or `Portfolio.Token.Info` where full metadata is needed
  - Update `format.ts` utilities to work with Portfolio/Balance types (already handles them)
  - Update `TransactionReceivedNotification.tsx` to use Portfolio/Balance types
- **Create `TransactionToken` type for transaction processing**:
  - Create simplified type for `TransactionInfo.tokens`:
    ```typescript
    export type TransactionToken = {
      isDefault: boolean
      identifier: string
      // Minimal metadata for transaction display
      policyId: string
      assetName: string
      numberOfDecimals: number
      ticker: string | null
      longName: string | null
    }
    ```
  - Update `TransactionInfo.tokens` to use `Record<string, TransactionToken>`
- **Remove `DefaultAsset`** (can use `Portfolio.Token.Info` or `Balance.TokenInfo` instead)
- **Keep `LegacyToken`** only for backward compatibility in `api/utils.ts` (used for conversion)

### Files to Update
- `mobile/src/wallets/types/tokens.ts` - Remove `maxSupply`, create `TransactionToken` type, remove `DefaultAsset`, keep only `LegacyToken`
- `mobile/src/wallets/cardano/processTransactions/processTransactions.ts` - Remove `maxSupply: null`, update to use `TransactionToken`
- `mobile/src/wallets/types/other.ts` - Update `TransactionInfo.tokens` to use `TransactionToken`
- `mobile/src/wallets/utils/format.ts` - Already handles Portfolio/Balance types, may need minor updates
- `mobile/src/features/Notifications/common/TransactionReceivedNotification.tsx` - Migrate to Portfolio/Balance types
- `mobile/src/wallets/cardano/api/utils.ts` - Keep `LegacyToken` for conversion only
- `mobile/src/wallets/cardano/utils.test.ts` - Update mocks
- Any other files importing `Token` or `DefaultAsset` from `tokens.ts`

---

## 2. Staking Types Migration

### Current State
- `mobile/src/wallets/types/staking.ts` has:
  - `StakePoolInfoRequest`, `StakePoolInfosAndHistories`, `StakePoolInfoAndHistory`
  - `RemoteCertificateMeta`, `RemoteAccountState`, `AccountStates`
- `@yoroi/staking/pools/pool-info-api.ts` has:
  - `ExplorerPoolInfo`, `FullPoolInfo`, `FullPoolInfoMap`, etc.
  - But no `StakePoolInfoRequest` or `StakePoolInfoAndHistory` types

### Actions
- **Add missing types to `@yoroi/staking/pools/types.ts`**:
  - `StakePoolInfoRequest` (if not covered by existing API)
  - `StakePoolInfoAndHistory` (combines `FullPoolInfo` with history)
  - `StakePoolInfosAndHistories` (map version)
- **Move API-related types**:
  - `RemoteCertificateMeta` → `@yoroi/staking/types.ts` (or create `@yoroi/staking/api/types.ts`)
  - `RemoteAccountState`, `AccountStates` → `@yoroi/staking/api/types.ts`
- **Keep app-specific types** in `mobile/src/wallets/types/staking.ts`:
  - `StakingInfo`, `StakingStatus` (app UI state)
- **Update imports** throughout the app

### Files to Update
- `mobile/packages/staking/pools/types.ts` - Add pool info request/history types
- `mobile/packages/staking/types.ts` or new `api/types.ts` - Add API types
- `mobile/src/wallets/types/staking.ts` - Remove migrated types, keep app-specific
- `mobile/src/wallets/cardano/cardano-wallet.ts` - Update imports
- `mobile/src/features/Dashboard/ui/shared/StakePoolInfo.tsx` - Update imports
- `mobile/src/wallets/cardano/delegationUtils.ts` - Update imports

---

## 3. other.ts Legacy Evaluation and Modernization

### Current State
Types in `mobile/src/wallets/types/other.ts` to evaluate:

#### Already in @yoroi/tx (should import instead):
- `Addressing`, `CardanoAddressedUtxo`, `Datum`, `Token`, `TokenEntry`, `MultiTokenValue`, `TxMetadata`, `RemoteUnspentOutput`

#### API Response Types (keep but may rename):
- `RawUtxo` - API response format (snake_case), different from `RemoteUnspentOutput`
- `RawTransaction` - API response format
- `AccountStateRequest`, `AccountStateResponse` - API types
- `PoolInfoRequest` - API type (may move to staking package)
- `TipStatusResponse`, `TxHistoryRequest` - API types
- `TxStatusRequest`, `TxStatusResponse` - API types
- `FundInfoResponse` - Catalyst API type

#### UI/App-Specific Types (keep):
- `TransactionInfo` - UI transaction display type
- `WalletState` - App state
- `BackendConfig` - App config

#### Naming Conflicts:
- `Transaction` - Conflicts with CSL `Transaction` type

### Actions
- **Remove duplicate types** that exist in `@yoroi/tx`:
  - Delete: `Addressing`, `CardanoAddressedUtxo`, `Datum`, `Token`, `TokenEntry`, `MultiTokenValue`, `TxMetadata`, `RemoteUnspentOutput`
  - Update all imports to use `@yoroi/tx` versions
- **Rename conflicting types**:
  - `Transaction` → `WalletTransaction` or `TransactionRecord` (to avoid CSL conflict)
- **Group API types** (optional organization):
  - Consider creating `mobile/src/wallets/types/api.ts` for API response types
  - Or keep in `other.ts` but add comments marking them as API types
- **Keep app-specific types**:
  - `TransactionInfo`, `WalletState`, `BackendConfig` stay in `other.ts`

### Files to Update
- `mobile/src/wallets/types/other.ts` - Remove duplicates, rename `Transaction`
- `mobile/src/wallets/cardano/types.ts` - Update imports
- `mobile/src/wallets/cardano/utxoManager/utxoManager.ts` - Update `RawUtxo` usage
- `mobile/src/wallets/cardano/cip30/cip30.ts` - Update imports
- `mobile/src/features/Transactions/useCases/UtxoList/useUtxoList.ts` - Update imports
- `mobile/src/features/Staking/Governance/useCases/Home/HomeScreen.tsx` - Update `TransactionInfo` import
- All files importing duplicate types from `other.ts`

---

## 4. YoroiEntry, YoroiUnsignedTx, YoroiSignedTx Simplification

### Current State
- `YoroiEntry` = `{address, amounts, datum?}` - matches `TransactionOutput` from `@yoroi/tx`
- `YoroiUnsignedTx` = `YoroiTxInfo & {unsignedTx: CardanoTypes.UnsignedTx}`
- `YoroiSignedTx` = `YoroiTxInfo & {signedTx: CardanoTypes.SignedTx}`
- `YoroiTxInfo` = `{entries, fee, change, metadata, staking, voting, governance}`

### Modern Alternatives
- `TransactionOutput` from `@yoroi/tx/transaction-builder/types.ts` = `{address, amounts, datum?}`
- `UnsignedTransaction` from `@yoroi/tx/transaction-builder/types.ts` = new flexible format
- `CardanoUnsignedTx` / `CardanoSignedTx` from `@yoroi/types` = `CardanoTxInfo & {unsignedTx/signedTx}`

### Actions
- **Replace `YoroiEntry` with `TransactionOutput`**:
  - `YoroiEntry` is identical to `TransactionOutput`
  - Update all `YoroiEntry` references to `TransactionOutput` from `@yoroi/tx`
  - Remove `YoroiEntry` type definition
- **Simplify `YoroiUnsignedTx` and `YoroiSignedTx`**:
  - Option A: Use `CardanoUnsignedTx` / `CardanoSignedTx` from `@yoroi/types` (if compatible)
  - Option B: Keep wrapper but use new `UnsignedTransaction` internally
  - Option C: Create adapter that converts between formats
- **Update `yoroiUnsignedTx()` function**:
  - Currently uses legacy `CardanoTypes.UnsignedTx`
  - Should work with new `UnsignedTransaction` format (already has `adaptUnsignedTransaction`)
- **Keep `YoroiTxInfo` structure** (app-specific metadata):
  - But use `TransactionOutput[]` instead of `YoroiEntry[]`
  - Keep `staking`, `voting`, `governance` fields (app-specific)

### Files to Update
- `mobile/src/wallets/types/yoroi.ts` - Replace `YoroiEntry` with `TransactionOutput`, simplify tx types
- `mobile/src/wallets/cardano/cardano-wallet.ts` - Update all `YoroiEntry` to `TransactionOutput`
- `mobile/src/wallets/cardano/unsignedTx/unsignedTx.ts` - Update `yoroiUnsignedTx()` function
- `mobile/src/wallets/cardano/cip30/cip30.ts` - Update `YoroiUnsignedTx` usage
- `mobile/src/features/ReviewTx/common/hooks/useTxBody.tsx` - Update types
- `mobile/src/features/ReviewTx/common/hooks/useFormattedMetadata.tsx` - Update types
- All other files using `YoroiEntry`, `YoroiUnsignedTx`, `YoroiSignedTx`

---

## 5. Remove Unused/Mocked Portfolio Features

### Current State
- `useGetPortfolioTokenInfo` + `IPortfolioTokenInfo`: Mock hook returning fake performance data
  - Used in `Performance.tsx` component
  - Performance tab is hidden behind `features.portfolioPerformance` flag (set to `false` in `features.ts`)
  - **Status**: Completely unused, **REMOVE**
- `useGetDAppsPortfolioBalance`: Always returns `{quantity: 0n, previousQuantity: 0n}`
  - Used in `PortfolioTokenListScreen.tsx` to check if DApps tab should show
  - Tab never shows because `hasDApps` is always false
  - **Status**: Non-functional, **REMOVE**
- `useGetOpenOrders` + `useGetLiquidityPool`: Return mock data but are displayed in UI
  - Used in `PortfolioDAppsTokenList.tsx` (visible in UI)
  - Show mock liquidity pools and open orders
  - **Status**: Functional but mocked, **REMOVE** (user confirmed)

### Actions
- **Remove all unused/mocked code**:
  - Delete `useGetPortfolioTokenInfo.ts` (hook + `IPortfolioTokenInfo` interface)
  - Delete `Performance.tsx` component (only used by disabled feature)
  - Remove Performance tab from `PortfolioTokenDetailsScreen.tsx` (behind disabled flag)
  - Delete `useGetDAppsPortfolioBalance.ts` (always returns 0, tab never shows)
  - Delete `useGetOpenOrders.ts` and `useGetLiquidityPool.ts` (mocked features)
  - Remove DApps tab logic from `PortfolioTokenListScreen.tsx` (since `hasDApps` is always false)
  - Delete related components: `OpenOrdersTab.tsx`, `LiquidityPoolTab.tsx`, `PortfolioDAppsTokenList.tsx`
  - Delete related modals: `OpenOrderModal.tsx`, `LiquidityPoolModal.tsx`
  - Delete related hooks: `useShowOpenOrderModal.tsx`, `useShowLiquidityPoolModal.tsx`

### Files to Remove
- `mobile/src/features/Portfolio/common/hooks/useGetPortfolioTokenInfo.ts` - **DELETE**
- `mobile/src/features/Portfolio/screens/PortfolioTokenDetails/PortfolioTokenInfo/Performance.tsx` - **DELETE**
- `mobile/src/features/Portfolio/common/hooks/useGetDAppsPortfolioBalance.ts` - **DELETE**
- `mobile/src/features/Portfolio/common/hooks/useGetOpenOrders.ts` - **DELETE**
- `mobile/src/features/Portfolio/common/hooks/useGetLiquidityPool.ts` - **DELETE**
- `mobile/src/features/Portfolio/common/hooks/useShowOpenOrderModal.tsx` - **DELETE**
- `mobile/src/features/Portfolio/common/hooks/useShowLiquidityPoolModal.tsx` - **DELETE**
- `mobile/src/features/Portfolio/screens/PortfolioTokensList/PortfolioDAppsTokenList/` - **DELETE ENTIRE DIRECTORY**

### Files to Update
- `mobile/src/features/Portfolio/screens/PortfolioTokenDetails/PortfolioTokenDetailsScreen.tsx` - Remove Performance tab
- `mobile/src/features/Portfolio/screens/PortfolioTokensList/PortfolioTokenListScreen.tsx` - Remove DApps tab logic
- `mobile/src/features/Portfolio/context/PortfolioProvider.tsx` - Remove `PortfolioDetailsTab.Performance` and `PortfolioDappsTab` enums
- `mobile/src/features/Portfolio/screens/PortfolioTokenDetails/PortfolioTokenInfo/PortfolioTokenInfo.tsx` - Remove Performance tab panel

---

## Implementation Order

1. **Phase 1: Remove duplicates from other.ts**
   - Remove types that exist in `@yoroi/tx`
   - Update all imports
   - Rename `Transaction` to avoid conflict

2. **Phase 2: Migrate staking types**
   - Add types to `@yoroi/staking`
   - Update imports in app

3. **Phase 3: Consolidate and migrate token types**
   - Remove `maxSupply` from `TokenMetadata`
   - Migrate `Token` usage to Portfolio/Balance types
   - Create `TransactionToken` for transaction processing
   - Remove `DefaultAsset`
   - Update imports

4. **Phase 4: Simplify Yoroi transaction types**
   - Replace `YoroiEntry` with `TransactionOutput`
   - Simplify `YoroiUnsignedTx`/`YoroiSignedTx`
   - Update all usages

5. **Phase 5: Remove unused/mocked Portfolio features**
   - Delete `useGetPortfolioTokenInfo` and `Performance.tsx`
   - Delete `useGetDAppsPortfolioBalance`
   - Delete `useGetOpenOrders` and `useGetLiquidityPool`
   - Delete entire `PortfolioDAppsTokenList` directory
   - Clean up related UI components and tabs

---

## To-Do List

1. Remove duplicate types from other.ts (Addressing, CardanoAddressedUtxo, Datum, Token, etc.) and update all imports to use @yoroi/tx versions

2. Rename Transaction type in other.ts to WalletTransaction to avoid CSL Transaction conflict

3. Add StakePoolInfoRequest, StakePoolInfoAndHistory types to @yoroi/staking/pools/types.ts and migrate RemoteCertificateMeta, RemoteAccountState to staking package

4. Update all imports in app to use staking types from @yoroi/staking package

5. Remove maxSupply from TokenMetadata in tokens.ts and update processTransactions.ts to remove maxSupply: null

6. Create TransactionToken type for TransactionInfo.tokens (minimal metadata for transaction processing)

7. Migrate Token usage to Portfolio.Token.Info or Balance.TokenInfo where full metadata is needed

8. Remove DefaultAsset type and update all usages to use Portfolio.Token.Info or Balance.TokenInfo

9. Replace YoroiEntry with TransactionOutput from @yoroi/tx throughout the codebase

10. Simplify YoroiUnsignedTx and YoroiSignedTx to use new UnsignedTransaction format from @yoroi/tx

11. Update all files using YoroiEntry, YoroiUnsignedTx, YoroiSignedTx to use new types

12. Delete useGetPortfolioTokenInfo, Performance.tsx, useGetDAppsPortfolioBalance, useGetOpenOrders, useGetLiquidityPool and entire PortfolioDAppsTokenList directory

13. Remove Performance tab from PortfolioTokenDetailsScreen, remove DApps tab from PortfolioTokenListScreen, update PortfolioProvider context

---

## Notes

- Keep app-specific types (UI state, config) in `mobile/src/wallets/types`
- API response types can stay in `other.ts` or be organized separately
- Use `@yoroi/tx` as source of truth for transaction-related types
- Use `@yoroi/staking` for staking-related types
- Use `Portfolio.Token.Info` or `Balance.TokenInfo` for token metadata
- Use `Portfolio.Token.Discovery.supply` for supply data (replaces `maxSupply`)
- Maintain backward compatibility during migration with type aliases if needed

## Additional Findings

### Type Equivalencies Confirmed
1. **BalanceAmounts = Balance.Amounts**: Same type, `Balance.Amounts` is namespace export of `BalanceAmounts`
2. **CardanoEntry = YoroiEntry = TransactionOutput**: All identical structure
3. **CardanoTxInfo = YoroiTxInfo**: Same structure (entries, fee, change, metadata, staking, voting, governance)
4. **CardanoUnsignedTx/CardanoSignedTx**: Legacy types in `@yoroi/types/chain/cardano.ts` marked "START legacy", not used in app
5. **Chain.Cardano namespace**: Only used for `ProtocolParams` and `BestBlock`, transaction types not used

### Token Type Compatibility
- `@yoroi/tx Token` is compatible with `Portfolio.Token.Info` via `toLibToken()` converter
- `maxSupply` = `Portfolio.Token.Discovery.supply` (same concept, use discovery API)
- All `TokenMetadata` fields can be derived or found in Portfolio/Balance types

