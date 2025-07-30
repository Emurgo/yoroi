# Yoroi Mobile App Migration Guidelines

## Overview
This document outlines the process for migrating and debugging the Yoroi mobile app after mass style/import changes.

## Starting the App

### Prerequisites
- Android emulator running (Medium_Phone_API_35 or similar)
- Node.js and npm installed
- Expo CLI installed

### Step-by-Step Process

1. **Start the Expo Development Server**
   ```bash
   cd apps/mobile
   npm start
   ```
   This starts the Metro bundler on `http://localhost:8081`

2. **Build and Run on Android**
   ```bash
   npm run android --debug
   ```
   This compiles the code and serves it to the running server

3. **Expected Output**
   - Build should complete successfully
   - App should install on emulator
   - App should open with development client URL

## Checking Previous Working Versions

### Using Git Tags
When you need to reference a previous working version:

1. **Stash current changes**
   ```bash
   git stash
   ```

2. **Checkout the working tag**
   ```bash
   git checkout rn71  # or other working tag
   ```

3. **Explore the working structure**
   - Check navigation structure
   - Compare component implementations
   - Note differences in imports and styling

4. **Return to current version**
   ```bash
   git checkout develop
   git stash pop
   ```

## Common Issues and Fixes

### Navigation Issues

#### Problem: Missing WalletNavigator
**Symptoms**: App crashes when trying to navigate to main wallet routes
**Solution**: Create `WalletNavigator.tsx` with proper tab navigation structure

```typescript
// apps/mobile/src/WalletNavigator.tsx
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
// ... imports

const WalletTabNavigator = () => {
  // Tab navigator with history, portfolio, discover, menu
}

export const WalletNavigator = () => {
  // Stack navigator with wallet-selection, main-wallet-routes, etc.
}
```

#### Problem: Wallet Selection Not Working
**Symptoms**: Tapping wallet shows "not implemented" alert
**Solution**: Implement proper `handleOnSelect` function

```typescript
const handleOnSelect = React.useCallback(
  async (walletMeta: Wallet.Meta) => {
    walletManager.setSelectedWalletId(walletMeta.id)
    navigateToTxHistory()
  },
  [walletManager, navigateToTxHistory],
)
```

#### Problem: PIN Navigation Broken
**Symptoms**: PIN screen doesn't navigate to wallet selection
**Solution**: Update navigation to use `manage-wallets` route

```typescript
navigation.navigate('manage-wallets', {screen: 'wallet-selection'})
```

### Import Issues

#### Problem: Malformed Imports
**Symptoms**: `~/~/` imports or missing modules
**Solution**: Use proper absolute paths with `~/` prefix

```typescript
// Correct
import {Component} from '~/features/Feature/Component'

// Incorrect
import {Component} from '~/~/features/Feature/Component'
```

#### Problem: Missing Components
**Symptoms**: "Cannot find module" errors
**Solution**: Check if component exists and use correct import path

```bash
# Search for component
find apps/mobile/src -name "ComponentName.tsx"

# Check if it exists in the expected location
ls apps/mobile/src/features/Feature/ComponentName.tsx
```

## App Structure

### Navigation Hierarchy
```
AppNavigator
├── Login (TempPinLoginScreen)
├── manage-wallets (WalletNavigator)
│   ├── wallet-selection (SelectWalletFromList)
│   ├── main-wallet-routes (WalletTabNavigator)
│   │   ├── history (TxHistoryNavigator)
│   │   ├── portfolio (PortfolioNavigator)
│   │   ├── discover (DiscoverNavigator)
│   │   └── menu (MenuNavigator)
│   ├── setup-wallet (SetupWalletNavigator)
│   ├── settings (SettingsScreenNavigator)
│   └── ... (other routes)
```

### Key Components
- **TempPinLoginScreen**: PIN entry (accepts "000000")
- **SelectWalletFromList**: Wallet selection screen
- **WalletNavigator**: Main wallet navigation with tabs
- **TxHistoryNavigator**: Transaction history and send/receive
- **PortfolioNavigator**: Portfolio and token management
- **DiscoverNavigator**: DApp browser and discovery
- **MenuNavigator**: Settings and additional features

## Testing Flow

### User Journey
1. **PIN Entry**: Enter "000000" to unlock
2. **Wallet Selection**: See wallet list and select a wallet
3. **Main Interface**: Navigate to main wallet interface with tabs
4. **Tab Navigation**: Switch between History, Portfolio, Discover, and Menu tabs

### Expected Behavior
- PIN screen should accept "000000" and navigate to wallet selection
- Wallet selection should show wallet list and allow selection
- Selecting a wallet should navigate to main interface with tabs
- Tab navigation should work between different sections

## Debugging Tools

### Terminal Commands
```bash
# Check if Expo server is running
ps aux | grep expo

# Kill existing Expo processes
pkill -f expo

# Clear Expo cache
npx expo start --clear

# Check TypeScript errors
npm run tsc

# Check linting errors
npm run lint
```

### Useful Files to Check
- `apps/mobile/src/kernel/navigation/AppNavigator.tsx` - Main app navigation
- `apps/mobile/src/WalletNavigator.tsx` - Wallet navigation structure
- `apps/mobile/src/features/WalletManager/screens/SelectWalletFromListScreen/SelectWalletFromListScreen.tsx` - Wallet selection
- `apps/mobile/src/features/Temporal_To_Remove/Auth/TempPinLoginScreen.tsx` - PIN entry

## Migration Checklist

- [ ] App starts without errors
- [ ] PIN screen accepts "000000"
- [ ] Navigation to wallet selection works
- [ ] Wallet selection shows wallet list
- [ ] Selecting wallet navigates to main interface
- [ ] Tab navigation works
- [ ] All imports resolve correctly
- [ ] No TypeScript errors
- [ ] No linting errors

## Notes

- Always work on a feature branch, not directly on develop
- Test the complete user flow after each major change
- Keep the conflicts file updated as issues are resolved
- Reference the working version (rn71 tag) when implementing missing functionality
