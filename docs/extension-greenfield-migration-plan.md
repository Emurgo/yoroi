# Extension Greenfield Migration Plan

## Executive Summary

This document outlines a comprehensive plan to create a new browser extension project within the Yoroi monorepo, extracting shared non-UI code from the mobile app into reusable packages. The new extension will be built from the ground up using modern technologies (Vite, TypeScript, React Query 5) and will incrementally port features from the legacy `yoroi-frontend` repository.

## Current State

### Mobile App (`mobile/`)
- **Status**: Modern, well-architected, TypeScript-first
- **Patterns**: Superior architecture with clear separation of concerns
- **Features**: More complete feature set, recently refactored
- **Structure**: 
  - `src/features/WalletManager/` - Core wallet management logic
  - `src/wallets/cardano/` - Cardano wallet implementation
  - `src/kernel/` - Core infrastructure (storage, logger, etc.)
  - `packages/` - Shared packages already extracted

### Legacy Extension (`yoroi-frontend`)
- **Status**: Separate repository, older patterns
- **Issues**: 
  - Limited code sharing with mobile
  - Different dependencies and React APIs
  - Platform-specific UI and storage implementations
  - Slower development due to duplication

### Monorepo Structure
```
yoroi/
├── mobile/              # React Native mobile app
├── extension/           # NEW: Browser extension (to be created)
└── packages/            # Shared packages
    ├── types/           # Already exists
    ├── common/          # Already exists (in mobile/packages/common)
    ├── wallet-manager/  # To be extracted
    ├── cardano-wallet/  # To be extracted
    └── providers/       # To be extracted
```

## Goals

1. **Create new extension project** in monorepo using modern tooling
2. **Extract shared non-UI code** from mobile into reusable packages
3. **Build extension incrementally** by porting features from legacy repo
4. **Maximize code reuse** between mobile and extension
5. **Adopt TypeScript fully** across all packages
6. **Use latest React Query** (v5) for data fetching
7. **Leverage existing packages** (@yoroi/types, @yoroi/common, etc.)

## Phase 1: Monorepo Setup and Package Extraction

### 1.1 Root Monorepo Configuration

**Tasks:**
- [ ] Create root `package.json` with workspaces configuration
- [ ] Set up `tsconfig.base.json` with shared TypeScript config
- [ ] Configure path aliases for `@yoroi/*` packages
- [ ] Set up build tooling (Turbo or similar) for parallel builds

**Files to Create:**
```
yoroi/
├── package.json          # Root workspace config
├── tsconfig.base.json    # Base TypeScript config
└── turbo.json           # Optional: Turbo build config
```

**Key Configuration:**
```json
{
  "name": "yoroi-monorepo",
  "private": true,
  "workspaces": [
    "mobile",
    "extension",
    "packages/*"
  ],
  "scripts": {
    "install:all": "npm install",
    "build:all": "turbo run build",
    "lint:all": "turbo run lint"
  }
}
```

### 1.2 Platform-Specific Storage Adapters

**Challenge**: Mobile uses AsyncStorage/MMKV, extension needs Chrome Storage API

**Solution**: Create platform-agnostic storage interface with adapters

**Tasks:**
- [ ] Extract `App.Storage` interface from `@yoroi/types`
- [ ] Create `mountChromeStorage` adapter in `@yoroi/common`
- [ ] Create `BrowserKeychain` adapter (using localStorage or Chrome Storage)
- [ ] Ensure adapters match existing `App.Storage` interface

**Files to Create/Modify:**
```
mobile/packages/common/storage/adapters/
├── chrome-storage.ts      # NEW: Chrome Storage adapter
└── browser-keychain.ts    # NEW: Browser keychain adapter
```

**Implementation Notes:**
- `mountChromeStorage` should implement the same interface as `mountAsyncStorage`
- Use `chrome.storage.local` API for persistence
- Browser keychain can use `chrome.storage.local` with encryption or localStorage as fallback
- Export from `@yoroi/common` for use in extension

