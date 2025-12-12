# App-Specific Imports in Packages

## Problem
Packages are importing from app-specific code (`~/kernel/*`, `~/common/*`), which breaks package isolation and makes them unusable outside the app context.

## Affected Packages

### 1. `wallet-manager` package

#### Files with app imports:
- `src/wallet-manager.ts`
  - `~/kernel/storage/EncryptedStorage` (makeWalletEncryptedStorage)

- `src/lifecycle/wallet-lifecycle.ts`
  - `~/kernel/storage/Keychain` (KeychainManager)

- `src/hooks/useLaunchWalletAfterSyncing.tsx`
  - `~/kernel/navigation/hooks/useWalletNavigation` (useWalletNavigation)

- `src/hooks/useIsOnline.ts`
  - `~/kernel/connection/ConnectionProvider` (useConnectionStatus)
  - `~/kernel/connection/types` (ConnectionStatus)

- `src/hooks/useBestBlock.tsx`
  - `~/kernel/connection/ConnectionProvider` (persistPrefixKeyword)

- `src/hooks/useGenerateWalletLink.tsx`
  - `~/kernel/storage/EncryptedStorage` (makeWalletEncryptedStorage)

### 2. `cardano-wallet` package

#### Files with app imports:
- `src/hw/hw/hw.ts`
  - `~/common/providers/BackgroundTimerContext` (useBackgroundTimerControl)

- `src/api/wallet-registration.ts`
  - `../../../packages/api/cardano/utils/url-mapping` (getBackendZeroUrl) - relative path to another package

## Recommended Solutions

### Option 1: Dependency Injection
Pass these dependencies as parameters/factory functions to the package functions/classes instead of importing them directly.

### Option 2: Move to Packages
If these utilities are reusable, move them to appropriate packages:
- Storage utilities → `@yoroi/common` or new `@yoroi/storage` package
- Connection utilities → `@yoroi/common` or new `@yoroi/connection` package
- Navigation utilities → Keep in app (should be injected)

### Option 3: Exclude from Package Build
If these files are only used in the app context and not meant to be part of the package API, exclude them from the package build entirely.

## Next Steps
1. Review each import to determine if it should be:
   - Moved to a package
   - Injected as a dependency
   - Excluded from package build
2. Refactor code to remove direct app imports
3. Update package APIs to accept dependencies as parameters
