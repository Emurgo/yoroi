# Type Error Analysis and Fix Plan

## Overview

This document analyzes 92 TypeScript type errors and provides a systematic plan to fix them. Each error category is analyzed to understand the root cause before proposing fixes.

## Error Summary

- **Total Errors**: 92
- **Categories**: 9 main categories
- **Files Most Affected**:
  - `unsignedTx/unsignedTx.ts` (20 errors)
  - `cardano-wallet.ts` (10 errors)
  - `cip30/cip30.ts` (7 errors)
  - `mocks/transaction.ts` (20 errors - likely same pattern)

---

## Category 1: buildTransaction Signature Mismatch (10 errors)

### Root Cause

The `buildTransaction` function signature changed. It no longer takes `CardanoMobile` as the first parameter because `cslScope` provides it internally.

**Current Signature** (from `packages/tx/transaction-builder/builder.ts`):

```typescript
export async function buildTransaction(
  state: TransactionBuilderState,
  protocolParams: CardanoHaskellConfig,
  primaryTokenId: string = '',
): Promise<UnsignedTransaction>
```

**Incorrect Calls**:

```typescript
buildTransaction(CardanoMobile, builderState, protocolParams, primaryTokenId)
```

**Correct Calls**:

```typescript
buildTransaction(builderState, protocolParams, primaryTokenId)
```

### Files Affected

1. `cardano-wallet.ts`:

   - Line 503: `createDelegationTx`
   - Line 597: `createVotingRegTx`
   - Line 682: `createWithdrawalTx`
   - Line 742: `createUnsignedGovernanceTx`
   - Line 992: `createUnsignedTx`

2. `cip30/cip30-ledger.ts`:

   - Line 121: `signTx` method

3. `cip30/cip30.ts`:
   - Line 172: `getUtxos` method
   - Line 240: `signTx` method
   - Line 241: `signTx` method (different call)

### Fix Strategy

Remove `CardanoMobile` as the first argument from all `buildTransaction` calls. The function already wraps everything in `CardanoMobileWrapped.cslScope()`, so `CardanoMobile` is provided internally.

---

## Category 2: normalizeToAddress Async/Signature Issues (8 errors)

### Root Cause

`normalizeToAddress` is an async function that takes only one parameter `(addr: string)`, but code is:

1. Calling it with `(csl, address)` - wrong signature
2. Using it synchronously without `await`
3. Trying to call methods on the Promise instead of the resolved Address

**Correct Signature** (from `packages/tx/utils/addresses.ts`):

```typescript
export async function normalizeToAddress(
  addr: string,
): Promise<Address | undefined>
```

### Files Affected

1. `delegationUtils.ts`:

   - Line 17: `normalizeToAddress(csl, address)` - should be `await normalizeToAddress(address)`
   - Line 26: Using result synchronously - needs `await`

2. `getMinAmounts.ts`:

   - Line 56: `normalizeToAddress(cslProvided.csl, address)` - wrong signature
   - Line 61: Using result synchronously - needs `await`

3. `assetUtils.ts`:

   - Line 35: `normalizeToAddress(csl, address)` - wrong signature
   - Line 41: `Promise<Address | undefined>` used as `Address` - needs `await`

4. `cip30/cip30-ledger.ts`:
   - Line 41: `normalizeToAddress(csl, address)` - wrong signature
   - Line 43: Using result synchronously - needs `await`
   - Line 56: Calling `.toBech32()` on Promise - needs `await`

### Fix Strategy

1. Remove `csl` parameter from all `normalizeToAddress` calls
2. Add `await` where the function is called
3. Ensure the calling function is `async` if it wasn't already
4. Handle the `Address | undefined` return type properly

---

## Category 3: unsignedTx.ts Legacy Code (20 errors)

### Root Cause

The `yoroiUnsignedTx()` function expects the old `YoroiUnsignedTx` structure, but receives `CardanoTypes.UnsignedTx` which is `TransactionBody` from CSL. The function tries to access properties that don't exist on `TransactionBody`:

**Expected (old structure)**:

- `unsignedTx.fee.values` - but `fee` is a function `() => BigNum`
- `unsignedTx.change` - doesn't exist on `TransactionBody`
- `unsignedTx.outputs` - is a function `() => TransactionOutputs`, not an array
- `unsignedTx.registrations`, `unsignedTx.deregistrations`, `unsignedTx.delegations` - don't exist on `TransactionBody`
- `unsignedTx.withdrawals?.hasValue()` - `withdrawals` is a function `() => Optional<Withdrawals>`, not an object

**Actual Type**: `CardanoTypes.UnsignedTx` = `TransactionBody` from `@emurgo/cross-csl-core`

### Files Affected