### 1.3 Extract Wallet Manager Package

**Source**: `mobile/src/features/WalletManager/`

**Target**: `packages/wallet-manager/`

**Tasks:**
- [ ] Copy wallet-manager core files to `packages/wallet-manager/src/`
- [ ] Create `package.json` with dependencies
- [ ] Create `tsconfig.json` extending base config
- [ ] Replace mobile-specific imports with `@yoroi/*` packages
- [ ] Extract `KeychainManager` interface for dependency injection
- [ ] Extract `Logger` interface for dependency injection
- [ ] Extract `EncryptedStorageFactory` interface
- [ ] Update `WalletManagerOptions` to accept injected dependencies

**Key Files to Extract:**
```
packages/wallet-manager/src/
├── wallet-manager.ts           # Core makeWalletManager function
├── state/
│   └── wallet-manager-state.ts
├── sync/
│   ├── sync-manager.ts
│   ├── sync-strategies.ts
│   └── sync-state.ts
├── creation/
│   └── wallet-creation.ts
├── lifecycle/
│   └── wallet-lifecycle.ts
├── network-manager/
│   └── get-wallet-factory.ts
└── common/
    ├── types.ts
    ├── constants.ts
    ├── keychain-manager.ts    # NEW: Interface
    ├── logger.ts              # NEW: Interface
    ├── encrypted-storage.ts   # NEW: Interface
    └── validators/
```

**Dependency Injection Pattern:**
```typescript
export type WalletManagerOptions = {
  keychainManager?: KeychainManager
  networkManagers: Record<Chain.SupportedNetworks, Network.Manager>
  rootStorage: App.Storage
  logger?: Logger
  encryptedStorageFactory?: EncryptedStorageFactory
  cardanoWalletFactory?: (params: {
    network: Chain.SupportedNetworks
    implementation: Wallet.Implementation
  }) => WalletFactory
  // ... other dependencies
}
```

**Import Replacements:**
- `~/kernel/storage/Keychain` → `KeychainManager` interface (injected)
- `~/kernel/logger/logger` → `Logger` interface (injected)
- `~/kernel/storage/EncryptedStorage` → `EncryptedStorageFactory` (injected)
- `~/wallets/cardano/*` → `@yoroi/cardano-wallet` (to be extracted)
- `~/kernel/storage/storages` → `App.Storage` from options
- `@yoroi/types` → Keep as is
- `@yoroi/common` → Keep as is

### 1.4 Extract Cardano Wallet Package

**Source**: `mobile/src/wallets/cardano/`

**Target**: `packages/cardano-wallet/`

**Tasks:**
- [ ] Copy cardano wallet files to `packages/cardano-wallet/src/`
- [ ] Create `package.json` with dependencies
- [ ] Create `tsconfig.json` extending base config
- [ ] Extract `YoroiWallet` type and `CardanoTypes`
- [ ] Extract `makeCardanoWallet` factory function
- [ ] Extract key manager, account manager, API modules
- [ ] Replace mobile-specific imports

**Key Files to Extract:**
```
packages/cardano-wallet/src/
├── cardano-wallet.ts          # makeCardanoWallet factory
├── types.ts                   # YoroiWallet, WalletEvent, etc.
├── key-manager/
│   └── key-manager.ts
├── account-manager/
│   ├── derive-address-from-xpub.ts
│   └── account-manager.ts
├── api/
│   └── ...                    # API-related modules
└── utils/
    └── ...                    # Utility functions
```

**Dependencies:**
- `@yoroi/types` - For Chain, Wallet, Network types
- `@yoroi/common` - For storage, logger interfaces
- `@yoroi/blockchains` - For cardanoConfig
- `@emurgo/cip4-js` - For wallet checksum
- `@emurgo/cross-csl-core` - For Cardano serialization

### 1.5 Extract Providers Package

**Source**: `mobile/src/features/WalletManager/context/`

**Target**: `packages/providers/`

