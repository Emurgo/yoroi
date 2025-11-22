# Async State Management Migration Status

## ✅ Completed Migrations

### Core Infrastructure
- ✅ `useObservableValue` - Fixed to use `useSyncExternalStore` (no double renders)
- ✅ `useObservable` - New hook created for BehaviorSubject
- ✅ `useObservableSelector` - New hook created for derived state
- ✅ `useWalletManagerSelector` - New selector hook created
- ✅ Query factories - Created in `src/queries/factories.ts`
- ✅ RxJS operators - Created in `src/utils/rxjs-operators.ts`

### Hooks Migrated
- ✅ `useSyncWalletInfo` - Migrated from `useState` + `useEffect` to `useObservableValue`
- ✅ `useSelectedNetwork` - Now uses `useWalletManagerSelector`

### Context Optimizations
- ✅ `WalletManagerProvider` - Combined multiple `useEffect` hooks into one

---

## 📊 Current Usage Statistics

### useObservableValue
**Status**: ✅ Already in use (7 files)
- `usePortfolioPrimaryBalance.ts`
- `usePortfolioBalances.ts`
- `usePortfolioPrimaryBreakdown.ts`
- `useWalletMetas.tsx`
- `useSyncWalletInfo.tsx` (just migrated)

### useObservable / useObservableSelector
**Status**: ⚠️ Not used yet (new hooks, ready for adoption)
- 0 files using `useObservable`
- 0 files using `useObservableSelector`

### useWalletManagerSelector
**Status**: ⚠️ Limited usage (2 files)
- `useSelectedNetwork.tsx` (just migrated)
- `WalletManagerProvider.tsx` (definition)

**Opportunity**: 74 files use `useWalletManager()` - many could benefit from selectors

### Query Factories
**Status**: ⚠️ Not used yet (new, ready for adoption)
- 0 files using query factories

**Files that should migrate**:
- `usePoolList.ts` - Uses `['poolList', ...]`
- `usePoolInfo.ts` - Uses `['usePoolInfo', poolId]`
- Many others with inline query keys

### RxJS Operators
**Status**: ⚠️ Not used yet (new utilities, ready for adoption)
- Only used in tests

**Files that could benefit**:
- `PortfolioTokenActivityProvider.tsx` - Uses `throttleTime(400)` (could use `throttle(400)`)
- Any file with inline retry logic

---

## 🎯 Migration Opportunities

### High Priority (Performance Impact)

#### 1. Migrate Query Keys to Factories
**Files to migrate**:
- `src/features/Staking/Staking/PoolList/usePoolList.ts`
- `src/features/Staking/hooks/usePoolInfo.ts`
- `src/features/Staking/Governance/useCases/Home/HomeScreen.tsx` (stakingKeyState)
- `src/features/Transactions/useCases/UtxoList/useUtxoList.ts` (utxoList)
- `src/features/Legal/ui/shared/Disclaimer/useDisclaimerState.ts` (disclaimer)

**Impact**: Better cache management, consistency

#### 2. Use Context Selectors
**Files that could benefit** (74 files using `useWalletManager()`):
- Components that only need `wallet` → Use `useWalletManagerSelector((ctx) => ctx.selected.wallet)`
- Components that only need `network` → Use `useSelectedNetwork()` (already migrated)
- Components that only need `walletManager` → Use `useWalletManagerSelector((ctx) => ctx.walletManager)`

**Impact**: Prevents unnecessary re-renders when unrelated context values change

#### 3. Use useObservable for BehaviorSubjects
**Potential candidates**:
- Anywhere accessing `walletManager.selectedWalletId$.value` directly
- Anywhere accessing `walletManager.selectedNetwork$.value` directly
- Anywhere accessing `walletManager.isSyncing$.value` directly

**Impact**: Cleaner code, better performance

### Medium Priority (Code Quality)

#### 4. Use RxJS Operators
**Files that could benefit**:
- `PortfolioTokenActivityProvider.tsx` - Replace `throttleTime(400)` with `throttle(400)`
- Any API calls with retry logic → Use `retryWithBackoff()` or `retryWithDelay()`
- Any error handling → Use `catchAndLog()` or `catchWithDefault()`

**Impact**: Consistent patterns, reusable code

---

## 📝 Migration Examples

### Example 1: Migrate Query Key to Factory

**Before**:
```tsx
const queryKey = ['poolList', wallet.id, wallet.networkManager.network, normalizedSearch ?? '']
```

**After**:
```tsx
import {poolQueryKeys} from '~/queries'
const queryKey = poolQueryKeys.list(wallet.id, wallet.networkManager.network, normalizedSearch)
```

### Example 2: Use Context Selector

**Before**:
```tsx
const {selected} = useWalletManager()
const wallet = selected.wallet // Re-renders when network changes too!
```

**After**:
```tsx
import {useWalletManagerSelector} from '~/features/WalletManager/context/WalletManagerProvider'
const wallet = useWalletManagerSelector((ctx) => ctx.selected.wallet) // Only re-renders when wallet changes
```

### Example 3: Use useObservable for BehaviorSubject

**Before**:
```tsx
const [selectedWalletId, setSelectedWalletId] = React.useState(walletManager.selectedWalletId$.value)
React.useEffect(() => {
  const sub = walletManager.selectedWalletId$.subscribe(setSelectedWalletId)
  return () => sub.unsubscribe()
}, [walletManager])
```

**After**:
```tsx
import {useObservable} from '@yoroi/common'
const selectedWalletId = useObservable(walletManager.selectedWalletId$)
```

### Example 4: Use RxJS Operators

**Before**:
```tsx
import {throttleTime} from 'rxjs/operators'
stream$.pipe(throttleTime(400)).subscribe(...)
```

**After**:
```tsx
import {throttle} from '~/utils/rxjs-operators'
stream$.pipe(throttle(400)).subscribe(...)
```

---

## 🚀 Next Steps

1. **Immediate**: Migrate query keys in `usePoolList.ts` and `usePoolInfo.ts` to use factories
2. **Short-term**: Identify top 10 components using `useWalletManager()` that would benefit most from selectors
3. **Medium-term**: Gradually migrate components to use selectors as they're touched
4. **Long-term**: Update all query keys to use factories, adopt RxJS operators where applicable

---

## 📚 Resources

- [Async State Management Guide](./async-state-management-guide.md) - Complete guide on when to use what
- `src/queries/factories.ts` - Query factory definitions
- `src/utils/rxjs-operators.ts` - Reusable RxJS operators

