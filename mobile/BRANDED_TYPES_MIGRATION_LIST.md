# Branded Types Migration - Files to Update

This document lists all files that still need to be updated to use branded types.

## Status Legend
- ✅ **Completed** - Already migrated
- 🔄 **In Progress** - Partially migrated
- ⏳ **Pending** - Needs migration

---

## 1. API Adapters & Translators

### ⏳ Legacy API Adapter
- **File**: `packages/api/cardano/adapters/legacy/api-maker.ts`
- **Status**: Needs full migration
- **Issues**:
  - `InternalRawTransaction` type uses `string` for addresses, amounts, hashes
  - Transformation functions need branded type assertions
  - Similar to backend-zero adapter migration

### ⏳ API Translators
- **File**: `packages/api/cardano/translators/transformers/asSubject.ts`
- **Status**: Function signature uses `Balance.TokenInfo['id']` (already branded, but may need updates)
- **File**: `packages/api/cardano/translators/transformers/asFingerprint.ts`
- **Status**: Uses tokenId, may need branded type assertions

### ⏳ Token Utilities
- **File**: `packages/api/cardano/utils/token-utils.ts`
- **Status**: Functions accept `string` for tokenIdentifier
- **Functions to update**:
  - `fallbackTokenInfo(tokenId: string)` → should accept `TokenId`
  - `toPolicyId(tokenIdentifier: string)` → should accept `TokenId | string`
  - `toDisplayAssetName(tokenIdentifier: string)` → should accept `TokenId | string`
  - `toAssetNameHex(tokenIdentifier: string)` → should accept `TokenId | string`
  - `toTokenSubject(tokenIdentifier: string)` → should accept `TokenId | string`
  - `toTokenId(tokenIdentifier: string)` → should accept `TokenId | string`

### ⏳ UTXO Data API
- **File**: `packages/api/cardano/api/utxo-data.ts`
- **Status**: Check for string types in UTXO fetching

---

## 2. Transaction Builder & Helpers

### ⏳ Transaction Builder Helpers
- **File**: `packages/tx/transaction-builder/helpers.ts`
- **Status**: Some functions still use `string` parameters
- **Functions to update**:
  - `selectUtxosForAmounts()` - `targetAmount: string`, `primaryTokenId: string`
  - `createWithdrawal()` - `rewardAddress: string`, `amount: string`
  - `createChangeOutput()` - `changeAddress: string`
  - `createOutput()` - `address: string`

### ⏳ Transaction Builder Core
- **File**: `packages/tx/transaction-builder/builder.ts`
- **Status**: Some helper functions need updates
- **Functions to update**:
  - `addOutput()` - `address: string` parameter
  - `addWithdrawal()` - `rewardAddress: string`, `amount: string`
  - `setChangeAddress()` - `address: string` parameter
  - `addCertificate()` - may need key hash updates

### ⏳ Ledger Integration
- **File**: `packages/tx/ledger/signers.ts`
- **Status**: `getAddressAddressing(address: string)` → should accept `Address | string`
- **File**: `packages/tx/ledger/signing.ts`
- **Status**: `paymentAddress: string` → should use `Address`
- **File**: `packages/tx/ledger/adapter.ts`
- **Status**: Check for string types in Ledger adapter

---

## 3. UTXO Operations

### ⏳ UTXO Manager
- **File**: `packages/tx/utxo/index.ts`
- **Status**: Multiple functions use `addresses: string[]`
- **Functions to update**:
  - `fetchUtxos()` - `addresses: string[]` → `Address[]`
  - `syncUtxoState()` - `addresses: string[]` → `Address[]`
  - `filterUsedAddresses()` - `addresses: string[]` → `Address[]`
  - `getUtxoDiffSincePoint()` - `addresses: string[]` → `Address[]`

### ⏳ Emurgo API UTXO
- **File**: `packages/tx/utxo/legacy-utxo-api.ts`
- **Status**: Check for `amount: string` types

---

## 4. Wallet Operations & Transaction Recipes

### ⏳ Transaction Recipes
- **File**: `src/wallets/cardano/transaction-recipes/createSendTx.ts`
- **Status**: `getChangeAddress()` returns `string` → should return `Address`
- **File**: `src/wallets/cardano/transaction-recipes/createUtxoConsolidationTx.ts`
- **Status**: Check for string types in addresses
- **File**: `src/wallets/cardano/transaction-recipes/createVotingRegTx.ts`
- **Status**: Check for string types
- **File**: `src/wallets/cardano/transaction-recipes/createCombinedDelegationTx.ts`
- **Status**: Check for string types

### ⏳ Wallet Helpers
- **File**: `src/wallets/cardano/getMinAmounts.ts`
- **Status**: `getMinAmounts(address: string, ...)` → should accept `Address | string`
- **File**: `src/wallets/cardano/wallet-helpers.ts`
- **Status**: Check for string types in wallet operations