**Tasks:**
- [ ] Copy `WalletManagerProvider.tsx` to `packages/providers/src/`
- [ ] Copy `wallet-manager-state.ts` (React state management)
- [ ] Update imports to use `@yoroi/wallet-manager`
- [ ] Create `package.json` with React as peer dependency
- [ ] Export provider and hooks

**Files:**
```
packages/providers/src/
├── WalletManagerProvider.tsx
├── wallet-manager-state.ts
└── index.ts
```

**Exports:**
```typescript
export { WalletManagerProvider } from './WalletManagerProvider'
export { useWalletManager } from './WalletManagerProvider'
export type { WalletManagerState } from './wallet-manager-state'
```

## Phase 2: Extension Project Setup

### 2.1 Initialize Extension Project

**Tasks:**
- [ ] Create `extension/` directory structure
- [ ] Initialize with Vite and React
- [ ] Configure TypeScript
- [ ] Set up Chrome extension manifest
- [ ] Configure build for extension (popup, background, content scripts)

**Project Structure:**
```
extension/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── manifest.json
│   ├── popup/
│   │   ├── index.html
│   │   └── index.tsx
│   ├── background/
│   │   └── index.ts
│   ├── content/
│   │   └── index.ts
│   ├── kernel/
│   │   ├── query-client.ts
│   │   ├── storage/
│   │   │   └── storages.ts
│   │   ├── wallet-manager.ts
│   │   └── platform/
│   │       └── index.ts
│   ├── navigation/
│   │   ├── routes.tsx
│   │   └── AppNavigator.tsx
│   └── App.tsx
└── .gitignore
```

### 2.2 Extension Configuration Files

**package.json:**
```json
{
  "name": "@yoroi/extension",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "@yoroi/types": "workspace:*",
    "@yoroi/common": "workspace:*",
    "@yoroi/wallet-manager": "workspace:*",
    "@yoroi/cardano-wallet": "workspace:*",
    "@yoroi/providers": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@types/chrome": "^0.0.251",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vite-plugin-web-extension": "^4.0.0"
  }
}
```

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { webExtension } from 'vite-plugin-web-extension'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: './src/manifest.json',
    }),
  ],
  resolve: {
    alias: {
      '@yoroi/types': path.resolve(__dirname, '../packages/types/src'),
      '@yoroi/common': path.resolve(__dirname, '../packages/common/src'),
      '@yoroi/wallet-manager': path.resolve(__dirname, '../packages/wallet-manager/src'),
      '@yoroi/cardano-wallet': path.resolve(__dirname, '../packages/cardano-wallet/src'),
      '@yoroi/providers': path.resolve(__dirname, '../packages/providers/src'),
    },
  },
})
```

**manifest.json:**
```json
{
  "manifest_version": 3,
  "name": "Yoroi Wallet",
  "version": "0.1.0",
  "description": "Cardano wallet extension",
  "permissions": [
    "storage",
    "alarms"
  ],
  "action": {
    "default_popup": "popup/index.html"
  },
  "background": {
    "service_worker": "background/index.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content/index.js"]
    }
  ]
}
```

### 2.3 Extension Infrastructure Setup

**Tasks:**
- [ ] Set up React Query 5 with Chrome Storage persistence
- [ ] Create storage instances using Chrome Storage adapter
- [ ] Initialize wallet manager with browser-specific dependencies
- [ ] Set up React Router for navigation
- [ ] Create platform abstraction layer

**kernel/query-client.ts:**
```typescript
import { QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
})

// Persist to Chrome Storage
const persister = createSyncStoragePersister({
  storage: {
    getItem: (key) => chrome.storage.local.get(key).then(r => r[key] ?? null),
    setItem: (key, value) => chrome.storage.local.set({ [key]: value }),
    removeItem: (key) => chrome.storage.local.remove(key),
  },
})

