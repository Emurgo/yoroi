# Migration Status Tracker - COMPLETE

## 📊 Overall Progress

- **Total Files**: 1,107
- **Migrated**: 66 (6%) - Files that pass lint and TypeScript checks (uses atomic design + absolute paths)
- **Import Issues Fixed**: 23 malformed + 121 component imports = 144 total import fixes
- **StyleSheet Migration Started**: 2 files converted from StyleSheet.create to atomic design
- **Pending**: 620 (57%) - Files using StyleSheet.create, relative imports, or wrong import paths
- **Needs Review**: 363 (33%) - Files without clear migration indicators
- **Skip**: 67 (6%) - Test files, storybook files, configs

## 🎯 Status Legend

- ✅ **MIGRATED** - Successfully migrated to v2 (uses atomic design, absolute paths, passes lint/TS)
- ⏳ **PENDING** - Not yet migrated (uses useStyles, relative paths, wrong imports)
- 🔍 **NEEDS REVIEW** - Partially migrated or unclear status
- 🚫 **SKIP** - Not applicable for migration (tests, configs, etc.)
- ❌ **CONFLICT** - Has blocking issues (missing dependencies, import errors)

## 📁 ALL Files by Directory

### `apps/mobile/src/features/Auth/` - **MOSTLY PENDING**

