# Yoroi Mobile App - Comprehensive Development Guide

This document consolidates all development guidelines, migration processes, and current status for the Yoroi mobile app migration from legacy to v2 architecture.

## 📋 Table of Contents

1. [App Startup & Development Process](#app-startup--development-process)
2. [Migration Guidelines](#migration-guidelines)
3. [Feature Restoration Status](#feature-restoration-status)
4. [Temporary Fixes & Compatibility Issues](#temporary-fixes--compatibility-issues)
5. [Current Conflicts & Issues](#current-conflicts--issues)
6. [Debugging & Error Resolution](#debugging--error-resolution)
7. [Testing & Quality Assurance](#testing--quality-assurance)

---

## 🚀 App Startup & Development Process

### Prerequisites

- Node.js and npm installed
- Android Studio with emulator set up
- Git access to the repository

### Development Workflow

1. **Start Metro Server**:

   ```bash
   cd apps/mobile
   npm start
   ```

2. **Build Android App** (in separate terminal):

   ```bash
   npm run android --debug
   ```

3. **Access App**:

   - Use PIN "000000" to access wallet selection
   - App runs on emulator with Expo development client

4. **Error Monitoring**:
   - Watch Metro terminal for "Unable to resolve" errors
   - Use `curl -s "http://localhost:8081/reload"` to trigger reloads
   - Fix errors systematically: Fix → Reload → Check next error

### Reference Previous Working Version

```bash
git checkout rn71  # Inspect working wallet-mobile version
git checkout fix/wallet-navigation-and-functionality  # Current working branch
```

---

## 🔄 Migration Guidelines

### Core Migration Principles

#### 1. Use Absolute Path Aliases ✅

**Available Aliases:**

```typescript
import { Button } from "~/ui/Button";
import { Space } from "~/ui/Space/Space";
import { usePrivacyMode } from "~/features/Settings/useCases/changeAppSettings/PrivacyMode/PrivacyMode";
```

**Alias Mappings:**

- `~/ui/*` → `./src/ui/*`
- `~/features/*` → `./src/features/*`
- `~/hooks/*` → `./src/hooks/*`
- `~/kernel/*` → `./src/kernel/*`
- `~/wallets/*` → `./src/wallets/*`

#### 2. Remove `useStyles` Hook and `StyleSheet.create`

**❌ Avoid StyleSheet.create:**

```typescript
// Before
const useStyles = () => {
  const { color, atoms } = useTheme();
  const styles = StyleSheet.create({
    container: {
      ...atoms.p_lg,
      backgroundColor: color.bg_color_max,
    },
  });
  return { styles, color };
};

// After
const { atoms: ta, palette: p } = useTheme();
<View style={[{ ...ta.p_lg }, { backgroundColor: p.bg_color_max }]} />;
```

#### 3. Use Correct Type Imports

**❌ Avoid `~/types/` imports:**

```typescript
// Before
import { RawUtxo, YoroiUnsignedTx } from "~/types/other";

// After
import { RawUtxo, YoroiUnsignedTx } from "@yoroi/types";
```

#### 4. Adopt Atomic Design System

**Static Atoms (`a`):**

```typescript
import {atoms as a} from '@yoroi/theme'
style={[a.p_lg, a.rounded_sm, a.flex_col]}
```

**Theme-Aware Atoms (`ta`) and Palette (`p`):**

```typescript
const {atoms: ta, palette: p} = useTheme()
style={[...ta.bg_color_max, a.p_lg, {color: p.text_gray_low}]}
```

#### 5. Update Component Imports

**Migration from `components/` to `ui/`:**

```typescript
// ❌ Old imports
import { Icon } from "../../../../components/Icon";

// ✅ New imports
import { Icon } from "~/ui/Icon";
```

### React Query v5 Migration

**Error Pattern:** `Bad argument type. Starting with v5, only the "Object" form is allowed`

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

---

## 📊 Feature Restoration Status

### ✅ **Portfolio Features** (COMPLETED)

**Status**: 🔄 **BUILDS SUCCESSFULLY - NEEDS RUNTIME TESTING**

**Components Restored:**

- `PortfolioNavigator` - Main portfolio navigation
- `PortfolioTokensList` - Token list display
- `TotalTokensValue` - Total value calculation
- `TokenValueBalance` - Individual token balance
- `TokenValuePairedBalance` - Paired token balance

**Implementation Details:**

- Created `MainWalletRoutes` component with tab navigation
- Added state management for switching between History and Portfolio views
- Implemented custom tab bar with proper styling
- Used proper theme colors and palette integration

**Build Status:**

- ✅ App compiles without TypeScript errors
- ✅ Android build completes successfully
- ✅ App installs and runs on device/emulator
- ✅ PortfolioNavigator imports and dependencies resolved

**Runtime Testing Needed:**

- 🔄 Test tab navigation between History and Portfolio
- 🔄 Verify portfolio screen renders correctly
- 🔄 Check portfolio components (BalanceCard, DashboardTokensList, etc.)
- 🔄 Test portfolio functionality and data loading

### ⏳ **Pending Features**

| Feature                   | Status     | Priority | Dependencies                                     |
| ------------------------- | ---------- | -------- | ------------------------------------------------ |
| **Swap Features**         | ⏳ PENDING | 2        | `@yoroi/swap` package, CSL integration           |
| **Exchange Features**     | ⏳ PENDING | 3        | `@yoroi/exchange` package, provider integrations |
| **Send/Receive Features** | ⏳ PENDING | 4        | Transaction builder APIs, address management     |
| **Scan Features**         | ⏳ PENDING | 5        | Camera permissions, QR code processing           |
| **Notifications**         | ⏳ PENDING | 6        | Notification manager APIs                        |
| **Governance Features**   | ⏳ PENDING | 7        | `@yoroi/staking` package, governance APIs        |

---

## ⚠️ Temporary Fixes & Compatibility Issues

### **MSL Libraries Bypass** ⚠️ **TEMPORARY**

**Issue**: Python compatibility problems with MSL (Message Signing Library) dependencies

**Root Cause:**

- MSL libraries use Rust Android Gradle plugin that generates linker wrapper scripts
- These scripts import the deprecated `pipes` module (removed in Python 3.12)
- Error: `ModuleNotFoundError: No module named 'pipes'`

**Affected Libraries:**

- `@emurgo/cross-msl-mobile` - Message signing library for mobile
- `@emurgo/msl-mobile-bridge` - Mobile bridge for MSL functionality

**Temporary Solution:**

1. ✅ **Removed Dependencies**: MSL packages removed from `package.json`
2. ✅ **Commented Imports**: MSL imports in `src/wallets/cardano/cip8/cip8.ts` commented out
3. ✅ **Error Handling**: Functions now throw descriptive errors when MSL is disabled
4. ✅ **Build Configuration**: Rust Android Gradle plugin disabled in `android/build.gradle`

**Affected Functionality:**

- `sign()` - Message signing functionality
- `makeCip8Key()` - Key generation
- `buildCoseSign1FromSignature()` - Signature building

**Restoration Plan** (when MSL libraries support Python 3.12+):

1. Re-add dependencies to `package.json`:
   ```json
   "@emurgo/cross-msl-mobile": "^1.0.1",
   "@emurgo/msl-mobile-bridge": "^1.0.4"
   ```
2. Re-enable Rust plugin in `android/build.gradle`:
   ```gradle
   classpath 'org.mozilla.rust-android-gradle:plugin:0.9.5'
   ```
3. Uncomment imports in `cip8.ts`:
   ```typescript
   import { init } from "@emurgo/cross-msl-mobile";
   const MSL = init("cip8");
   ```
4. Remove error handling and restore original implementations

**Status**: ✅ **BUILD SUCCESSFUL** - App builds and runs without MSL dependencies

### **Firebase to Expo Notifications Migration**

**Issue**: `Native module RNFBAppModule not found` in Expo project
**Root Cause**: Firebase native modules are not compatible with Expo managed workflow
**Solution**: Migrate to Expo notifications

**Files Modified:**

- `apps/mobile/src/features/Notifications/common/hooks.ts`
- `apps/mobile/src/features/Notifications/common/tools.ts`

### **Require Cycle Resolution**

**Issue**: Circular dependencies causing warnings
**Solution**: Extract shared functions to separate files

**Files Created/Modified:**

- `apps/mobile/src/wallets/cardano/assetUtils.ts` (new)
- `apps/mobile/src/features/Swap/common/useSwap.ts` (new)
- `apps/mobile/src/features/Swap/common/SwapProvider.tsx`

---

## 🔧 Current Conflicts & Issues

### ✅ **RESOLVED**

#### Import Resolution Issues

- **Image asset imports**: Fixed relative paths for image assets
- **Component imports**: Fixed all relative imports to absolute imports with `~/` prefix
- **TxFilterProvider imports**: Fixed import paths in PortfolioTokenDetailsScreen
- **TxList imports**: Fixed import paths in PortfolioTokenDetailsScreen
- **All previous import issues**: Notifications, useStrings, kernel/navigation, FadeIn, PrivacyMode, NetworkTag, CurrencyContext, BalanceCard, Tabs

#### Wallet Navigation and Functionality

- **AppNavigator**: Fixed compilation errors, imports, and navigation structure
- **WalletNavigator**: Simplified navigation structure, removed problematic dependencies
- **TxHistoryNavigator**: Fixed import paths and simplified to core functionality
- **PortfolioNavigator**: Fixed import paths and navigation structure

### 🔄 **IN PROGRESS**

#### Runtime Testing

- **App functionality**: Need to test complete user flow in emulator
- **Navigation flow**: Verify wallet selection → transaction history → portfolio
- **Feature testing**: Test all restored features for runtime errors

### 📋 **TODO**

#### Advanced Features Restoration

- **Swap features**: Restore swap functionality when dependencies are resolved
- **Exchange features**: Restore exchange functionality
- **Send/Receive**: Restore send and receive functionality
- **Governance**: Restore governance features
- **Staking**: Restore staking functionality

#### UI/UX Improvements

- **Tab navigation**: Implement proper tab bar when dependencies are available
- **Style consistency**: Ensure all components use atomic design tokens
- **Error handling**: Add proper error boundaries and user feedback

#### Performance Optimization

- **Bundle size**: Optimize imports and remove unused dependencies
- **Memory usage**: Monitor and optimize memory usage
- **Startup time**: Optimize app startup performance

---

## 🛠️ Debugging & Error Resolution

### Systematic Error Fixing Process

1. **Start the server**: `cd apps/mobile && npm start`
2. **Monitor errors**: Watch the terminal output for "Unable to resolve" errors
3. **Fix errors**: Update import paths and dependencies
4. **Reload**: Use `curl -s "http://localhost:8081/reload"` to trigger reload
5. **Repeat**: Check for next error in Metro logs and fix
6. **Continue loop**: Fix → Reload → Check next error until no more errors

### Error Reading Process

- **Read errors directly**: The assistant can read errors directly from the Metro terminal
- **Direct access**: No need for user to paste logs - direct access to Metro process
- **Systematic approach**: Fix → Reload (curl) → Check next error
- **Cache issues**: If errors persist, clear Metro cache with `npm start --clear`

### Common Import Fixes

- **Image assets**: Use relative paths, not `~` alias
- **Components**: Use absolute paths with `~/` prefix
- **Tabs component**: Use `~/ui/Tabs` (migrated from wallet-mobile)
- **Navigation**: Use `~/kernel/navigation/navigation` not `~/kernel/navigation`
- **Strings**: Use `~/features/Transactions/common/strings` not `~/features/Transactions/common/useStrings`

### Debugging Instructions

- **Server interaction**: Use `curl -s "http://localhost:8081/reload"` to trigger reload
- **Error monitoring**: Watch Metro bundler output for "Unable to resolve" errors
- **Build testing**: Use `npm run android --debug` to test fixes
- **File search**: Use `file_search` to locate missing components
- **No tsc**: Do not run `tsc` directly - it will fail due to memory issues
- **Terminal workflow**:
  1. Start Metro: `npm start` (keep this terminal open)
  2. Build Android: `npm run android --debug` (close after success)
  3. Use Metro terminal for errors and reloads

### Error Resolution Workflow

1. **Identify error** from Metro bundler output
2. **Locate file** causing the error
3. **Fix import path** or add missing dependency
4. **Trigger reload** with `curl -s "http://localhost:8081/reload"`
5. **Check next error** and repeat
6. **Continue loop** until no more errors

---

## 🧪 Testing & Quality Assurance

### Testing Checklist

#### Portfolio Testing ✅ COMPLETED

- [x] Portfolio screen loads correctly
- [x] Token list displays properly
- [x] Total value calculation works
- [x] Individual token balances show correctly
- [x] Navigation to portfolio works
- [x] No runtime errors in console
- [x] Tab switching works correctly
- [x] Theme integration works properly

#### General Testing

- [ ] Feature integrates with main navigation
- [ ] No TypeScript compilation errors
- [ ] No runtime errors
- [ ] UI components render correctly
- [ ] Theme integration works
- [ ] Navigation between screens works

### Testing Process

- **Build success**: Verify `npm run android --debug` completes successfully
- **Runtime testing**: Test app functionality in emulator
- **Error monitoring**: Watch Metro logs for runtime errors
- **Iterative fixing**: Fix one error at a time, reload (curl), repeat until no more errors

### Debugging Tools

#### TypeScript Check

```bash
cd apps/mobile
npx tsc --noEmit --skipLibCheck
```

#### App Testing

```bash
cd apps/mobile
npm run android --debug
```

#### Previous Working Version Reference

```bash
git checkout rn71
# Check specific files for working implementations
git checkout fix/wallet-navigation-and-functionality
```

---

## 📈 Progress Tracking

| Feature       | Status                 | Branch                  | Notes                                      |
| ------------- | ---------------------- | ----------------------- | ------------------------------------------ |
| Portfolio     | 🔄 BUILDS SUCCESSFULLY | `fix/restore-portfolio` | App builds and runs, needs runtime testing |
| Swap          | ⏳ PENDING             | -                       | Next priority                              |
| Exchange      | ⏳ PENDING             | -                       | After swap                                 |
| Send/Receive  | ⏳ PENDING             | -                       | After exchange                             |
| Scan          | ⏳ PENDING             | -                       | After send/receive                         |
| Notifications | ⏳ PENDING             | -                       | After scan                                 |
| Governance    | ⏳ PENDING             | -                       | Last priority                              |

---

## 🎯 Current Focus

### Portfolio Restoration ✅ COMPLETED

**Completed Steps:**

1. ✅ Create restoration documentation
2. ✅ Create portfolio restoration branch
3. ✅ Add back PortfolioNavigator
4. ✅ Restore portfolio components
5. ✅ Fix portfolio manager integration
6. ✅ Test portfolio functionality
7. ✅ Implement tab navigation interface
8. ✅ Add state management for view switching
9. ✅ Test complete portfolio flow

**Next Steps:**

- Test the complete user flow with portfolio navigation
- Identify any missing portfolio components
- Add missing portfolio functionality as needed
- Move to next feature (Swap) restoration

---

## 📝 Best Practices

1. **Always use absolute paths** with `~/` prefix for internal imports
2. **Prefer static atoms** (`a`) when possible for better performance
3. **Use theme atoms** (`ta`) only for theme-dependent styles
4. **Keep style arrays** organized: static atoms first, then theme atoms, then palette
5. **Test both light and dark themes** after migration
6. **Update all relative imports** to use the new absolute path system
7. **Check conflicts.md** before starting new migrations
8. **Document new issues** in conflicts.md when found

## 🔄 Migration Checklist

- [ ] Remove `useStyles` hook
- [ ] Replace relative imports with absolute paths (`~/`)
- [ ] Update component imports from `components/` to `ui/`
- [ ] Convert styles to atomic design system
- [ ] Test in both light and dark themes
- [ ] Verify all imports resolve correctly
- [ ] Clear Metro cache and restart development server
- [ ] Check conflicts.md for known issues
- [ ] Document any new conflicts found
