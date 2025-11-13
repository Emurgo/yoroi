# ReviewTx Migration Status

## Current State

### ✅ New Flow (Using CBOR)
These flows pass `cbor` directly in route params:
- **DApp Connector** (`useDappConnectorManager.tsx`) - Passes `cbor` from external DApp
- **Swap** (`ReviewSwap.tsx`) - Passes `cbor` from `swapForm.createTx?.cbor`

### ❌ Old Flow (Using UnsignedTx from Context)
These flows still use `unsignedTxChanged()` + `ReviewTxProvider` context:
- **Send** (`ListAmountsToSendScreen.tsx`) - Uses `wallet.createUnsignedTx()` → `unsignedTxChanged()` → navigate
- **Staking Center** (`StakingCenter.tsx`) - Uses `useStakingTx` → `unsignedTxChanged()` → navigate
- **Catalyst Registration** (`ConfirmPin.tsx`) - Uses `wallet.createVotingRegTx()` → `unsignedTxChanged()` → navigate
- **Pool Transition** (`usePoolTransition.tsx`) - Uses `wallet.createDelegationTx()` → `unsignedTxChanged()` → navigate
- **Governance Actions** (`helpers.tsx`) - Uses `wallet.createUnsignedGovernanceTx()` → `unsignedTxChanged()` → navigate

## Key Finding

**All wallet methods (`createUnsignedTx`, `createDelegationTx`, `createVotingRegTx`, etc.) are already using the new `@yoroi/tx` package's `buildTransaction`**, which returns `UnsignedTransaction` with a `cbor` property.

However, they then:
1. ~~Convert the new `UnsignedTransaction` to legacy format using `adaptUnsignedTransaction`~~ ✅ REMOVED
2. ~~Wrap it in `YoroiUnsignedTx`~~ ✅ REMOVED
3. ~~Return it to callers who use `unsignedTxChanged()` to put it in context~~ ✅ REMOVED

**Note**: All wallet methods now return `{cbor: string}` directly.

## Migration Path

To complete the migration:

1. **Update wallet methods** to return/expose the `cbor` from `buildTransaction`:
   - `createUnsignedTx` - Already has `cbor` in `unsignedTx.cbor`, just need to expose it
   - `createDelegationTx` - Same
   - `createVotingRegTx` - Same
   - `createWithdrawalTx` - Same
   - `createUnsignedGovernanceTx` - Same

2. **Update all callers** to pass `cbor` instead of using `unsignedTxChanged()`:
   - `ListAmountsToSendScreen.tsx` - Pass `cbor` in `navigateToTxReview({cbor: ...})`
   - `StakingCenter.tsx` - Pass `cbor` in `navigateToTxReview({cbor: ...})`
   - `ConfirmPin.tsx` - Pass `cbor` in `navigateToTxReview({cbor: ...})`
   - `usePoolTransition.tsx` - Pass `cbor` in `navigateToTxReview({cbor: ...})`
   - `helpers.tsx` - Pass `cbor` in `navigateToTxReview({cbor: ...})`

3. **Remove `ReviewTxProvider`** once all flows are migrated to CBOR

## Current Code Flow

```
wallet.createUnsignedTx()
  → buildTransaction() [@yoroi/tx] → UnsignedTransaction { cbor: "..." }
  → Returns { cbor: string } directly ✅
```

**Legacy flow has been removed:**
- ~~adaptUnsignedTransaction() → LegacyUnsignedTx~~ ✅ REMOVED
- ~~yoroiUnsignedTx() → YoroiUnsignedTx~~ ✅ REMOVED  
- ~~unsignedTxChanged() → ReviewTxProvider context~~ ✅ REMOVED

## Target Code Flow

```
wallet.createUnsignedTx()
  → buildTransaction() [@yoroi/tx] → UnsignedTransaction { cbor: "..." }
  → navigateToTxReview({ cbor: unsignedTx.cbor })
  → ReviewTxScreen reads cbor from route params
```