- `unsignedTx/unsignedTx.ts`:
  - Line 39: `unsignedTx.fee.values` - `fee` is a function
  - Line 40: `unsignedTx.change` - property doesn't exist
  - Line 41: `unsignedTx.outputs` - is a function, not array
  - Line 47: `getBalanceForStakingCredentials` - wrong number of args
  - Line 59: `unsignedTx.withdrawals?.hasValue()` - `withdrawals` is a function
  - Line 59: `unsignedTx.withdrawals.len()` - same issue
  - Line 63: `unsignedTx.registrations` - doesn't exist
  - Line 65: `unsignedTx.registrations` - same
  - Line 72: `unsignedTx.deregistrations` - doesn't exist
  - And more...

### Analysis Needed

**Critical Question**: Is `yoroiUnsignedTx()` function still being used?

**Possible Scenarios**:

1. **If unused**: Delete the function and its usages
2. **If used**: It needs to work with `UnsignedTransaction` from `@yoroi/tx` instead of `TransactionBody`
3. **If used with old flow**: It might need to parse CBOR to extract needed information

### Fix Strategy

1. First, check if `yoroiUnsignedTx` is imported/used anywhere
2. If unused, remove it
3. If used, refactor to:
   - Accept `UnsignedTransaction` from `@yoroi/tx` (which has the structure it expects)
   - OR parse CBOR and extract information from `TransactionBody`
   - OR update callers to use the new structure directly

---

## Category 4: YoroiUnsignedTx vs {cbor: string} Mismatch (7 errors)

### Root Cause

After CBOR migration, `createUnsignedTx` returns `{cbor: string}`, but code still expects `YoroiUnsignedTx` with properties like:

- `unsignedTx.unsignedTx.txBuilder.build()` - old structure
- `unsignedTx.unsignedTx.txBody` - old structure
- `findUtxosInUnsignedTx` expects `YoroiUnsignedTx` but receives `{cbor: string}`

### Files Affected

1. `cip30/cip30.ts`:

   - Line 264: `yoroiUnsignedTx.unsignedTx.txBuilder.build()` - `{cbor: string}` doesn't have `unsignedTx`
   - Line 437: `findUtxosInUnsignedTx(unsignedTx, ...)` - expects `YoroiUnsignedTx`, gets `{cbor: string}`
   - Line 461: `unsignedTx.unsignedTx.txBody` - `{cbor: string}` doesn't have `unsignedTx`

2. `cip30/cip30.ts` - `findUtxosInUnsignedTx` function:
   - Line 457: Function signature expects `YoroiUnsignedTx`
   - Line 461: Accesses `unsignedTx.unsignedTx.txBody.inputs()`

### Fix Strategy

1. **For `buildReorganisationTx` (line 264)**:

   - Parse CBOR to get `TransactionBody`
   - Build transaction from `TransactionBody` directly
   - OR use the CBOR directly if possible

2. **For `findUtxosInUnsignedTx` (line 457)**:

   - Update signature to accept `{cbor: string}`
   - Parse CBOR: `csl.Transaction.fromHex(cbor).body()`
   - Extract inputs from the parsed body

3. **For line 461**:
   - Parse CBOR to get `TransactionBody`
   - Access `txBody` directly (it IS the TransactionBody)

---

## Category 5: createLedgerPlutusPayload/getAllSigners Parameter Issues (5 errors)

### Root Cause

These functions no longer take `wasm` parameter because it's provided by `cslScope` internally.

**Current Signature** (from `packages/tx/ledger/plutus.ts`):

```typescript
export const createLedgerPlutusPayload = async (
  params: CreateLedgerPlutusPayloadParams,
): Promise<SignTransactionRequest>
```

**Current Signature** (from `packages/tx/ledger/signers.ts`):

```typescript
export const getAllSigners = async ({
  body,
  networkId,
  stakeVKHash,
  stakingKeyPath,
  partial = true,
  utxos,
  getAddressAddressing,
}: GetAllSignersOptions): Promise<Addressing[]>
```

### Files Affected

1. `common/signatureUtils.ts`:

   - Line 37: `wasm: CardanoMobile` in `createLedgerPlutusPayload` params - doesn't exist
   - Line 102: `getAllSigners` expects different structure
   - Line 111: `getAddressAddressing` returns `Promise<Addressing[]>` but code uses `.map()` synchronously

2. `cip30/cip30-ledger.ts`:
   - Line 121: `buildTransaction` - wrong number of args (covered in Category 1)

### Fix Strategy

