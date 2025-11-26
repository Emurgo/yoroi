# Additional Migration Opportunities

## High Priority Migrations

### 1. Context Selectors (Performance Impact)

These hooks/components use `useWalletManager()` but only need specific parts:

#### Wallet Creation Hooks (3 files)
- ✅ `useCreateWalletFromRootKey.tsx` - Already migrated
- ✅ `useCreateReadOnlyWalletFromAddresses.tsx` - Already migrated
- ⚠️ `useCreateWalletMnemonic.tsx` - Uses `walletManager` only
- ⚠️ `useCreateWalletXPub.tsx` - Uses `walletManager` only

**Migration**: Replace `const {walletManager} = useWalletManager()` with:
```tsx
const walletManager = useWalletManagerSelector((ctx) => ctx.walletManager)
```

#### Components Accessing Network Only (1 file)
- ⚠️ `useGovernanceBanner.tsx` - Uses `selected.network` only

**Migration**: Replace:
```tsx
const {selected: {network}} = useWalletManager()
```
with:
```tsx
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
const {network} = useSelectedNetwork()
```

#### Components Accessing Selected Wallet/Meta (Multiple files)
- ⚠️ `useSelectedWallet.tsx` - Has side effects (modal), but could optimize internal access
- ⚠️ `SelectWalletFromListScreen.tsx` - Check if it accesses `selected` directly

**Note**: `useSelectedWallet` has side effects (shows modal), so it needs the full context. However, internal access could be optimized.

---

### 2. Query Key Factories (Consistency)

These files use inline query keys that could use factories:

#### Governance Queries (1 file)
- ⚠️ `useGovernanceBanner.tsx` - Uses `['governanceBanner', wallet?.id, network]`
  - Could add to `governanceQueryKeys.banner(walletId, network)`

#### Notification Queries (Multiple files)
- ⚠️ `useGovernanceBanner.tsx` - Uses `['receivedNotificationEvents']`
  - Could add `notificationQueryKeys.events()` or `notificationQueryKeys.all()`

#### Swap Queries (1 file)
- ⚠️ `SwapProvider.tsx` - Check for inline query keys

**Recommendation**: Add factories for:
- `governanceQueryKeys.banner(walletId, network)`
- `notificationQueryKeys.events()` or `notificationQueryKeys.all()`
- `swapQueryKeys.*` (if needed)

---

### 3. Observable Hooks (Performance)

These might have `useState` + `useEffect` patterns that could use `useObservableValue`:

#### Already Checked
- ✅ `useHasWallets.tsx` - Already migrated
- ✅ `useSyncTemporarilyPaused.tsx` - Already migrated
- ✅ `useSyncWalletInfo.tsx` - Already migrated

#### To Check
- ⚠️ `useSelectedWallet.tsx` - Has `useState` + `useEffect` but for modal logic (side effects), not observable subscription
- ⚠️ Other hooks in `src/features/WalletManager/hooks/` - Review for observable patterns

---

## Medium Priority Migrations

### 4. RxJS Operators

Already migrated:
- ✅ `PortfolioTokenActivityProvider.tsx` - Migrated `throttleTime` to `throttle`

No other files found using `throttleTime` or `debounceTime` that need migration.

---

## Low Priority / Already Optimized

### 5. BehaviorSubject.value Access

Most direct `.value` access is in:
- `wallet-manager.ts` - Internal implementation (acceptable)
- `WalletManagerProvider.tsx` - Line 104, but it's in a subscription callback (acceptable)

No components found directly accessing `.value` that should use `useObservable`.

---

## Summary

### Quick Wins (High Impact, Low Effort)

1. **Migrate 2 wallet creation hooks** to use selectors:
   - `useCreateWalletMnemonic.tsx`
   - `useCreateWalletXPub.tsx`

2. **Migrate 1 governance hook** to use `useSelectedNetwork`:
   - `useGovernanceBanner.tsx`

3. **Add query factories** for governance banner and notifications:
   - `governanceQueryKeys.banner()`
   - `notificationQueryKeys.events()`

### Estimated Impact

- **Performance**: ~5 fewer unnecessary re-renders per wallet creation flow
- **Consistency**: Standardized query keys for governance and notifications
- **Code Quality**: Cleaner selector usage

---

## Files That Should NOT Be Migrated

### `useSelectedWallet.tsx`
- Has side effects (shows modal)
- Needs full context access
- Already optimized internally with `useMemo`
- Migration would add complexity without benefit

### Components with Complex Side Effects
- Any component that needs multiple context values
- Components with navigation logic tied to context changes
- Components that perform mutations based on context state

---

## Next Steps

1. Migrate the 3 high-priority hooks (2 wallet creation + 1 governance)
2. Add query factories for governance banner and notifications
3. Review `SelectWalletFromListScreen.tsx` for selector opportunities
4. Document any new patterns discovered during migration