persistQueryClient({
  queryClient,
  persister,
})
```

**kernel/storage/storages.ts:**
```typescript
import { mountChromeStorage } from '@yoroi/common'
import { BrowserKeychain } from '@yoroi/common'

export const rootStorage = mountChromeStorage({ path: '' })
export const keychainManager = BrowserKeychain
```

**kernel/wallet-manager.ts:**
```typescript
import { makeWalletManager } from '@yoroi/wallet-manager'
import { makeCardanoWallet } from '@yoroi/cardano-wallet'
import { networkManagers } from '@yoroi/blockchains'
import { rootStorage, keychainManager } from './storage/storages'
import { logger } from './logger' // Browser-specific logger
import { makeWalletEncryptedStorage } from './storage/encrypted-storage'

export const walletManager = makeWalletManager({
  networkManagers,
  rootStorage,
  keychainManager,
  logger,
  encryptedStorageFactory: makeWalletEncryptedStorage,
  cardanoWalletFactory: ({ network, implementation }) => {
    return makeCardanoWallet(
      networkManagers[network],
      implementation
    )
  },
})
```

### 2.4 Extension App Structure

**App.tsx:**
```typescript
import { QueryClientProvider } from '@tanstack/react-query'
import { WalletManagerProvider } from '@yoroi/providers'
import { queryClient } from './kernel/query-client'
import { walletManager } from './kernel/wallet-manager'
import { AppNavigator } from './navigation/AppNavigator'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletManagerProvider walletManager={walletManager}>
        <AppNavigator />
      </WalletManagerProvider>
    </QueryClientProvider>
  )
}
```

## Phase 3: Feature Migration Strategy

### 3.1 Migration Order

**Priority 1: Core Infrastructure**
1. Authentication flow
2. Wallet creation/import
3. Wallet selection/switching
4. Basic balance display

**Priority 2: Core Wallet Features**
5. Send transaction
6. Receive addresses
7. Transaction history
8. Staking (delegation)

**Priority 3: Advanced Features**
9. DApp connector (CIP-30)
10. Swap functionality
11. Governance voting
12. Hardware wallet support

### 3.2 Migration Process for Each Feature

**Step 1: Analyze Legacy Implementation**
- [ ] Review feature in `yoroi-frontend`
- [ ] Identify dependencies and data flow
- [ ] Map to mobile app equivalent (if exists)
- [ ] Document differences and platform-specific code

**Step 2: Port UI Components**
- [ ] Create new React components in `extension/src/features/[feature]/`
- [ ] Use modern React patterns (hooks, functional components)
- [ ] Adapt UI for browser extension constraints (popup size, etc.)
- [ ] Use shared theme/styling from `@yoroi/theme` if applicable

**Step 3: Integrate Shared Logic**
- [ ] Use `@yoroi/wallet-manager` for wallet operations
- [ ] Use `@yoroi/cardano-wallet` for Cardano-specific logic
- [ ] Use React Query 5 for data fetching
- [ ] Use shared types from `@yoroi/types`

**Step 4: Test and Refine**
- [ ] Test feature in extension context
- [ ] Verify data persistence with Chrome Storage
- [ ] Test cross-tab synchronization
- [ ] Performance optimization

### 3.3 Example: Authentication Feature Migration

**Legacy Location**: `yoroi-frontend/src/features/auth/`

**New Location**: `extension/src/features/auth/`

**Components to Create:**
```
extension/src/features/auth/
├── components/
│   ├── LoginScreen.tsx
│   ├── PinInput.tsx
│   └── BiometricPrompt.tsx
├── hooks/
│   └── useAuth.ts
└── utils/
    └── auth-helpers.ts