1. Remove `wasm` from `createLedgerPlutusPayload` call in `signatureUtils.ts`
2. Fix `getAllSigners` call to match new signature
3. Fix `getAddressAddressing` to handle async properly (it's already async in the function, but the result needs to be awaited)

---

## Category 6: Transaction Type Import Error (1 error)

### Root Cause

`Transaction` was renamed to `WalletTransaction` in `~/wallets/types/other`, but mocks and some code still import the old name.

### Files Affected

1. `mocks/index.ts`:

   - Line 5: `import {Transaction} from '~/wallets/types/other'` - should be `WalletTransaction`

2. `transactionManager/transactionManager.ts`:
   - Line 425: `Cannot find name 'Transaction'` - should use `WalletTransaction`

### Fix Strategy

Update imports to use `WalletTransaction` instead of `Transaction`.

---

## Category 7: Property Access Errors (4 errors)

### Root Cause

Accessing properties that don't exist on types:

1. **`properties.hexName`** (api/utils.ts:71):

   - `AssetNameUtils.resolveProperties()` returns `{tag: string | null; asciiName: string | null}`
   - No `hexName` property exists
   - Should use `asciiName` or derive from hex

2. **`txBody` property** (cip30/cip30.ts:461):

   - `TransactionBody` doesn't have a `txBody` property - it IS the TransactionBody
   - Code tries: `unsignedTx.unsignedTx.txBody` but `unsignedTx` is `{cbor: string}`

3. **`unsignedTx` property** (SignWithHwModal.tsx:161):
   - `{cbor: string}` doesn't have `unsignedTx` property
   - Type assertion needed or different approach

### Files Affected

- `api/utils.ts` (line 71)
- `cip30/cip30.ts` (line 461)
- `SignWithHwModal.tsx` (line 161)

### Fix Strategy

1. Fix `hexName` access - use `asciiName` or calculate from hex
2. Fix `txBody` access - parse CBOR to get TransactionBody
3. Fix `SignWithHwModal` - update type or use type assertion

---

## Category 8: Function Signature Mismatches (Various)

### Root Cause

Various functions have wrong number of arguments or wrong types:

1. **`signMessageWithLedger`** (cip30/cip30-ledger.ts:121):

   - Expected 4 args, got 5

2. **`createCIP15VotingMetadata` / `createCIP36VotingMetadata`**:

   - Check if signatures changed

3. **`getBalanceForStakingCredentials`** (unsignedTx.ts:47):

   - Expected 1 arg, got 2

4. **`parseTokenList`** (cip30/cip30.ts:241):

   - Returns `Promise<Uint8Array>` but used synchronously

5. **`filterAddressesByStakingKey`** (cardano-wallet.ts:894):

   - Expected 2 args, got 3

6. **`signRawTransaction`** (cardano-wallet.ts:1089, 1152, 1252):
   - Various argument count mismatches

### Fix Strategy

Check actual function signatures and fix all calls to match.

---

## Category 9: Pre-existing Errors (3 errors)

### Root Cause

Errors in `packages/tx/utxo` that seem pre-existing (not related to CBOR migration):

1. **`emurgo-api.ts:195`**: Object possibly undefined
2. **`utxo/index.ts:112`**: `diffToRemove` possibly undefined
3. **`utxo/index.ts:258`**: `(Utxo | undefined)[]` assignment issue

### Fix Strategy

Add proper null checks or fix the logic to handle undefined cases.

---

## Implementation Order

### Phase 1: Quick Wins (Low Risk)

1. Fix `buildTransaction` calls - remove `CardanoMobile` parameter (10 errors)
2. Fix type imports - `Transaction` → `WalletTransaction` (1 error)
3. Fix property access errors (4 errors)

### Phase 2: Async/Await Fixes (Medium Risk)

1. Fix `normalizeToAddress` calls - remove `csl`, add `await` (8 errors)
2. Fix function signature mismatches (various)

### Phase 3: Legacy Code Analysis (High Risk - Needs Investigation)

1. Check if `yoroiUnsignedTx` is still used
2. If used, determine migration path
3. Fix `unsignedTx.ts` based on usage (20 errors)

### Phase 4: CBOR Migration Remaining Issues (Medium Risk)

1. Fix `findUtxosInUnsignedTx` to work with CBOR (7 errors)
2. Fix `cip30.ts` to parse CBOR when needed

### Phase 5: Ledger Integration (Medium Risk)

1. Fix `createLedgerPlutusPayload` calls (5 errors)
2. Fix `getAllSigners` calls

### Phase 6: Pre-existing Errors (Low Priority)

1. Fix pre-existing errors in `packages/tx/utxo` (3 errors)

---

## Verification Checklist

After implementing fixes:

- [ ] Run `npx tsc --noEmit` - should show 0 type errors
- [ ] Run `npm run lint` - should show 0 lint errors
- [ ] Test transaction creation flows (Send, Staking, Governance)
- [ ] Test Ledger signing flows
- [ ] Test CIP30 wallet integration
- [ ] Verify no runtime errors from type fixes

---

## Notes

- The `unsignedTx.ts` file is the most complex - it may need significant refactoring or removal
- Some errors might be interconnected - fixing one might reveal or fix others
- Pre-existing errors in `packages/tx/utxo` should be addressed but are lower priority
- All fixes should maintain backward compatibility where possible, but CBOR migration is breaking by design