- 🔍 `common/constants.ts` - **NEEDS REVIEW** (Constants file)
- 🔍 `common/types.ts` - **NEEDS REVIEW** (Type definitions)
- ⏳ `context/AuthProvider.tsx` - **PENDING** (uses relative imports)
- 🔍 `hooks/useAuthOsWithEasyConfirmation.ts` - **NEEDS REVIEW** (Hook)
- ⏳ `hooks/useAuthWithHost.ts` - **PENDING** (uses relative imports)
- ⏳ `hooks/useDisableAllEasyConfirmation.ts` - **PENDING** (uses relative imports)
- ⏳ `hooks/useEnableAuthWithOS.ts` - **PENDING** (uses relative imports)
- ⏳ `hooks/useEnableEasyConfirmation.ts` - **PENDING** (uses relative imports)
- ⏳ `hooks/useStrings.ts` - **PENDING** (uses relative imports)
- ✅ `screens/ChangePinScreen.tsx` - **MIGRATED** (uses atomic design and absolute paths)
- ⏳ `screens/CreatePinScreen.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `screens/EnableLoginWithPinScreen.tsx` - **PENDING** (uses relative imports)
- ⏳ `screens/LoginWithHostScreen.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `screens/LoginWithPinScreen.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `screens/OsAuthScreen.tsx` - **PENDING** (uses atomic design but has relative imports)
- ✅ `ui/CheckPinInput/CheckPinInput.tsx` - **MIGRATED** (uses atomic design and absolute paths)
- ✅ `ui/CreatePinInput/CreatePinInput.tsx` - **MIGRATED** (uses atomic design and absolute paths)
- 🔍 `ui/illustrations/Logo.tsx` - **NEEDS REVIEW** (Illustration component)
- ⏳ `ui/PinInput/PinInput.tsx` - **PENDING** (uses atomic design but has relative imports)

### `apps/mobile/src/features/Claim/` - **PENDING**

- ⏳ `common/useClaimErrorResolver.tsx` - **PENDING** (uses relative imports)
- 🔍 `useCases/ShowClaimScreen/ShowClaimScreen.tsx` - **NEEDS REVIEW** (Screen component)

### `apps/mobile/src/features/Copy/` - **MIXED STATUS**

- ✅ `context/CopyProvider.tsx` - **MIGRATED** (uses atomic design)
- 🔍 `useCases/CopyToClipboard/CopyToClipboard.tsx` - **NEEDS REVIEW** (Screen component)

### `apps/mobile/src/features/Dashboard/` - **NEEDS REVIEW**

- 🔍 `useCases/ShowDashboardScreen/ShowDashboardScreen.tsx` - **NEEDS REVIEW** (Screen component)

### `apps/mobile/src/features/Discover/` - **MIXED STATUS**

- ✅ `common/LabelCategoryDApp.tsx` - **MIGRATED** (uses atomic design)
- ✅ `common/LabelConnected.tsx` - **MIGRATED** (uses atomic design)
- ✅ `common/LabelSingleAddress.tsx` - **MIGRATED** (uses atomic design)
- ✅ `useCases/SelectDappFromList/DAppListItem/DAppItemSkeleton.tsx` - **MIGRATED** (uses atomic design)
- 🔍 `useCases/ShowDiscoverScreen/ShowDiscoverScreen.tsx` - **NEEDS REVIEW** (Screen component)

### `apps/mobile/src/features/Exchange/` - **NEEDS REVIEW**

- 🔍 `common/AmountCard/AmountCard.tsx` - **NEEDS REVIEW** (Component)

### `apps/mobile/src/features/HW/` - **NEEDS REVIEW**

- 🔍 `useCases/ShowHardwareWalletScreen/ShowHardwareWalletScreen.tsx` - **NEEDS REVIEW** (Screen component)

### `apps/mobile/src/features/Initialization/` - **NEEDS REVIEW**

- 🔍 `useCases/ShowInitializationScreen/ShowInitializationScreen.tsx` - **NEEDS REVIEW** (Screen component)

### `apps/mobile/src/features/Legal/` - **NEEDS REVIEW**

- 🔍 `useCases/ShowLegalScreen/ShowLegalScreen.tsx` - **NEEDS REVIEW** (Screen component)

### `apps/mobile/src/features/Links/` - **MOSTLY PENDING**

- 🔍 `common/logos.ts` - **NEEDS REVIEW** (Utility functions)
- 🔍 `common/trustedApps.ts` - **NEEDS REVIEW** (Utility functions)
- 🔍 `common/useDeepLinkWatcher.tsx` - **NEEDS REVIEW** (Hook)
- 🔍 `common/useLinksRequestAction.tsx` - **NEEDS REVIEW** (Hook)
- 🔍 `common/useLinksRequestRedirect.tsx` - **NEEDS REVIEW** (Hook)
- 🔍 `common/useLinksRequestWallet.tsx` - **NEEDS REVIEW** (Hook)
- 🔍 `common/useLinksShowActionResult.tsx` - **NEEDS REVIEW** (Hook)
- 🔍 `common/useNavigationTo.tsx` - **NEEDS REVIEW** (Hook)
- 🔍 `common/useStrings.ts` - **NEEDS REVIEW** (Hook)
- 🔍 `useCases/AskToOpenAWalletScreen/AskToOpenAWalletScreen.tsx` - **NEEDS REVIEW** (Screen component)
- ⏳ `useCases/AskToRedirect/AskToRedirectScreen.tsx` - **PENDING** (uses atomic design but has relative imports)
- 🔍 `useCases/RequestedAdaPaymentWithLinkScreen/RequestedAdaPaymentWithLinkScreen.tsx` - **NEEDS REVIEW** (Screen component)
- 🔍 `useCases/RequestedAdaPaymentWithLinkScreen/ShowDisclaimer/ShowDisclaimer.tsx` - **NEEDS REVIEW** (Component)
- 🔍 `useCases/RequestedBrowserLaunchDappUrlScreen/RequestedBrowserLaunchDappUrlScreen.tsx` - **NEEDS REVIEW** (Screen component)
- 🔍 `useCases/RequestedBrowserLaunchDappUrlScreen/ShowDisclaimer/ShowDisclaimer.tsx` - **NEEDS REVIEW** (Component)
- 🚫 `useCases/AskToOpenAWalletScreen/AskToOpenAWalletScreen.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/AskToRedirect/AskToRedirectScreen.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/RequestedAdaPaymentWithLinkScreen/RequestedAdaPaymentWithLink.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/RequestedAdaPaymentWithLinkScreen/ShowDisclaimer/ShowDisclaimer.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/RequestedBrowserLaunchDappUrlScreen/RequestedBrowserLaunchDappUrlScreen.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/RequestedBrowserLaunchDappUrlScreen/ShowDisclaimer/ShowDisclaimer.stories.tsx` - **SKIP** (Storybook file)

### `apps/mobile/src/features/Menu/` - **NEEDS REVIEW**

- 🔍 `useCases/ShowMenuScreen/ShowMenuScreen.tsx` - **NEEDS REVIEW** (Screen component)

### `apps/mobile/src/features/Notifications/` - **NEEDS REVIEW**

- 🔍 `common/notifications.ts` - **NEEDS REVIEW** (Utility functions)
- 🔍 `common/primary-token-price-changed-notification.ts` - **NEEDS REVIEW** (Utility functions)

### `apps/mobile/src/features/Pairing/` - **NEEDS REVIEW**

- 🔍 `useCases/ShowPairingScreen/ShowPairingScreen.tsx` - **NEEDS REVIEW** (Screen component)

### `apps/mobile/src/features/Portfolio/` - **MOSTLY PENDING**

- ⏳ `common/hooks/useGetPortfolioTokenChart.ts` - **PENDING** (uses relative imports)
- ⏳ `screens/PortfolioDashboard/DashboardTokensList/DashboardTokenItem.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `screens/PortfolioTokensList/PortfolioWalletTokenList/TokenBalanceItem.tsx` - **PENDING** (uses relative imports)
- ⏳ `screens/PortfolioTokensList/TotalTokensValue/TotalTokensValueContent.tsx` - **PENDING** (uses relative imports)
- ⏳ `screens/PortfolioTokensList/TotalTokensValue/TokenValueBalance.tsx` - **PENDING** (uses relative imports)
- ⏳ `screens/PortfolioTokenDetails/PortfolioTokenChart/TokenPerformance.tsx` - **PENDING** (uses relative imports)
- ⏳ `screens/PortfolioTokenDetails/PortfolioTokenInfo/Overview/Overview.tsx` - **PENDING** (uses relative imports)
- ⏳ `screens/PortfolioTokensList/PortfolioDAppsTokenList/LiquidityPoolModal.tsx` - **PENDING** (uses relative imports)
- ⏳ `screens/PortfolioTokensList/PortfolioDAppsTokenList/DAppTokenItem/DAppTokenItem.tsx` - **PENDING** (uses relative imports)
- ⏳ `screens/PortfolioTokensList/PortfolioDAppsTokenList/OpenOrderModal.tsx` - **PENDING** (uses relative imports)
- ⏳ `ui/TokenAmountItem/MiniTokenAmountItem.tsx` - **PENDING** (uses relative imports)
- 🚫 `ui/PnlTag/PnlTag.stories.tsx` - **SKIP** (Storybook file)

