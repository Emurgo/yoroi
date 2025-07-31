# Migration Guidelines

## Prerequisites

- Node.js and npm installed
- Android Studio with emulator set up
- Git access to the repository

## App Startup Process

1. Navigate to `/apps/mobile`
2. Run `npm start` to start the Metro bundler
3. In another terminal, run `npm run android --debug` to compile and serve to Android emulator
4. Use PIN "000000" to access wallet selection

## Reference Previous Working Version

- Use `git checkout rn71` to inspect the working `wallet-mobile` version
- Compare navigation and wallet selection logic
- Use as reference for missing functionality

## Systematic Error Fixing Process

1. **Start the server**: `cd apps/mobile && npm start`
2. **Monitor errors**: Watch the terminal output for "Unable to resolve" errors
3. **Fix errors**: Update import paths and dependencies
4. **Reload**: Use `curl -s "http://localhost:8081/reload" > /dev/null` to trigger reload
5. **Repeat**: Check for next error in Metro logs and fix
6. **Continue loop**: Fix → Reload → Check next error until no more errors

## Error Reading Process

- **Read errors directly**: The assistant can read errors directly from the Metro terminal where `npm start` is running
- **Direct access**: No need for user to paste logs - the assistant has direct access to the Metro process
- **Systematic approach**: Fix → Reload (curl) → Check next error
- **Cache issues**: If errors persist, clear Metro cache with `npm start --clear`

## Current Error Fixing Progress

### Completed Fixes

- ✅ **Tabs component migration**: Migrated from wallet-mobile to mobile app with atomic design tokens
- ✅ **Import path fixes**: Updated all Tabs imports to use `~/ui/Tabs` instead of `~/ui/Tabs/Tabs`
- ✅ **useBuyCryptoBanner**: Converted relative import to absolute path in TxHistory.tsx

### Current Error Status

- 🔄 **Tabs import still failing**: The error persists despite fixes, may need cache clearing
- 🔄 **useBuyCryptoBanner import**: Fixed but may need verification after restart

### Next Steps After Restart

1. Clear Metro cache: `npm start --clear`
2. Monitor for remaining import errors
3. Continue systematic fixing process
4. Test runtime functionality in emulator

## Debugging Instructions

- **Server interaction**: Use `curl -s "http://localhost:8081/reload" > /dev/null` to trigger reload
- **Error monitoring**: Watch Metro bundler output for "Unable to resolve" errors
- **Build testing**: Use `npm run android --debug` to test fixes
- **File search**: Use `file_search` to locate missing components
- **No tsc**: Do not run `tsc` directly - it will fail due to memory issues and many errors
- **Terminal workflow**:
  1. Start Metro: `npm start` (keep this terminal open)
  2. Build Android: `npm run android --debug` (close after success)
  3. Use Metro terminal for errors and reloads
- **Import patterns**:
  - Use `~/` for absolute imports from src directory
  - Use relative paths for image assets (e.g., `../../../../../assets/img/`)
  - Convert relative imports to absolute imports systematically

## Common Import Fixes

- **Image assets**: Use relative paths, not `~` alias
- **Components**: Use absolute paths with `~/` prefix
- **Tabs component**: Use `~/ui/Tabs` (migrated from wallet-mobile)
- **Navigation**: Use `~/kernel/navigation/navigation` not `~/kernel/navigation`
- **Strings**: Use `~/features/Transactions/common/strings` not `~/features/Transactions/common/useStrings`

## React Query v5 Migration Guidelines

### Error Pattern

- **Error**: `Bad argument type. Starting with v5, only the "Object" form is allowed when calling query related functions`
- **Location**: Any file using `useQuery` with old v3 syntax

### Migration Process

1. **Identify old v3 syntax**: `useQuery(queryKey, queryFn, options)`
2. **Convert to v5 syntax**: `useQuery({queryKey, queryFn, ...options})`
3. **Systematic approach**: Fix → Reload → Check next error

### Common Files to Check

- **Transaction hooks**: `useTxBody.tsx`, `useFormattedTx.tsx`
- **Swap components**: `SwapProvider.tsx`, `useSwapConfig.ts`
- **Wallet hooks**: `wallets/hooks/index.ts`
- **Discover components**: `ChainDAppsWarning.tsx`
- **Portfolio hooks**: `usePortfolioTokenInfos.ts`

### Migration Examples

**Before (v3):**

```typescript
const query = useQuery(
  ["useTxBody", cbor, unsignedTx],
  async () => {
    /* query function */
  },
  { suspense: true }
);
```

**After (v5):**

```typescript
const query = useQuery({
  queryKey: ["useTxBody", cbor, unsignedTx],
  queryFn: async () => {
    /* query function */
  },
  suspense: true,
});
```

### Systematic Fixing Process

1. **Search for old syntax**: Look for `useQuery(` with positional arguments
2. **Convert to object syntax**: Move all parameters into a single object
3. **Reload and test**: Use `curl -s "http://localhost:8081/reload" > /dev/null`
4. **Check for next error**: Monitor Metro output for remaining v3 syntax
5. **Repeat until complete**: Fix all instances systematically

