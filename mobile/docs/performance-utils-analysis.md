# Debounce/Throttle Utilities Analysis

## Summary

The codebase has **multiple duplicate implementations** of debounce and throttle utilities instead of reusing common utilities. This analysis identifies all instances and recommends consolidation.

## Existing Utility

### `useDebouncedValue` (✅ Reusable)

**Location:** `mobile/src/hooks/useDebouncedValue.ts`

**Purpose:** Debounces a value (React hook pattern)
**Usage:** Used in `ChangePasswordScreen.tsx`

**Implementation:**

```typescript
export const useDebouncedValue = <T>(value: T, delay = initialDelay): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef?.current)
    }
  }, [value, delay])

  return debouncedValue
}
```

---

## Duplicate Implementations

### 1. `useDebounced` (Duplicate #1)

**Location:** `mobile/src/ui/TextInput/TextInput.tsx` (line 37)

**Implementation:**

```typescript
const useDebounced = (callback: VoidFunction, value: unknown, delay = 1000) => {
  const first = React.useRef(true)
  React.useEffect(() => {
    if (first.current) {
      first.current = false
    }
    const handler = setTimeout(() => callback(), delay)
    return () => clearTimeout(handler)
  }, [callback, delay, value])
}
```

**Usage Context:**

- Used to re-enable error text after user stops typing
- `errorTextEnabled` starts as `errorOnMount` prop value
- When user types, `onChange` sets `errorTextEnabled` to `false`
- After delay, debounced callback sets it back to `true`

**Issues:**

- ⚠️ **BUG**: Missing `return` statement on line 52 - doesn't actually skip first render!
- Different API (callback-based vs value-based)
- Intent was to skip first render (to avoid overriding `errorOnMount`), but bug prevents this
- Duplicate of implementation #2 (which correctly implements skip-first-render)

**Recommendation:** Fix bug by adding `return` statement, then consolidate with #2 into shared utility

---

### 2. `useDebounced` (Duplicate #2)

**Location:** `mobile/src/features/SetupWallet/useCases/RestoreWallet/MnemonicInput/TextInput/TextInput.tsx` (line 33)

**Implementation:**

```typescript
const useDebounced = (cb: VoidFunction, v: unknown, d = 1_000) => {
  const first = React.useRef(true)
  React.useEffect(() => {
    if (first.current) {
      first.current = false
      return // ✅ Correctly returns early
    }
    const t = setTimeout(cb, d)
    return () => clearTimeout(t)
  }, [cb, d, v])
}
```

**Usage Context:**

- Same pattern as #1 - re-enables error text after typing stops
- `errorTextEnabled` starts as `errorOnMount` prop value
- User typing disables error, debounced callback re-enables after delay

**Issues:**