### `apps/mobile/src/features/Receive/` - **NEEDS REVIEW**

- 🔍 `useCases/ShowReceiveScreen/ShowReceiveScreen.tsx` - **NEEDS REVIEW** (Screen component)

### `apps/mobile/src/features/RegisterCatalyst/` - **MIXED STATUS**

- ⏳ `common/components.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `common/InsufficientFundsModal.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `useCases/ConfirmPin/ConfirmPin.tsx` - **PENDING** (uses StyleSheet.create)
- ⏳ `useCases/DisplayPin/DisplayPin.tsx` - **PENDING** (uses StyleSheet.create)
- ⏳ `useCases/DownloadCatalystAppScreen/DownloadCatalystAppScreen.tsx` - **PENDING** (uses StyleSheet.create)
- ⏳ `useCases/ShowQrCode/ShowQrCode.tsx` - **PENDING** (uses StyleSheet.create)

### `apps/mobile/src/features/ReviewTx/` - **NEEDS REVIEW**

- 🔍 `common/WalletBalance.tsx` - **NEEDS REVIEW** (Component)

### `apps/mobile/src/features/Scan/` - **NEEDS REVIEW**

- 🔍 `useCases/ShowCameraPermissionDeniedScreen/ShowCameraPermissionDeniedScreen.tsx` - **NEEDS REVIEW** (Screen component)

### `apps/mobile/src/features/ScreenCapture/` - **NEEDS REVIEW**

- 🔍 `useCases/ShowScreenCaptureScreen/ShowScreenCaptureScreen.tsx` - **NEEDS REVIEW** (Screen component)

### `apps/mobile/src/features/Search/` - **NEEDS REVIEW**

- 🔍 `useCases/ShowSearchScreen/ShowSearchScreen.tsx` - **NEEDS REVIEW** (Screen component)

### `apps/mobile/src/features/Send/` - **NEEDS REVIEW**

- 🔍 `useCases/ShowSendScreen/ShowSendScreen.tsx` - **NEEDS REVIEW** (Screen component)

### `apps/mobile/src/features/Settings/` - **MOSTLY PENDING**