### ⏳ Address Info
- **File**: `src/wallets/cardano/addressInfo/addressInfo.ts`
- **Status**: Functions accept `address: string`
- **Functions to update**:
  - `getStakingKey(address: string)` → `Address | string`
  - `getSpendingKey(address: string)` → `Address | string`
  - `toWasmAddress(address: string)` → `Address | string`

### ⏳ Account Manager
- **File**: `src/wallets/cardano/account-manager/read-only-account-manager.ts`
- **Status**: `isValidCardanoAddress(address: string)` → `Address | string`

---

## 5. Feature Code (UI/UX)

### ⏳ Send Feature
- **File**: `src/features/Send/common/utils/getOwnWalletDomains.ts`
- **Status**: `extractPolicyId(tokenId: Portfolio.Token.Id)` - already uses branded type, verify usage
- **File**: `src/features/Send/common/toTransactionOutput.ts`
- **Status**: Check for string types

### ⏳ Swap Feature
- **File**: `src/features/Swap/common/useGetInputs.ts`
- **Status**: Check for string types in swap operations
- **File**: `src/features/Swap/common/SwapProvider.tsx`
- **Status**: Check for string types

### ⏳ Mint/Burn Feature
- **File**: `src/features/MintBurn/common/hooks/useMintTransaction.ts`
- **Status**: Check for string types in minting operations
- **File**: `src/features/MintBurn/common/utils/createNativeScript.ts`
- **Status**: `policyId: string`, `keyHash: string` → should use branded types

### ⏳ Review Transaction
- **File**: `src/features/ReviewTx/common/hooks/useFormattedTxFromWalletTransaction.tsx`
- **Status**: Check for string types in transaction formatting

---

## 6. Type Definitions

### ⏳ Balance Types
- **File**: `packages/types/balance/token.ts`
- **Status**: Some fields still use `string`:
  - `ticker: string | undefined` - probably fine as is
  - `total: string` - should be `BalanceQuantity`
  - `circulating: string | null` - should be `BalanceQuantity | null`
  - `[tokenId: string]: BalanceQuantity` - key should be `TokenId`

### ⏳ Transaction Types
- **File**: `packages/tx/types/index.ts`
- **Status**: `StakingKeyBalances = {[key: string]: Amount}` - key should be `KeyHash`

### ⏳ Link Types
- **File**: `packages/types/links/cardano-actions.ts`
- **Status**: Uses `address: string`, `amount?: string` - should use branded types

### ⏳ Claim Types
- **File**: `packages/types/claim/claim.ts`
- **Status**: `address: string` → should use `Address`

---

## 7. Backend-Zero Adapter (Partial)

### 🔄 Backend-Zero Adapter
- **File**: `packages/api/cardano/adapters/backend-zero/api-maker.ts`
- **Status**: Mostly migrated, but check:
  - `getSpendingKey(address: string)` callback signature
  - Any remaining string types in transformation logic

---

## Migration Priority

### High Priority (Core Infrastructure)
1. ✅ Transaction builder types - **DONE**
2. ✅ API types - **DONE**
3. ⏳ Legacy API adapter - **NEXT**
4. ⏳ UTXO operations - **HIGH**
5. ⏳ Transaction builder helpers - **HIGH**

### Medium Priority (Wallet Operations)
6. ⏳ Transaction recipes
7. ⏳ Wallet helpers
8. ⏳ Address utilities

### Lower Priority (Feature Code)
9. ⏳ Feature code (Send, Swap, etc.)
10. ⏳ Type definitions cleanup

---

## Migration Pattern

For each file:

1. **Update function signatures**:
   ```typescript
   // Before
   function example(address: string, tokenId: string): void
   
   // After
   function example(address: Address | string, tokenId: TokenId | string): void
   ```

2. **Add type assertions at boundaries**:
   ```typescript
   // At API boundaries (user input, external APIs)
   const validatedAddress = Branded.asAddress(rawAddress)
   const validatedTokenId = Branded.asTokenId(rawTokenId)
   
   // At internal boundaries (already validated)
   const address: Address = knownAddress as Address
   ```

3. **Update type definitions**:
   ```typescript
   // Before
   type Example = {
     address: string
     tokenId: string
   }
   
   // After
   type Example = {
     address: Address
     tokenId: TokenId
   }
   ```

---

## Notes

- All validation functions are in `packages/types/branded/validation.ts`
- Use `Branded.as*()` functions for external input validation
- Use type assertions (`as Type`) for internal, already-validated code
- Functions should accept `Type | string` for backward compatibility during migration
- Lenient validation: warnings logged but types always returned