### Key Changes

- **queryKey**: Move from first parameter to `queryKey` property
- **queryFn**: Move from second parameter to `queryFn` property
- **options**: Spread remaining options into the object
- **suspense**: Move from options object to top-level property

## Temporary Workarounds and Known Issues

### 1. Firebase to Expo Notifications Migration

**Issue**: `Native module RNFBAppModule not found` in Expo project
**Root Cause**: Firebase native modules are not compatible with Expo managed workflow
**Solution**: Migrate to Expo notifications

**Files Modified**:

- `apps/mobile/src/features/Notifications/common/hooks.ts`
- `apps/mobile/src/features/Notifications/common/tools.ts`

**Changes**:

- Replace `@react-native-firebase/messaging` with `expo-notifications`
- Replace `react-native-notifications` with `react-native-notifications` (for native registration)
- Update permission checks and event listeners

### 2. Require Cycle Resolution

**Issue**: Circular dependencies causing warnings
**Solution**: Extract shared functions to separate files

**Files Created/Modified**:

- `apps/mobile/src/wallets/cardano/assetUtils.ts` (new)
- `apps/mobile/src/wallets/cardano/utils.ts`
- `apps/mobile/src/wallets/cardano/cardanoValueFromMultiToken.ts`
- `apps/mobile/src/features/Swap/common/useSwap.ts` (new)
- `apps/mobile/src/features/Swap/common/SwapProvider.tsx`
- `apps/mobile/src/features/Swap/common/useSwapConfig.ts`

### 3. MediaPreview SkeletonPlaceholder Issue

**Issue**: `Invariant Violation: View config not found for component 'RNCMaskedView'`
**Root Cause**: `react-native-skeleton-placeholder` dependency on `@react-native-masked-view/masked-view` not properly linked in Expo
**Solution**: Replace with simple loading placeholder

**File Modified**: `apps/mobile/src/ui/MediaPreview/MediaPreview.tsx`

**Changes**:

- Remove `import SkeletonPlaceholder from 'react-native-skeleton-placeholder'`
- Replace `SkeletonPlaceholder` component with simple `View` with background color
- Maintain same visual loading state without native dependency

### 4. Asset Alias Configuration

**Issue**: Asset imports failing with `~/assets` alias
**Root Cause**: Missing TypeScript path configuration
**Solution**: Add alias to TypeScript config

**File Modified**: `apps/mobile/tsconfig.json`

**Changes**:

- Add `"~/assets/*": ["./assets/*"]` to paths configuration
- Ensure both Metro and TypeScript recognize the alias

### 5. Theme API Migration

**Issue**: `Cannot read property 'gray_100' of undefined`
**Root Cause**: Using old theme API with `color` instead of `palette`
**Solution**: Update to new theme API

**Files Modified**:

- `apps/mobile/src/ui/MediaPreview/MediaPreview.tsx`
- Various components using `useStyles`

**Changes**:

- Replace `const {atoms, color} = useTheme()` with `const {atoms, palette: p} = useTheme()`
- Update color references from `color.gray_100` to `p.gray_100`

### 6. useStrings Import Issues

**Issue**: `TypeError: strings.tokens is not a function (it is undefined)`
**Root Cause**: Importing wrong `useStrings` hook from different feature
**Solution**: Use correct feature-specific `useStrings` hook

**Files Modified**:

- `apps/mobile/src/features/Portfolio/screens/PortfolioDashboard/DashboardTokensList/DashboardTokensList.tsx`
- `apps/mobile/src/features/Portfolio/screens/PortfolioDashboard/DashboardNFTsList/DashboardNFTsList.tsx`

**Changes**:

- Change from `~/features/ReviewTx/common/hooks/useStrings` to `~/features/Portfolio/common/hooks/useStrings`

### 7. Context Provider Missing

**Issue**: `Error: CurrencyProvider is missing`
**Root Cause**: Missing provider in component tree
**Solution**: Add provider to main App component

**File Modified**: `apps/mobile/App.tsx`

**Changes**:

- Add `CurrencyProvider` to provider hierarchy
- Wrap children with `YoroiNotificationManager` and `CurrencyProvider`

### 8. Excessive Logging

**Issue**: Verbose logging spam with call stacks
**Root Cause**: Debug logging level in development
**Solution**: Adjust logger level

**File Modified**: `apps/mobile/src/kernel/constants.ts`

**Changes**:

- Change `loggerLevel` from `App.Logger.Level.Debug` to `App.Logger.Level.Warn` in development

## Error Resolution Workflow

1. **Identify error** from Metro bundler output
2. **Locate file** causing the error
3. **Fix import path** or add missing dependency
4. **Trigger reload** with `curl -s "http://localhost:8081/reload" > /dev/null`
5. **Check next error** and repeat
6. **Continue loop** until no more errors

## Testing Process

- **Build success**: Verify `npm run android --debug` completes successfully
- **Runtime testing**: Test app functionality in emulator
- **Error monitoring**: Watch Metro logs for runtime errors
- **Iterative fixing**: Fix one error at a time, reload (curl), repeat until no more errors