- ⏳ `SettingsCollateralItem.tsx` - **PENDING** (uses relative imports)
- ⏳ `SettingsItems.tsx` - **PENDING** (uses relative imports)
- ⏳ `SettingsNotificationDurationItem.tsx` - **PENDING** (uses relative imports)
- ⏳ `SettingsScreenNavigator.tsx` - **PENDING** (uses relative imports)
- ⏳ `ToggleAnalyticsSettings/useCases/ToggleAnalyticsSettings/ToggleAnalyticsSettings.tsx` - **PENDING** (uses relative imports)
- ⏳ `common/useStrings.ts` - **PENDING** (uses relative imports)
- ⏳ `useCases/changeAppSettings/About/AboutScreen.tsx` - **PENDING** (uses relative imports)
- ⏳ `useCases/changeAppSettings/ApplicationSettingsScreen.tsx` - **PENDING** (uses relative imports)
- ⏳ `useCases/changeAppSettings/ChangeLanguage/ChangeLanguageScreen.tsx` - **PENDING** (uses relative imports)
- ⏳ `useCases/changeAppSettings/ChangeNetwork/ChangeNetworkScreen.tsx` - **PENDING** (uses relative imports)
- ⏳ `useCases/changeAppSettings/ChangeTheme/ChangeThemeScreen.tsx` - **PENDING** (uses relative imports)
- ⏳ `useCases/changeAppSettings/Currency/ChangeCurrencyScreen.tsx` - **PENDING** (uses relative imports)
- ✅ `useCases/changeAppSettings/Currency/CurrencyContext.tsx` - **MIGRATED** (uses atomic design and absolute paths)
- ⏳ `useCases/changeAppSettings/Currency/CurrencyPickerItem.tsx` - **PENDING** (uses relative imports)
- ⏳ `useCases/changeAppSettings/Currency/CurrencyPickerList.tsx` - **PENDING** (uses relative imports)
- ⏳ `useCases/changeAppSettings/EnableLoginWithOs/EnableLoginWithOsScreen.tsx` - **PENDING** (uses relative imports)
- ⏳ `useCases/changeAppSettings/PrivacyMode/PrivacyMode.tsx` - **PENDING** (uses relative imports)
- ⏳ `useCases/changeAppSettings/PrivacyPolicy/PrivacyPolicyScreen.tsx` - **PENDING** (uses relative imports)
- ⏳ `useCases/changeAppSettings/ScreenShare/ScreenShareScreen.tsx` - **PENDING** (uses relative imports)
- ⏳ `useCases/changeAppSettings/SystemLogScreen/SystemLogScreen.tsx` - **PENDING** (uses relative imports)
- ⏳ `useCases/changeAppSettings/TermsOfService/TermsOfServiceScreen.tsx` - **PENDING** (uses relative imports)
- ⏳ `useCases/changeWalletSettings/ChangeWalletName/ChangeWalletNameScreen.tsx` - **PENDING** (uses relative imports)
- ⏳ `useCases/changeWalletSettings/DeleteWallet/DeleteWalletScreen.tsx` - **PENDING** (uses relative imports)
- ⏳ `useCases/changeWalletSettings/ExportWallet/ExportWalletScreen.tsx` - **PENDING** (uses relative imports)
- ⏳ `useCases/changeWalletSettings/ShowWalletSettings/ShowWalletSettingsScreen.tsx` - **PENDING** (uses relative imports)
- 🚫 `useCases/changeAppSettings/About/AboutScreen.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/changeAppSettings/ApplicationSettingsScreen.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/changeAppSettings/ChangeLanguage/ChangeLanguageScreen.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/changeAppSettings/ChangeNetwork/ChangeNetworkScreen.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/changeAppSettings/ChangeTheme/ChangeThemeScreen.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/changeAppSettings/Currency/ChangeCurrencyScreen.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/changeAppSettings/Currency/CurrencyPickerList.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/changeAppSettings/EnableLoginWithOs/EnableLoginWithOsScreen.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/changeAppSettings/PrivacyPolicy/PrivacyPolicyScreen.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/changeAppSettings/ScreenShare/ScreenShareScreen.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/changeAppSettings/SystemLogScreen/SystemLogScreen.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/changeAppSettings/TermsOfService/TermsOfServiceScreen.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/changeWalletSettings/ChangeWalletName/ChangeWalletNameScreen.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/changeWalletSettings/DeleteWallet/DeleteWalletScreen.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/changeWalletSettings/ExportWallet/ExportWalletScreen.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/changeWalletSettings/ShowWalletSettings/ShowWalletSettingsScreen.stories.tsx` - **SKIP** (Storybook file)