- ✅ Correctly implements skip-first-render (unlike #1)
- Different default delay (1000ms vs 1000ms in #1, but different variable names)
- Identical logic to #1 (except #1 has a bug)

**Why Skip First Render is Intentional:**

- On mount, error state is controlled by `errorOnMount` prop
- Debounced callback should only fire when `value` CHANGES, not on initial mount
- Prevents overriding the initial `errorOnMount` state with delayed callback

**Recommendation:** Use this implementation as reference (it's correct), consolidate with #1 into shared utility

---

### 3. `debounceMaker` (Duplicate #3)

**Location:** `mobile/src/common/AddressInput/hooks/useAddressInput.tsx` (line 420)

**Implementation:**

```typescript
const debounceMaker = <T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number,
) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const clear = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
  }

  const call = (...args: Parameters<T>) => {
    clear()
    timeoutId = setTimeout(() => {
      callback(...args)
    }, delay)
  }

  return {clear, call} as const
}
```

**Issues:**

- Non-React utility (function-based, not hook)
- Duplicate of implementation #4
- Different API pattern (call/clear vs direct call)

**Recommendation:** Extract to `src/utils/debounce.ts` or `src/hooks/useDebounce.ts`

---

### 4. `debounceMaker` (Duplicate #4)

**Location:** `mobile/src/common/AddressInput/hooks/useAddressResolution.tsx` (line 11)
**Location:** `mobile/src/features/SetupWallet/useCases/RestoreReadOnlyWallet/hooks/useRestoreReceiver.tsx` (line 90)

**Implementation:** Identical to #3

**Issues:**

- Exact duplicate across 3 files
- Same non-React utility pattern

**Recommendation:** Extract to shared utility

---

### 5. Inline Debounce (Duplicate #5)

**Location:** `mobile/src/kernel/navigation/RouterContainer.tsx` (line 23-46)

**Implementation:**

```typescript
const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null)

const handleStateChange = React.useCallback(
  (_state: NavigationState | undefined) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      // ... callback logic
    }, 100)
  },
  [onRouteChange],
)
```

**Issues:**

- Inline implementation in callback
- Could use `useDebouncedCallback` hook

**Recommendation:** Extract to `useDebouncedCallback` hook

---

### 6. Inline Debounce (Duplicate #6)

**Location:** `mobile/src/features/Staking/Staking/PoolList/PoolList.tsx` (line 26-34)

**Implementation:**

```typescript
const [debouncedSearch, setDebouncedSearch] = React.useState(search)

React.useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search)
  }, 200)
  return () => clearTimeout(timer)
}, [search])
```

**Issues:**

- Could use existing `useDebouncedValue` hook!
- Different delay (200ms vs 500ms default)

**Recommendation:** Replace with `useDebouncedValue(search, 200)`

---

## Throttle Implementations

### 1. RxJS `throttleTime` (✅ Appropriate)

**Location:** `mobile/src/features/Portfolio/context/PortfolioTokenActivityProvider.tsx` (line 90)

**Implementation:**

```typescript
.pipe(throttleTime(400))
```

**Status:** ✅ Appropriate use of RxJS operator for observable streams

**Recommendation:** Keep as-is (RxJS is the right tool for observable throttling)

---

### 2. No React Throttle Hook Found

**Status:** No `useThrottle` or `useThrottledValue` hook exists

**Recommendation:** Create if needed, but RxJS `throttleTime` covers observable cases

---

## Recommendations

### Priority 1: High-Impact Consolidations

1. **Extract `debounceMaker` to shared utility**

   - Create `mobile/src/utils/debounce.ts`
   - Consolidate 3 duplicate implementations (#3, #4)
   - Used in: `useAddressInput.tsx`, `useAddressResolution.tsx`, `useRestoreReceiver.tsx`

2. **Create `useDebouncedCallback` hook**

   - Create `mobile/src/hooks/useDebouncedCallback.ts`
   - Consolidate duplicates #1 and #2
   - Replace inline debounce in `RouterContainer.tsx` (#5)

3. **Replace inline debounce with `useDebouncedValue`**
   - Replace `PoolList.tsx` inline debounce (#6) with `useDebouncedValue(search, 200)`

### Priority 2: Enhance Existing Utility

4. **Enhance `useDebouncedValue`**
   - Add option to skip first render (if needed)
   - Consider adding `useDebouncedCallback` variant

### Priority 3: Documentation

5. **Document utilities**
   - Add JSDoc comments
   - Create usage examples
   - Add to developer guide

---

## Proposed New Utilities

### `mobile/src/utils/debounce.ts`

```typescript
/**
 * Creates a debounced function that delays invoking callback until after delay milliseconds
 * have elapsed since the last time it was invoked.
 */
export const debounce = <T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number,
) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const clear = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const call = (...args: Parameters<T>) => {
    clear()
    timeoutId = setTimeout(() => {
      callback(...args)
    }, delay)
  }

  return {clear, call} as const
}
```

### `mobile/src/hooks/useDebouncedCallback.ts`

```typescript
/**
 * Debounces a callback function, skipping the first render by default.
 * Useful for search inputs and other user-triggered actions.
 */
export const useDebouncedCallback = (
  callback: VoidFunction,
  value: unknown,
  delay = 1000,
  skipFirst = true,
) => {
  const first = React.useRef(skipFirst)

  React.useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }

    const timer = setTimeout(() => {
      callback()
    }, delay)

    return () => clearTimeout(timer)
  }, [callback, delay, value])
}
```

---

## Files to Update

### Consolidate `debounceMaker`:

- ✅ Create `mobile/src/utils/debounce.ts`
- Replace in `mobile/src/common/AddressInput/hooks/useAddressInput.tsx`
- Replace in `mobile/src/common/AddressInput/hooks/useAddressResolution.tsx`
- Replace in `mobile/src/features/SetupWallet/useCases/RestoreReadOnlyWallet/hooks/useRestoreReceiver.tsx`

### Consolidate `useDebounced`:

- ✅ Create `mobile/src/hooks/useDebouncedCallback.ts`
- Replace in `mobile/src/ui/TextInput/TextInput.tsx`
- Replace in `mobile/src/features/SetupWallet/useCases/RestoreWallet/MnemonicInput/TextInput/TextInput.tsx`
- Replace in `mobile/src/kernel/navigation/RouterContainer.tsx`

### Use existing `useDebouncedValue`:

- Replace in `mobile/src/features/Staking/Staking/PoolList/PoolList.tsx`

---

## Impact Assessment

- **Files with duplicates:** 7 files
- **Duplicate implementations:** 6 unique patterns
- **Estimated LOC reduction:** ~100 lines
- **Maintainability improvement:** High (single source of truth)
- **Risk:** Low (utilities are well-tested patterns)

---

## Next Steps

1. Create shared utilities (`debounce.ts`, `useDebouncedCallback.ts`)
2. Update imports across codebase
3. Remove duplicate implementations
4. Add tests for shared utilities
5. Update documentation