```

**Integration Points:**
- Use `walletManager` from `@yoroi/providers` to access wallets
- Use `keychainManager` for secure key storage
- Use React Query for auth state management
- Persist auth state in Chrome Storage

## Phase 4: Challenges and Solutions

### Challenge 1: Storage API Differences

**Problem**: Mobile uses AsyncStorage/MMKV, extension needs Chrome Storage

**Solution**: 
- Created `mountChromeStorage` adapter implementing `App.Storage` interface
- Both platforms use same interface, different implementations
- Storage paths and structure remain consistent

### Challenge 2: Keychain/Biometric Auth

**Problem**: Mobile has native biometric auth, browser doesn't

**Solution**:
- Create `BrowserKeychain` adapter using Chrome Storage with encryption
- For sensitive operations, prompt for password instead of biometric
- Can use WebAuthn API for future biometric support

### Challenge 3: Background Processing

**Problem**: Mobile can run background tasks, extension has service worker limitations

**Solution**:
- Use Chrome Alarms API for periodic tasks (sync, etc.)
- Use service worker for background processing
- Leverage React Query's background refetch capabilities

### Challenge 4: Navigation Differences

**Problem**: Mobile uses React Navigation, extension needs different navigation

**Solution**:
- Use React Router for extension navigation
- Create popup-specific navigation patterns
- Handle deep linking differently (Chrome extension URLs)

### Challenge 5: State Synchronization Across Tabs

**Problem**: Extension can have multiple tabs/windows open

**Solution**:
- Use Chrome Storage events for cross-tab communication
- Use React Query's persistence and synchronization
- Implement custom event system for wallet state updates

### Challenge 6: Dependencies and Build Size

**Problem**: Extension has stricter size constraints than mobile

**Solution**:
- Use Vite for optimal bundling and tree-shaking
- Lazy load features where possible
- Split code for popup, background, and content scripts
- Monitor bundle size and optimize dependencies

## Phase 5: Testing Strategy

### 5.1 Unit Tests
- [ ] Test extracted packages independently
- [ ] Mock platform-specific adapters
- [ ] Test wallet manager logic
- [ ] Test cardano wallet operations

### 5.2 Integration Tests
- [ ] Test extension with real Chrome Storage
- [ ] Test wallet creation and loading
- [ ] Test transaction building and signing
- [ ] Test cross-tab synchronization

### 5.3 E2E Tests
- [ ] Use Playwright or similar for extension testing
- [ ] Test complete user flows
- [ ] Test with real Cardano testnet
- [ ] Test error scenarios and edge cases

## Phase 6: Documentation

### 6.1 Package Documentation
- [ ] Document `@yoroi/wallet-manager` API
- [ ] Document `@yoroi/cardano-wallet` API
- [ ] Document `@yoroi/providers` usage
- [ ] Create migration guides for each package

### 6.2 Extension Documentation
- [ ] Document extension architecture
- [ ] Document feature migration process
- [ ] Create developer setup guide
- [ ] Document build and deployment process

## Success Criteria

1. ✅ New extension project created and building successfully
2. ✅ Wallet manager package extracted and working in both mobile and extension
3. ✅ Cardano wallet package extracted and shared
4. ✅ First feature (authentication) migrated and working
5. ✅ Extension can create and load wallets
6. ✅ Extension can display balances and transaction history
7. ✅ Extension can send transactions
8. ✅ All shared packages have TypeScript types
9. ✅ Tests passing for extracted packages
10. ✅ Documentation complete

## Timeline Estimate

- **Phase 1**: 2-3 weeks (Package extraction)
- **Phase 2**: 1 week (Extension setup)
- **Phase 3**: 8-12 weeks (Feature migration, incremental)
- **Phase 4**: Ongoing (Address challenges as they arise)
- **Phase 5**: Ongoing (Testing throughout)
- **Phase 6**: Ongoing (Documentation throughout)

**Total**: ~3-4 months for core functionality, ongoing for full feature parity

## Notes

- This is a greenfield approach to avoid conflicts from refactoring legacy extension in place
- Features will be migrated incrementally, allowing for testing and refinement
- Mobile app remains the source of truth for patterns and best practices
- Extension will eventually replace legacy `yoroi-frontend` repository
- All packages should be platform-agnostic where possible
- Use dependency injection for platform-specific code