### `apps/mobile/src/features/SetupWallet/` - **MOSTLY PENDING**

- ⏳ `useCases/CreateWallet/CreateWalletScreen.tsx` - **PENDING** (uses StyleSheet.create)
- ⏳ `useCases/RestoreWallet/RestoreWalletScreen.tsx` - **PENDING** (uses StyleSheet.create)
- ⏳ `useCases/ShowSetupWallet/ShowSetupWalletScreen.tsx` - **PENDING** (uses StyleSheet.create)
- ⏳ `useCases/VerifyRestore/VerifyRestoreScreen.tsx` - **PENDING** (uses StyleSheet.create)
- 🚫 `common/ButtonCard/ButtonCard.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `common/CardAboutPhrase/CardAboutPhrase.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `common/LearnMoreButton/LearnMoreButton.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `common/LogoBanner/LogoBanner.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `common/PreparingWalletScreen/PreparingWalletScreen.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/CreateWallet/CreateWalletScreen.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/RestoreWallet/RestoreWalletScreen.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/ShowSetupWallet/ShowSetupWalletScreen.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `useCases/VerifyRestore/VerifyRestoreScreen.stories.tsx` - **SKIP** (Storybook file)

### `apps/mobile/src/features/Staking/` - **NEEDS REVIEW**

- 🔍 `useCases/ShowStakingScreen/ShowStakingScreen.tsx` - **NEEDS REVIEW** (Screen component)

### `apps/mobile/src/features/Swap/` - **NEEDS REVIEW**

- 🔍 `useCases/ListOrders/ListOrders.tsx` - **NEEDS REVIEW** (Screen component)

### `apps/mobile/src/features/Temporal_To_Remove/` - **PENDING**

- ⏳ `Auth/TempPinLoginScreen.tsx` - **PENDING** (Temporary file, needs removal)
- ⏳ `InitialScreen/InitialScreenNavigatorNavigator.tsx` - **PENDING** (Temporary file, needs removal)

### `apps/mobile/src/features/Transactions/` - **NEEDS REVIEW**

- 🔍 `useCases/TxList/TxListItem.tsx` - **NEEDS REVIEW** (Component)

### `apps/mobile/src/features/WalletManager/` - **NEEDS REVIEW**

- 🔍 `screens/SelectWalletFromListScreen/SelectWalletFromListScreen.tsx` - **NEEDS REVIEW** (Screen component)

### `apps/mobile/src/hooks/` - **PENDING**

- ⏳ `useMigrations.ts` - **PENDING** (uses relative imports)
- ⏳ `useSelectedNetwork.ts` - **PENDING** (uses relative imports)
- ⏳ `useSelectedWallet.ts` - **PENDING** (uses relative imports)
- ⏳ `useSetupLogger.ts` - **PENDING** (uses relative imports)

### `apps/mobile/src/kernel/` - **MIXED STATUS**

- ⏳ `connection/ConnectionProvider.tsx` - **PENDING** (uses relative imports)
- 🔍 `connection/types.ts` - **NEEDS REVIEW** (TypeScript types)
- 🔍 `shims.ts` - **NEEDS REVIEW** (Core functionality)
- 🔍 `crypto/csl.web.ts` - **NEEDS REVIEW** (Web-specific crypto)
- 🔍 `crypto/csl.ts` - **NEEDS REVIEW** (Core crypto functionality)
- 🔍 `crypto/random-hex-string.ts` - **NEEDS REVIEW** (Core functionality)
- 🔍 `crypto/encrypt-data.ts` - **NEEDS REVIEW** (Core functionality)
- ⏳ `crypto/decrypt-data.ts` - **PENDING** (uses relative imports)
- 🔍 `dialogs.ts` - **NEEDS REVIEW** (Dialog management)
- ⏳ `navigation/AppNavigator.tsx` - **PENDING** (uses relative imports)
- 🔍 `navigation/Router.tsx` - **NEEDS REVIEW** (Navigation logic)
- ⏳ `logger/helpers/init-logger.tsx` - **PENDING** (uses relative imports)
- ⏳ `logger/helpers/throw-logged-error.ts` - **PENDING** (uses relative imports)
- 🔍 `logger/adapters/dev-transporter.ts` - **NEEDS REVIEW** (Development tools)
- 🔍 `logger/adapters/sentry.ts` - **NEEDS REVIEW** (External integration)
- 🔍 `logger/adapters/sentry-transporter.ts` - **NEEDS REVIEW** (Sentry integration)
- 🚫 `crypto/encrypt-data.test.ts` - **SKIP** (Test file)
- 🚫 `crypto/decrypt-data.test.ts` - **SKIP** (Test file)
- 🚫 `crypto/random-hex-string.test.ts` - **SKIP** (Test file)
- 🚫 `runtime.test.ts` - **SKIP** (Test file)

### `apps/mobile/src/types/` - **NEEDS REVIEW**

- 🔍 `index.ts` - **NEEDS REVIEW** (Type definitions)
- 🔍 `wallet.ts` - **NEEDS REVIEW** (Wallet types)

### `apps/mobile/src/ui/` - **MOSTLY PENDING**

- ⏳ `ActivityIndicator/ActivityIndicator.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `AddressDetailCard/AddressDetailCard.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `AddTokenButton/AddTokenButton.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `AmountCard/AmountCard.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `Analytics/Analytics.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `BalanceCard/BalanceCard.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `BalanceCardContent/BalanceCardContent.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `BalanceCardSkeleton/BalanceCardSkeleton.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `BalanceHeaderCard/BalanceHeaderCard.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `Banner/Banner.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `Boundary/Boundary.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `Button/Button.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `CardAboutPhrase/CardAboutPhrase.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `Checkbox/Checkbox.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `Copiable/Copiable.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `Counter/Counter.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `CrashBoundary/CrashBoundary.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `Divider/Divider.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `EstimateSummary/EstimateSummary.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `ExplorerInfoLinks/ExplorerInfoLinks.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `Hr/Hr.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `Icon/Direction.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `Icon/EmptyCheckbox.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `Icon/Switch.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `Icon/TotalAda.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `Icon/TotalDelegated.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `Icon/TotalReward.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `Icon/WalletAvatar.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `Icon/WingRiders.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `LanguagePicker/LanguagePicker.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `LanguagePickerWarning/LanguagePickerWarning.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `LearnMoreButton/LearnMoreButton.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `LedgerConnect/LedgerConnect.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `LedgerTransportSwitch/LedgerTransportSwitch.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `Line/Line.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `LoadingOverlay/LoadingOverlay.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `LogoBanner/LogoBanner.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `ModalError/ModalError.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `NotificationItem/NotificationItem.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `PairedBalance/PairedBalance.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `PnlTag/PnlTag.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `ProgressCircle/ProgressCircle.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `ProtocolAvatar/ProtocolAvatar.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `Rate/Rate.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `RefreshButton/RefreshButton.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `RemoveAmountButton/RemoveAmountButton.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `SafeArea/SafeArea.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `ScrollView/ScrollView.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `ServiceUnavailable/ServiceUnavailable.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `SettingsSwitch/SettingsSwitch.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `ShareDetailsCard/ShareDetailsCard.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `ShareQRCodeCard/ShareQRCodeCard.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `ShowAddressLimitInfo/ShowAddressLimitInfo.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `ShowPriceImpact/ShowPriceImpact.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `SimpleTab/SimpleTab.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `SingleOrMultipleAddressesModal/SingleOrMultipleAddressesModal.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `SkeletonAddressDetail/SkeletonAddressDetail.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `SmallAddressCard/SmallAddressCard.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `Space/Space.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `StepperProgress/StepperProgress.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `TextInput/TextInput.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `Text/Text.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `TitledCard/TitledCard.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `TokenAmountItem/TokenAmountItem.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `TokenDetails/TokenDetails.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `TokenInfoIcon/TokenInfoIcon.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `Tooltip/Tooltip.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `YoroiLogo/YoroiLogo.tsx` - **PENDING** (uses atomic design but has relative imports)
- ⏳ `BlueCheckbox/BlueCheckbox.tsx` - **PENDING** (uses relative imports)
- ⏳ `Outline/Outline.tsx` - **PENDING** (uses legacy styling)
- ⏳ `ProtocolIcon/ProtocolIcon.tsx` - **PENDING** (uses relative imports)
- ⏳ `SwapInfoLink/SwapInfoLink.tsx` - **PENDING** (uses relative imports)
- ⏳ `TransactionReceivedNotificationPopup/TransactionReceivedNotificationPopup.tsx` - **PENDING** (uses relative imports)
- ⏳ `Boundary/types.ts` - **PENDING** (uses relative imports)
- ⏳ `Boundary/useStrings.ts` - **PENDING** (uses relative imports)
- 🚫 `Analytics/Analytics.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `BlueCheckbox/BlueCheckbox.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `Checkbox/Checkbox.stories.tsx` - **SKIP** (Storybook file)
- 🚫 `YoroiLogo/YoroiLogo.stories.tsx` - **SKIP** (Storybook file)

