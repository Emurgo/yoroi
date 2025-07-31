# Conflicts and Issues

## ✅ RESOLVED

### Import Resolution Issues

- **Image asset imports**: Fixed relative paths for image assets (e.g., `info-light-green.png`)
- **Component imports**: Fixed all relative imports to absolute imports with `~/` prefix
- **TxFilterProvider imports**: Fixed import paths in PortfolioTokenDetailsScreen
- **TxList imports**: Fixed import paths in PortfolioTokenDetailsScreen
- **All previous import issues**: Notifications, useStrings, kernel/navigation, FadeIn, PrivacyMode, NetworkTag, CurrencyContext, BalanceCard, Tabs

### Wallet Navigation and Functionality

- **AppNavigator**: Fixed compilation errors, imports, and navigation structure
- **WalletNavigator**: Simplified navigation structure, removed problematic dependencies
- **TxHistoryNavigator**: Fixed import paths and simplified to core functionality
- **PortfolioNavigator**: Fixed import paths and theme usage

### Portfolio Feature Restoration

- **PortfolioNavigator**: Fixed import paths and navigation structure
- **Portfolio screens**: Fixed BalanceCard, Tabs, and other component imports
- **Portfolio functionality**: Basic portfolio navigation and screens working

## 🔄 IN PROGRESS

### Runtime Testing

- **App functionality**: Need to test complete user flow in emulator
- **Navigation flow**: Verify wallet selection → transaction history → portfolio
- **Feature testing**: Test all restored features for runtime errors

## 📋 TODO

### Advanced Features Restoration

- **Swap features**: Restore swap functionality when dependencies are resolved
- **Exchange features**: Restore exchange functionality
- **Send/Receive**: Restore send and receive functionality
- **Governance**: Restore governance features
- **Staking**: Restore staking functionality

### UI/UX Improvements

- **Tab navigation**: Implement proper tab bar when dependencies are available
- **Style consistency**: Ensure all components use atomic design tokens
- **Error handling**: Add proper error boundaries and user feedback

### Performance Optimization

- **Bundle size**: Optimize imports and remove unused dependencies
- **Memory usage**: Monitor and optimize memory usage
- **Startup time**: Optimize app startup performance
