# Async State Management Guide

This guide explains when and how to use different async state management patterns in the Yoroi mobile app.

## Table of Contents

1. [Overview](#overview)
2. [RxJS Observables](#rxjs-observables)
3. [React Query](#react-query)
4. [Context Selectors](#context-selectors)
5. [Decision Tree](#decision-tree)
6. [Best Practices](#best-practices)

---

## Overview

We use a **hybrid approach** combining:
- **RxJS** for reactive state (wallet state, real-time updates, event streams)
- **React Query** for server state (API calls, caching, mutations)
- **Context Selectors** for preventing unnecessary re-renders

---

## RxJS Observables

### When to Use

Use RxJS observables for:
- ✅ Real-time state updates (wallet balances, sync status)
- ✅ Event streams (wallet events, user interactions)
- ✅ Complex async flows (debouncing, throttling, cancellation)
- ✅ State that changes frequently and needs reactive updates

### Available Hooks

#### `useObservableValue`

**Use when**: You need to read a value from a source object when an observable emits.

```tsx
import {useObservableValue} from '@yoroi/common'

const balance = useObservableValue({
  observable$: wallet.balance$,
  getter: () => wallet.primaryBalance,
})
```

**Key Points**:
- The `getter` should read from the source (e.g., `wallet.primaryBalance`), not from the event
- Uses `useSyncExternalStore` internally - no double renders!
- Always memoize the `getter` with `useCallback`

#### `useObservable`

**Use when**: You have a `BehaviorSubject` and want its current value.

```tsx
import {useObservable} from '@yoroi/common'

const selectedWalletId = useObservable(walletManager.selectedWalletId$)
```

**Key Points**:
- Only works with `BehaviorSubject`
- Simpler API than `useObservableValue`
- For other observables, use `useObservableValue` with a getter

#### `useObservableSelector`

**Use when**: You need to derive/compute a value from an observable.

```tsx
import {useObservableSelector} from '@yoroi/common'

const primaryBalance = useObservableSelector(
  wallet.balance$,
  () => wallet.primaryBalance,
)
```

**Note**: This is just a convenience wrapper around `useObservableValue`.

### Performance Benefits

- ✅ No double renders on mount (unlike `useState` + `useEffect`)
- ✅ Only re-renders when observable emits
- ✅ Properly handles concurrent rendering
- ✅ Automatic cleanup on unmount

---

## React Query

### When to Use

Use React Query for:
- ✅ API calls (backend-zero, legacy API)
- ✅ Server state that needs caching
- ✅ Data fetching with retries, background refetching
- ✅ Mutations with optimistic updates
- ✅ Request deduplication

### Query Factories

We have standardized query factories in `src/queries/factories.ts`:

```tsx
import {poolQueryKeys, governanceQueryKeys} from '~/queries'

// Use factory for query keys
const queryKey = poolQueryKeys.list(walletId, network, searchQuery)

// Use factory for mutations
const mutation = useMutation({
  mutationFn: submitTx,
  onSuccess: () => {
    queryClient.invalidateQueries(transactionQueryKeys.pending(walletId))
  },
})
```

**Benefits**:
- Consistent query keys across the app
- Easier cache invalidation
- Better TypeScript support
- Easier refactoring

### Available Query Factories

- `poolQueryKeys` - Pool list, pool info
- `governanceQueryKeys` - DRep ID, staking key state
- `tokenQueryKeys` - Token info, token charts
- `transactionQueryKeys` - Pending txs, tx history
- `portfolioQueryKeys` - Portfolio token activity

---

## Context Selectors

### When to Use

Use selectors when:
- ✅ You only need part of a Context value
- ✅ You want to prevent unnecessary re-renders
- ✅ Multiple components use the same Context

### Available Selectors

#### `useWalletManagerSelector`

**Use when**: You only need a specific part of the wallet manager context.

```tsx
import {useWalletManagerSelector} from '~/features/WalletManager/context/WalletManagerProvider'

// Only re-renders when wallet changes, not when network changes
const wallet = useWalletManagerSelector((ctx) => ctx.selected.wallet)

// Only re-renders when network changes
const network = useWalletManagerSelector((ctx) => ctx.selected.network)
```

**Benefits**:
- Prevents unnecessary re-renders
- Better performance
- Clearer intent

#### Existing Selector Hooks

- `useSelectedNetwork()` - Uses selector internally
- `useSelectedWallet()` - Has side effects, can't use pure selector

---

## Decision Tree

```
Do you need server data (API calls)?
├─ YES → Use React Query
│   ├─ Is it a query? → useQuery with query factory
│   └─ Is it a mutation? → useMutation with query factory
│
└─ NO → Is it reactive state (changes over time)?
    ├─ YES → Use RxJS Observable
    │   ├─ BehaviorSubject? → useObservable()
    │   └─ Other Observable? → useObservableValue() with getter
    │
    └─ NO → Is it Context state?
        ├─ Need entire context? → useWalletManager()
        └─ Need part of context? → useWalletManagerSelector()
```

---

## Best Practices

### 1. Always Memoize Getters

```tsx
// ✅ Good
const getter = React.useCallback(() => wallet.primaryBalance, [wallet])
const balance = useObservableValue({observable$, getter})

// ❌ Bad - causes unnecessary re-renders
const balance = useObservableValue({
  observable$,
  getter: () => wallet.primaryBalance, // New function on every render!
})
```

### 2. Use Query Factories

```tsx
// ✅ Good
const queryKey = poolQueryKeys.list(walletId, network, searchQuery)

// ❌ Bad - inconsistent keys
const queryKey = ['pools', walletId, network]
```

### 3. Use Selectors for Context

```tsx
// ✅ Good - only re-renders when wallet changes
const wallet = useWalletManagerSelector((ctx) => ctx.selected.wallet)

// ❌ Bad - re-renders when any context value changes
const {selected} = useWalletManager()
const wallet = selected.wallet
```

### 4. Combine RxJS Operators

```tsx
import {throttle, retryWithBackoff} from '~/utils/rxjs-operators'

// ✅ Good - reusable operators
balanceUpdates$.pipe(
  throttle(400),
  retryWithBackoff(3, 1000, 10000),
).subscribe(...)
```

### 5. Handle Errors Gracefully

```tsx
import {catchWithDefault} from '~/utils/rxjs-operators'

// ✅ Good - provides fallback
apiCall$.pipe(catchWithDefault([])).subscribe(...)
```

---

## Common Patterns

### Pattern 1: Real-time Balance Updates

```tsx
import {useObservableValue} from '@yoroi/common'

export const usePortfolioPrimaryBalance = ({wallet}: {wallet: YoroiWallet}) => {
  const observable$ = React.useMemo(
    () => wallet.balance$.pipe(filter(isSyncEvent)),
    [wallet],
  )
  const getter = React.useCallback(() => wallet.primaryBalance, [wallet])

  return useObservableValue({observable$, getter})
}
```

### Pattern 2: API Call with Caching

```tsx
import {useQuery} from '@tanstack/react-query'
import {poolQueryKeys} from '~/queries'

export const usePoolInfo = ({poolId}: {poolId: string}) => {
  const {networkManager} = useSelectedNetwork()
  const poolInfoApi = React.useMemo(
    () => poolInfoApiMaker({...}),
    [networkManager],
  )

  const query = useQuery({
    queryKey: poolQueryKeys.info(poolId),
    queryFn: () => poolInfoApi.getSingleFullPoolInfo(poolId),
    initialData: {chain: null, explorer: null},
  })

  return query.data ?? {chain: null, explorer: null}
}
```

### Pattern 3: Context Selector

```tsx
import {useWalletManagerSelector} from '~/features/WalletManager/context/WalletManagerProvider'

export const useSelectedNetwork = () => {
  return useWalletManagerSelector((ctx) => {
    const {network, networkManager} = ctx.selected
    return freeze({network, networkManager})
  })
}
```

---

## Migration Guide

### Migrating from `useState` + `useEffect` to `useObservableValue`

**Before**:
```tsx
const [value, setValue] = React.useState(getter())
React.useEffect(() => {
  const sub = observable$.subscribe(() => {
    setValue(getter())
  })
  return () => sub.unsubscribe()
}, [observable$, getter])
```

**After**:
```tsx
const getter = React.useCallback(() => getValue(), [deps])
const value = useObservableValue({observable$, getter})
```

**Benefits**:
- No double renders
- Cleaner code
- Better performance

### Migrating to Query Factories

**Before**:
```tsx
const queryKey = ['poolList', walletId, network, search]
```

**After**:
```tsx
import {poolQueryKeys} from '~/queries'
const queryKey = poolQueryKeys.list(walletId, network, search)
```

**Benefits**:
- Consistent keys
- Type safety
- Easier refactoring

---

## Troubleshooting

### Double Renders

**Problem**: Component renders twice on mount.

**Solution**: Make sure you're using `useObservableValue` (not `useState` + `useEffect`).

### Unnecessary Re-renders

**Problem**: Component re-renders when unrelated context values change.

**Solution**: Use `useWalletManagerSelector` instead of `useWalletManager`.

### Stale Data

**Problem**: Data doesn't update when it should.

**Solution**: 
- Check that observable is emitting correctly
- Verify query keys are correct
- Check cache invalidation logic

---

## Resources

- [RxJS Documentation](https://rxjs.dev/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [React useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)