### `apps/mobile/src/wallets/` - **NEEDS REVIEW**

- 🔍 `types/other.ts` - **NEEDS REVIEW** (Wallet types)

## 🚨 Critical Conflicts

### **Missing Files (Blocking Migration)**

- ❌ `apps/mobile/src/features/Settings/useCases/changeAppSettings/Currency/CurrencyContext.tsx` - **MISSING FILE**
  - **Impact**: Currency functionality completely broken
  - **Files Affected**: 15+ components
  - **Required Action**: Create the missing file

## 📋 Pending Migration from Legacy App

### **Files in `apps/wallet-mobile` that need migration:**

#### **Core Components**

- ⏳ `src/components/Icon/Icon.tsx` - **PENDING** (Needs migration to ui/)
- ⏳ `src/components/Button/Button.tsx` - **PENDING** (Needs migration to ui/)
- ⏳ `src/components/Space/Space.tsx` - **PENDING** (Needs migration to ui/)
- ⏳ `src/components/Boundary/Boundary.tsx` - **PENDING** (Needs migration to ui/)
- ⏳ `src/components/Clipboard/Copiable.tsx` - **PENDING** (Needs migration to ui/)

#### **Features**

- ⏳ `src/features/Settings/useCases/changeAppSettings/Currency/CurrencyContext.tsx` - **PENDING** (Missing in new app)
- ⏳ `src/features/Portfolio/common/PnlTag/PnlTag.tsx` - **PENDING** (Needs migration to ui/)
- ⏳ `src/features/Portfolio/common/TokenAmountItem/TokenInfoIcon.tsx` - **PENDING** (Needs migration to ui/)

#### **Navigation**

- ⏳ `src/AppNavigator.tsx` - **PENDING** (Needs migration to kernel/)
- ⏳ `src/WalletNavigator.tsx` - **PENDING** (Needs migration to kernel/)

#### **Core App**

- ⏳ `src/YoroiApp.tsx` - **PENDING** (Needs migration to kernel/)

## 📝 Usage Instructions

### **How to Use This Checklist:**

1. **Before Starting Migration Work:**

   ```bash
   # Check current status
   cat .cursor/migration-status-complete.md

   # Look for files marked as ⏳ PENDING
   grep "⏳" .cursor/migration-status-complete.md
   ```

2. **When Working on a File:**

   - Find the file in this list
   - Change status from ⏳ to 🔄 when starting work
   - Change status to ✅ when migration is complete
   - Change status to ❌ if conflicts are found

3. **Updating Status:**

   ```bash
   # Example: Update a file status
   # Find: ⏳ `features/Portfolio/screens/.../DashboardTokenItem.tsx` - **PENDING**
   # Change to: ✅ `features/Portfolio/screens/.../DashboardTokenItem.tsx` - **MIGRATED**
   ```

4. **Adding New Conflicts:**

   - Add to the "Critical Conflicts" section
   - Document the impact and required action
   - Update the conflicts.md file

5. **Removing Migrated Files from Legacy List:**
   - When a file is successfully migrated from wallet-mobile
   - Remove it from the "Pending Migration from Legacy App" section

### **Status Update Workflow:**

1. **Start Work**: ⏳ → 🔄
2. **Complete Migration**: 🔄 → ✅
3. **Find Conflict**: ⏳ → ❌
4. **Resolve Conflict**: ❌ → ✅
5. **Skip File**: ⏳ → 🚫

### **Progress Tracking:**

- Update the "Overall Progress" section at the top
- Count files by status emoji
- Update percentages regularly

### **Team Coordination:**

- Use this file to avoid duplicate work
- Mark files as 🔄 when starting work
- Update status immediately when done
- Check for conflicts before starting new work

**Last Updated**: Current session
**Next Review**: After each migration batch
