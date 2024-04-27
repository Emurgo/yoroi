/* do not change this file, it is auto generated by storybook. */

import {
  configure,
  addDecorator,
  addParameters,
  addArgsEnhancer,
  clearDecorators,
} from "@storybook/react-native";

global.STORIES = [
  {
    titlePrefix: "",
    directory: "./.storybook/stories",
    files: "**/*.stories.?(ts|tsx|js|jsx)",
    importPathMatcher:
      "^\\.[\\\\/](?:\\.storybook\\/stories(?:\\/(?!\\.)(?:(?:(?!(?:^|\\/)\\.).)*?)\\/|\\/|$)(?!\\.)(?=.)[^/]*?\\.stories\\.(?:ts|tsx|js|jsx)?)$",
  },
  {
    titlePrefix: "",
    directory: "./src",
    files: "**/*.stories.?(ts|tsx|js|jsx)",
    importPathMatcher:
      "^\\.[\\\\/](?:src(?:\\/(?!\\.)(?:(?:(?!(?:^|\\/)\\.).)*?)\\/|\\/|$)(?!\\.)(?=.)[^/]*?\\.stories\\.(?:ts|tsx|js|jsx)?)$",
  },
];

import "@storybook/addon-ondevice-controls/register";
import "@storybook/addon-ondevice-actions/register";

import { argsEnhancers } from "@storybook/addon-actions/dist/modern/preset/addArgs";

import { decorators, parameters } from "./preview";

if (decorators) {
  if (__DEV__) {
    // stops the warning from showing on every HMR
    require("react-native").LogBox.ignoreLogs([
      "`clearDecorators` is deprecated and will be removed in Storybook 7.0",
    ]);
  }
  // workaround for global decorators getting infinitely applied on HMR, see https://github.com/storybookjs/react-native/issues/185
  clearDecorators();
  decorators.forEach((decorator) => addDecorator(decorator));
}

if (parameters) {
  addParameters(parameters);
}

try {
  argsEnhancers.forEach((enhancer) => addArgsEnhancer(enhancer));
} catch {}

const getStories = () => {
  return {
    "./.storybook/stories/Button/ExampleButton.stories.js": require("./stories/Button/ExampleButton.stories.js"),
    "./src/auth/backgroundTimeout.stories.tsx": require("../src/auth/backgroundTimeout.stories.tsx"),
    "./src/auth/ChangePinScreen/ChangePinScreen.stories.tsx": require("../src/auth/ChangePinScreen/ChangePinScreen.stories.tsx"),
    "./src/auth/CheckPinInput/CheckPinInput.stories.tsx": require("../src/auth/CheckPinInput/CheckPinInput.stories.tsx"),
    "./src/auth/CreatePinInput/CreatePinInput.stories.tsx": require("../src/auth/CreatePinInput/CreatePinInput.stories.tsx"),
    "./src/auth/CreatePinScreen/CreatePinScreen.stories.tsx": require("../src/auth/CreatePinScreen/CreatePinScreen.stories.tsx"),
    "./src/auth/OsAuthScreen/OsAuthScreen.stories.tsx": require("../src/auth/OsAuthScreen/OsAuthScreen.stories.tsx"),
    "./src/auth/OsLoginScreen/OsLoginScreen.stories.tsx": require("../src/auth/OsLoginScreen/OsLoginScreen.stories.tsx"),
    "./src/auth/PinInput/PinInput.stories.tsx": require("../src/auth/PinInput/PinInput.stories.tsx"),
    "./src/auth/PinLoginScreen/PinLoginScreen.stories.tsx": require("../src/auth/PinLoginScreen/PinLoginScreen.stories.tsx"),
    "./src/Catalyst/VotingBanner.stories.tsx": require("../src/Catalyst/VotingBanner.stories.tsx"),
    "./src/Catalyst/VotingRegistration.stories.tsx": require("../src/Catalyst/VotingRegistration.stories.tsx"),
    "./src/components/AmountItem/AmountItem.stories.tsx": require("../src/components/AmountItem/AmountItem.stories.tsx"),
    "./src/components/Analytics/Analytics.stories.tsx": require("../src/components/Analytics/Analytics.stories.tsx"),
    "./src/components/BlueCheckbox/BlueCheckbox.stories.tsx": require("../src/components/BlueCheckbox/BlueCheckbox.stories.tsx"),
    "./src/components/Boundary/Boundary.stories.tsx": require("../src/components/Boundary/Boundary.stories.tsx"),
    "./src/components/Button/Button.stories.tsx": require("../src/components/Button/Button.stories.tsx"),
    "./src/components/CameraCodeScanner/CameraCodeScanner.stories.tsx": require("../src/components/CameraCodeScanner/CameraCodeScanner.stories.tsx"),
    "./src/components/Checkbox/Checkbox.stories.tsx": require("../src/components/Checkbox/Checkbox.stories.tsx"),
    "./src/components/ConfirmTx/ConfirmTx.stories.tsx": require("../src/components/ConfirmTx/ConfirmTx.stories.tsx"),
    "./src/components/ConfirmTx/Dialog.stories.tsx": require("../src/components/ConfirmTx/Dialog.stories.tsx"),
    "./src/components/ConfirmTxWithHwModal/ConfirmTxWithHwModal.stories.tsx": require("../src/components/ConfirmTxWithHwModal/ConfirmTxWithHwModal.stories.tsx"),
    "./src/components/ConfirmTxWithOsModal/ConfirmTxWithOsModal.stories.tsx": require("../src/components/ConfirmTxWithOsModal/ConfirmTxWithOsModal.stories.tsx"),
    "./src/components/ConfirmTxWithSpendingPasswordModal/ConfirmTxWithSpendingPasswordModal.stories.tsx": require("../src/components/ConfirmTxWithSpendingPasswordModal/ConfirmTxWithSpendingPasswordModal.stories.tsx"),
    "./src/components/DangerousActionModal/DangerousActionModal.stories.tsx": require("../src/components/DangerousActionModal/DangerousActionModal.stories.tsx"),
    "./src/components/ErrorBoundary/ErrorBoundary.stories.tsx": require("../src/components/ErrorBoundary/ErrorBoundary.stories.tsx"),
    "./src/components/ErrorBoundary/ExpandableItem/ExpandableItem.stories.tsx": require("../src/components/ErrorBoundary/ExpandableItem/ExpandableItem.stories.tsx"),
    "./src/components/ErrorModal/ErrorModal.stories.tsx": require("../src/components/ErrorModal/ErrorModal.stories.tsx"),
    "./src/components/ErrorPanel/ErrorPanel.stories.tsx": require("../src/components/ErrorPanel/ErrorPanel.stories.tsx"),
    "./src/components/ExpandableInfoCard/ExpandableInfoCard.stories.tsx": require("../src/components/ExpandableInfoCard/ExpandableInfoCard.stories.tsx"),
    "./src/components/HideableText/HideableText.stories.tsx": require("../src/components/HideableText/HideableText.stories.tsx"),
    "./src/components/Icon/Icon.stories.tsx": require("../src/components/Icon/Icon.stories.tsx"),
    "./src/components/LanguagePicker/LanguagePicker.stories.tsx": require("../src/components/LanguagePicker/LanguagePicker.stories.tsx"),
    "./src/components/LanguagePicker/LanguagePickerWarning.stories.tsx": require("../src/components/LanguagePicker/LanguagePickerWarning.stories.tsx"),
    "./src/components/Link/Link.stories.tsx": require("../src/components/Link/Link.stories.tsx"),
    "./src/components/Loading/Loading.stories.tsx": require("../src/components/Loading/Loading.stories.tsx"),
    "./src/components/LoadingOverlay/LoadingOverlay.stories.tsx": require("../src/components/LoadingOverlay/LoadingOverlay.stories.tsx"),
    "./src/components/ModalError/ModalError.stories.tsx": require("../src/components/ModalError/ModalError.stories.tsx"),
    "./src/components/ModalScreenWrapper/ModalScreenWrapper.stories.tsx": require("../src/components/ModalScreenWrapper/ModalScreenWrapper.stories.tsx"),
    "./src/components/NftImageGallery/NftImageGallery.stories.tsx": require("../src/components/NftImageGallery/NftImageGallery.stories.tsx"),
    "./src/components/NftPreview/NftPreview.stories.tsx": require("../src/components/NftPreview/NftPreview.stories.tsx"),
    "./src/components/PairedBalance/PairedBalance.stories.tsx": require("../src/components/PairedBalance/PairedBalance.stories.tsx"),
    "./src/components/PressableIcon/PressableIcon.stories.tsx": require("../src/components/PressableIcon/PressableIcon.stories.tsx"),
    "./src/components/StandardModal/StandardModal.stories.tsx": require("../src/components/StandardModal/StandardModal.stories.tsx"),
    "./src/components/TextInput/TextInput.stories.tsx": require("../src/components/TextInput/TextInput.stories.tsx"),
    "./src/components/TokenAmountItem/TokenAmountItem.stories.tsx": require("../src/components/TokenAmountItem/TokenAmountItem.stories.tsx"),
    "./src/components/TokenIcon/ModeratedNftIcon.stories.tsx": require("../src/components/TokenIcon/ModeratedNftIcon.stories.tsx"),
    "./src/components/TokenIcon/TokenIcon.stories.tsx": require("../src/components/TokenIcon/TokenIcon.stories.tsx"),
    "./src/components/YoroiLogo/YoroiLogo.stories.tsx": require("../src/components/YoroiLogo/YoroiLogo.stories.tsx"),
    "./src/Dashboard/Dashboard.stories.tsx": require("../src/Dashboard/Dashboard.stories.tsx"),
    "./src/Dashboard/StakePoolInfos.stories.tsx": require("../src/Dashboard/StakePoolInfos.stories.tsx"),
    "./src/Dashboard/WithdrawStakingRewards/ConfirmTx/ConfirmTxWithHW.stories.tsx": require("../src/Dashboard/WithdrawStakingRewards/ConfirmTx/ConfirmTxWithHW.stories.tsx"),
    "./src/Dashboard/WithdrawStakingRewards/ConfirmTx/ConfirmTxWithOS.stories.tsx": require("../src/Dashboard/WithdrawStakingRewards/ConfirmTx/ConfirmTxWithOS.stories.tsx"),
    "./src/Dashboard/WithdrawStakingRewards/ConfirmTx/ConfirmTxWithPassword.stories.tsx": require("../src/Dashboard/WithdrawStakingRewards/ConfirmTx/ConfirmTxWithPassword.stories.tsx"),
    "./src/Dashboard/WithdrawStakingRewards/TransferSummary/TransferSummary.stories.tsx": require("../src/Dashboard/WithdrawStakingRewards/TransferSummary/TransferSummary.stories.tsx"),
    "./src/Dashboard/WithdrawStakingRewards/WithdrawStakingRewards.stories.tsx": require("../src/Dashboard/WithdrawStakingRewards/WithdrawStakingRewards.stories.tsx"),
    "./src/features/Claim/illustrations/Ilustrations.stories.tsx": require("../src/features/Claim/illustrations/Ilustrations.stories.tsx"),
    "./src/features/Claim/useCases/AskConfirmation.stories.tsx": require("../src/features/Claim/useCases/AskConfirmation.stories.tsx"),
    "./src/features/Claim/useCases/ShowSuccessScreen.stories.tsx": require("../src/features/Claim/useCases/ShowSuccessScreen.stories.tsx"),
    "./src/features/Discover/common/LabelCategoryDApp.stories.tsx": require("../src/features/Discover/common/LabelCategoryDApp.stories.tsx"),
    "./src/features/Discover/common/LabelConnected.stories.tsx": require("../src/features/Discover/common/LabelConnected.stories.tsx"),
    "./src/features/Discover/useCases/BrowseDapp/BrowseDappScreen.stories.tsx": require("../src/features/Discover/useCases/BrowseDapp/BrowseDappScreen.stories.tsx"),
    "./src/features/Discover/useCases/BrowseDapp/BrowserSearchToolbar.stories.tsx": require("../src/features/Discover/useCases/BrowseDapp/BrowserSearchToolbar.stories.tsx"),
    "./src/features/Discover/useCases/BrowseDapp/BrowserTabBar.stories.tsx": require("../src/features/Discover/useCases/BrowseDapp/BrowserTabBar.stories.tsx"),
    "./src/features/Discover/useCases/BrowseDapp/BrowserTabsBar.stories.tsx": require("../src/features/Discover/useCases/BrowseDapp/BrowserTabsBar.stories.tsx"),
    "./src/features/Discover/useCases/BrowseDapp/BrowserToolbar.stories.tsx": require("../src/features/Discover/useCases/BrowseDapp/BrowserToolbar.stories.tsx"),
    "./src/features/Discover/useCases/BrowseDapp/WebViewItem.stories.tsx": require("../src/features/Discover/useCases/BrowseDapp/WebViewItem.stories.tsx"),
    "./src/features/Discover/useCases/SearchDappInBrowser/SearchDappInBrowserScreen.stories.tsx": require("../src/features/Discover/useCases/SearchDappInBrowser/SearchDappInBrowserScreen.stories.tsx"),
    "./src/features/Discover/useCases/SelectDappFromList/CountDAppsAvailable/CountDAppsAvailable.stories.tsx": require("../src/features/Discover/useCases/SelectDappFromList/CountDAppsAvailable/CountDAppsAvailable.stories.tsx"),
    "./src/features/Discover/useCases/SelectDappFromList/DAppExplorerTabItem/DAppExplorerTabItem.stories.tsx": require("../src/features/Discover/useCases/SelectDappFromList/DAppExplorerTabItem/DAppExplorerTabItem.stories.tsx"),
    "./src/features/Discover/useCases/SelectDappFromList/DAppListItem/DAppItemSkeleton.stories.tsx": require("../src/features/Discover/useCases/SelectDappFromList/DAppListItem/DAppItemSkeleton.stories.tsx"),
    "./src/features/Discover/useCases/SelectDappFromList/DAppListItem/DAppListItem.stories.tsx": require("../src/features/Discover/useCases/SelectDappFromList/DAppListItem/DAppListItem.stories.tsx"),
    "./src/features/Discover/useCases/SelectDappFromList/DAppTypes/DAppTypes.stories.tsx": require("../src/features/Discover/useCases/SelectDappFromList/DAppTypes/DAppTypes.stories.tsx"),
    "./src/features/Discover/useCases/SelectDappFromList/SelectDappFromListScreen.stories.tsx": require("../src/features/Discover/useCases/SelectDappFromList/SelectDappFromListScreen.stories.tsx"),
    "./src/features/Discover/useCases/SelectDappFromList/WelcomeDApp.stories.tsx": require("../src/features/Discover/useCases/SelectDappFromList/WelcomeDApp.stories.tsx"),
    "./src/features/Exchange/common/AmountCard/AmountCard.stories.tsx": require("../src/features/Exchange/common/AmountCard/AmountCard.stories.tsx"),
    "./src/features/Exchange/common/ButtonActionGroup/ButtonActionGroup.stories.tsx": require("../src/features/Exchange/common/ButtonActionGroup/ButtonActionGroup.stories.tsx"),
    "./src/features/Exchange/common/DescribeAction/DescribeAction.stories.tsx": require("../src/features/Exchange/common/DescribeAction/DescribeAction.stories.tsx"),
    "./src/features/Exchange/common/ProviderItem/ProviderItem.stories.tsx": require("../src/features/Exchange/common/ProviderItem/ProviderItem.stories.tsx"),
    "./src/features/Exchange/common/ShowBuyBanner/BuyBannerBig.stories.tsx": require("../src/features/Exchange/common/ShowBuyBanner/BuyBannerBig.stories.tsx"),
    "./src/features/Exchange/common/ShowBuyBanner/BuyBannerSmall.stories.tsx": require("../src/features/Exchange/common/ShowBuyBanner/BuyBannerSmall.stories.tsx"),
    "./src/features/Exchange/common/ShowBuyBanner/ShowBuyBanner.stories.tsx": require("../src/features/Exchange/common/ShowBuyBanner/ShowBuyBanner.stories.tsx"),
    "./src/features/Exchange/useCases/CreateExchangeOrderScreen/CreateExchangeOrderScreen.stories.tsx": require("../src/features/Exchange/useCases/CreateExchangeOrderScreen/CreateExchangeOrderScreen.stories.tsx"),
    "./src/features/Exchange/useCases/CreateExchangeOrderScreen/EditAmount/EditAmount.stories.tsx": require("../src/features/Exchange/useCases/CreateExchangeOrderScreen/EditAmount/EditAmount.stories.tsx"),
    "./src/features/Exchange/useCases/CreateExchangeOrderScreen/SelectBuyOrSell/SelectBuyOrSell.stories.tsx": require("../src/features/Exchange/useCases/CreateExchangeOrderScreen/SelectBuyOrSell/SelectBuyOrSell.stories.tsx"),
    "./src/features/Exchange/useCases/CreateExchangeOrderScreen/ShowDisclaimer/ShowDisclaimer.stories.tsx": require("../src/features/Exchange/useCases/CreateExchangeOrderScreen/ShowDisclaimer/ShowDisclaimer.stories.tsx"),
    "./src/features/Exchange/useCases/SelectProviderFromListScreen/SelectProviderFromListScreen.stories.tsx": require("../src/features/Exchange/useCases/SelectProviderFromListScreen/SelectProviderFromListScreen.stories.tsx"),
    "./src/features/Exchange/useCases/ShowExchangeResultOrderScreen/ContentResult/ContentResult.stories.tsx": require("../src/features/Exchange/useCases/ShowExchangeResultOrderScreen/ContentResult/ContentResult.stories.tsx"),
    "./src/features/Exchange/useCases/ShowExchangeResultOrderScreen/ShowExchangeResultOrderScreen.stories.tsx": require("../src/features/Exchange/useCases/ShowExchangeResultOrderScreen/ShowExchangeResultOrderScreen.stories.tsx"),
    "./src/features/Initialization/AnalyticsChangedScreen/AnalyticsChangedScreen.stories.tsx": require("../src/features/Initialization/AnalyticsChangedScreen/AnalyticsChangedScreen.stories.tsx"),
    "./src/features/Initialization/InitialScreen/InitialScreen.stories.tsx": require("../src/features/Initialization/InitialScreen/InitialScreen.stories.tsx"),
    "./src/features/Initialization/LanguagePickerScreen/LanguagePickerScreen.stories.tsx": require("../src/features/Initialization/LanguagePickerScreen/LanguagePickerScreen.stories.tsx"),
    "./src/features/Initialization/TermsOfServiceChangedScreen/TermsOfServiceChangedScreen.stories.tsx": require("../src/features/Initialization/TermsOfServiceChangedScreen/TermsOfServiceChangedScreen.stories.tsx"),
    "./src/features/Links/useCases/AskToOpenAWalletScreen/AskToOpenAWalletScreen.stories.tsx": require("../src/features/Links/useCases/AskToOpenAWalletScreen/AskToOpenAWalletScreen.stories.tsx"),
    "./src/features/Links/useCases/AskToRedirect/AskToRedirectScreen.stories.tsx": require("../src/features/Links/useCases/AskToRedirect/AskToRedirectScreen.stories.tsx"),
    "./src/features/Links/useCases/RequestedAdaPaymentWithLinkScreen/RequestedAdaPaymentWithLink.stories.tsx": require("../src/features/Links/useCases/RequestedAdaPaymentWithLinkScreen/RequestedAdaPaymentWithLink.stories.tsx"),
    "./src/features/Links/useCases/RequestedAdaPaymentWithLinkScreen/ShowDisclaimer/ShowDisclaimer.stories.tsx": require("../src/features/Links/useCases/RequestedAdaPaymentWithLinkScreen/ShowDisclaimer/ShowDisclaimer.stories.tsx"),
    "./src/features/Menu/Menu.stories.tsx": require("../src/features/Menu/Menu.stories.tsx"),
    "./src/features/Receive/common/AddressDetailCard/AddressDetailCard.stories.tsx": require("../src/features/Receive/common/AddressDetailCard/AddressDetailCard.stories.tsx"),
    "./src/features/Receive/common/AddressModal/AddressModal.stories.tsx": require("../src/features/Receive/common/AddressModal/AddressModal.stories.tsx"),
    "./src/features/Receive/common/ShareDetailsCard/ShareDetailsCard.stories.tsx": require("../src/features/Receive/common/ShareDetailsCard/ShareDetailsCard.stories.tsx"),
    "./src/features/Receive/common/ShareQRCodeCard/ShareQRCodeCard.stories.tsx": require("../src/features/Receive/common/ShareQRCodeCard/ShareQRCodeCard.stories.tsx"),
    "./src/features/Receive/common/SingleOrMultipleAddressesModal/SingleOrMultipleAddressesModal.stories.tsx": require("../src/features/Receive/common/SingleOrMultipleAddressesModal/SingleOrMultipleAddressesModal.stories.tsx"),
    "./src/features/Receive/common/SmallAddressCard/SmallAddressCard.stories.tsx": require("../src/features/Receive/common/SmallAddressCard/SmallAddressCard.stories.tsx"),
    "./src/features/Scan/common/CodeScannerButton.stories.tsx": require("../src/features/Scan/common/CodeScannerButton.stories.tsx"),
    "./src/features/Scan/illustrations/Ilustrations.stories.tsx": require("../src/features/Scan/illustrations/Ilustrations.stories.tsx"),
    "./src/features/Scan/useCases/ScanCodeScreen.stories.tsx": require("../src/features/Scan/useCases/ScanCodeScreen.stories.tsx"),
    "./src/features/Scan/useCases/ShowCameraPermissionDeniedScreen/OpenDeviceAppSettingsButton.stories.tsx": require("../src/features/Scan/useCases/ShowCameraPermissionDeniedScreen/OpenDeviceAppSettingsButton.stories.tsx"),
    "./src/features/Scan/useCases/ShowCameraPermissionDeniedScreen/ShowCameraPermissionDeniedScreen.stories.tsx": require("../src/features/Scan/useCases/ShowCameraPermissionDeniedScreen/ShowCameraPermissionDeniedScreen.stories.tsx"),
    "./src/features/Send/common/ButtonGroup/ButtonGroup.stories.tsx": require("../src/features/Send/common/ButtonGroup/ButtonGroup.stories.tsx"),
    "./src/features/Send/useCases/ConfirmTx/ConfirmTxScreen.stories.tsx": require("../src/features/Send/useCases/ConfirmTx/ConfirmTxScreen.stories.tsx"),
    "./src/features/Send/useCases/ConfirmTx/FailedTx/FailedTxScreen.stories.tsx": require("../src/features/Send/useCases/ConfirmTx/FailedTx/FailedTxScreen.stories.tsx"),
    "./src/features/Send/useCases/ConfirmTx/SubmittedTx/SubmittedTxScreen.stories.tsx": require("../src/features/Send/useCases/ConfirmTx/SubmittedTx/SubmittedTxScreen.stories.tsx"),
    "./src/features/Send/useCases/ListAmountsToSend/AddToken/AddToken.stories.tsx": require("../src/features/Send/useCases/ListAmountsToSend/AddToken/AddToken.stories.tsx"),
    "./src/features/Send/useCases/ListAmountsToSend/AddToken/SelectTokenFromListScreen.stories.tsx": require("../src/features/Send/useCases/ListAmountsToSend/AddToken/SelectTokenFromListScreen.stories.tsx"),
    "./src/features/Send/useCases/ListAmountsToSend/AddToken/Show/MaxAmountsPerTx.stories.tsx": require("../src/features/Send/useCases/ListAmountsToSend/AddToken/Show/MaxAmountsPerTx.stories.tsx"),
    "./src/features/Send/useCases/ListAmountsToSend/EditAmount/EditAmountScreen.stories.tsx": require("../src/features/Send/useCases/ListAmountsToSend/EditAmount/EditAmountScreen.stories.tsx"),
    "./src/features/Send/useCases/ListAmountsToSend/ListAmountsToSendScreen.stories.tsx": require("../src/features/Send/useCases/ListAmountsToSend/ListAmountsToSendScreen.stories.tsx"),
    "./src/features/Send/useCases/StartMultiTokenTx/InputReceiver/InputReceiver.stories.tsx": require("../src/features/Send/useCases/StartMultiTokenTx/InputReceiver/InputReceiver.stories.tsx"),
    "./src/features/Send/useCases/StartMultiTokenTx/InputReceiver/ShowResolvedAddressSelected.stories.tsx": require("../src/features/Send/useCases/StartMultiTokenTx/InputReceiver/ShowResolvedAddressSelected.stories.tsx"),
    "./src/features/Send/useCases/StartMultiTokenTx/NotifySupportedNameServers/NotifySupportedNameServers.stories.tsx": require("../src/features/Send/useCases/StartMultiTokenTx/NotifySupportedNameServers/NotifySupportedNameServers.stories.tsx"),
    "./src/features/Send/useCases/StartMultiTokenTx/SelectNameServer/SelectNameServer.stories.tsx": require("../src/features/Send/useCases/StartMultiTokenTx/SelectNameServer/SelectNameServer.stories.tsx"),
    "./src/features/Send/useCases/StartMultiTokenTx/StartMultiTokenTxScreen.stories.tsx": require("../src/features/Send/useCases/StartMultiTokenTx/StartMultiTokenTxScreen.stories.tsx"),
    "./src/features/Settings/About/About.stories.tsx": require("../src/features/Settings/About/About.stories.tsx"),
    "./src/features/Settings/ApplicationSettings/ApplicationSettingsScreen.stories.tsx": require("../src/features/Settings/ApplicationSettings/ApplicationSettingsScreen.stories.tsx"),
    "./src/features/Settings/ChangeLanguage/ChangeLanguageScreen.stories.tsx": require("../src/features/Settings/ChangeLanguage/ChangeLanguageScreen.stories.tsx"),
    "./src/features/Settings/ChangePassword/ChangePasswordScreen.stories.tsx": require("../src/features/Settings/ChangePassword/ChangePasswordScreen.stories.tsx"),
    "./src/features/Settings/ChangeWalletName/ChangeWalletName.stories.tsx": require("../src/features/Settings/ChangeWalletName/ChangeWalletName.stories.tsx"),
    "./src/features/Settings/Currency/ChangeCurrencyScreen.stories.tsx": require("../src/features/Settings/Currency/ChangeCurrencyScreen.stories.tsx"),
    "./src/features/Settings/EasyConfirmation/EasyConfirmationScreen.stories.tsx": require("../src/features/Settings/EasyConfirmation/EasyConfirmationScreen.stories.tsx"),
    "./src/features/Settings/EnableLoginWithOs/EnableLoginWithOsScreen.stories.tsx": require("../src/features/Settings/EnableLoginWithOs/EnableLoginWithOsScreen.stories.tsx"),
    "./src/features/Settings/ManageCollateral/ConfirmTx/ConfirmTxScreen.stories.tsx": require("../src/features/Settings/ManageCollateral/ConfirmTx/ConfirmTxScreen.stories.tsx"),
    "./src/features/Settings/ManageCollateral/ConfirmTx/FailedTx/FailedTxScreen.stories.tsx": require("../src/features/Settings/ManageCollateral/ConfirmTx/FailedTx/FailedTxScreen.stories.tsx"),
    "./src/features/Settings/ManageCollateral/ConfirmTx/SubmittedTx/SubmittedTxScreen.stories.tsx": require("../src/features/Settings/ManageCollateral/ConfirmTx/SubmittedTx/SubmittedTxScreen.stories.tsx"),
    "./src/features/Settings/ManageCollateral/ManageCollateralScreen.stories.tsx": require("../src/features/Settings/ManageCollateral/ManageCollateralScreen.stories.tsx"),
    "./src/features/Settings/PrivacyPolicy/PrivacyPolicyScreen.stories.tsx": require("../src/features/Settings/PrivacyPolicy/PrivacyPolicyScreen.stories.tsx"),
    "./src/features/Settings/RemoveWallet/RemoveWalletScreen.stories.tsx": require("../src/features/Settings/RemoveWallet/RemoveWalletScreen.stories.tsx"),
    "./src/features/Settings/TermsOfService/TermsOfServiceScreen.stories.tsx": require("../src/features/Settings/TermsOfService/TermsOfServiceScreen.stories.tsx"),
    "./src/features/Settings/WalletSettings/WalletSettingsScreen.stories.tsx": require("../src/features/Settings/WalletSettings/WalletSettingsScreen.stories.tsx"),
    "./src/features/SetupWallet/common/ButtonCard/ButtonCard.stories.tsx": require("../src/features/SetupWallet/common/ButtonCard/ButtonCard.stories.tsx"),
    "./src/features/SetupWallet/common/CardAboutPhrase/CardAboutPhrase.stories.tsx": require("../src/features/SetupWallet/common/CardAboutPhrase/CardAboutPhrase.stories.tsx"),
    "./src/features/SetupWallet/common/LearnMoreButton/LearnMoreButton.stories.tsx": require("../src/features/SetupWallet/common/LearnMoreButton/LearnMoreButton.stories.tsx"),
    "./src/features/SetupWallet/common/LogoBanner/LogoBanner.stories.tsx": require("../src/features/SetupWallet/common/LogoBanner/LogoBanner.stories.tsx"),
    "./src/features/SetupWallet/common/MnemonicInput/MnemonicInput.stories.tsx": require("../src/features/SetupWallet/common/MnemonicInput/MnemonicInput.stories.tsx"),
    "./src/features/SetupWallet/common/StepperProgress/StepperProgress.stories.tsx": require("../src/features/SetupWallet/common/StepperProgress/StepperProgress.stories.tsx"),
    "./src/features/SetupWallet/common/TextInput/TextInput.stories.tsx": require("../src/features/SetupWallet/common/TextInput/TextInput.stories.tsx"),
    "./src/features/SetupWallet/legacy/CheckNanoX/CheckNanoXScreen.stories.tsx": require("../src/features/SetupWallet/legacy/CheckNanoX/CheckNanoXScreen.stories.tsx"),
    "./src/features/SetupWallet/legacy/ConnectNanoX/ConnectNanoXScreen.stories.tsx": require("../src/features/SetupWallet/legacy/ConnectNanoX/ConnectNanoXScreen.stories.tsx"),
    "./src/features/SetupWallet/legacy/ImportReadOnlyWallet/ImportReadOnlyWalletScreen.stories.tsx": require("../src/features/SetupWallet/legacy/ImportReadOnlyWallet/ImportReadOnlyWalletScreen.stories.tsx"),
    "./src/features/SetupWallet/legacy/SaveNanoX/SaveNanoXScreen.stories.tsx": require("../src/features/SetupWallet/legacy/SaveNanoX/SaveNanoXScreen.stories.tsx"),
    "./src/features/SetupWallet/legacy/SaveReadOnlyWallet/SaveReadOnlyWalletScreen.stories.tsx": require("../src/features/SetupWallet/legacy/SaveReadOnlyWallet/SaveReadOnlyWalletScreen.stories.tsx"),
    "./src/features/SetupWallet/legacy/WalletAddress/WalletAddress.stories.tsx": require("../src/features/SetupWallet/legacy/WalletAddress/WalletAddress.stories.tsx"),
    "./src/features/SetupWallet/legacy/WalletNameForm/WalletNameForm.stories.tsx": require("../src/features/SetupWallet/legacy/WalletNameForm/WalletNameForm.stories.tsx"),
    "./src/features/SetupWallet/useCases/ChooseBiometricLogin/ChooseBiometricLoginScreen.stories.tsx": require("../src/features/SetupWallet/useCases/ChooseBiometricLogin/ChooseBiometricLoginScreen.stories.tsx"),
    "./src/features/SetupWallet/useCases/ChooseNetwork/ChooseNetworkScreen.stories.tsx": require("../src/features/SetupWallet/useCases/ChooseNetwork/ChooseNetworkScreen.stories.tsx"),
    "./src/features/SetupWallet/useCases/ChooseSetupType/ChooseSetupTypeScreen.stories.tsx": require("../src/features/SetupWallet/useCases/ChooseSetupType/ChooseSetupTypeScreen.stories.tsx"),
    "./src/features/SetupWallet/useCases/CreateWallet/AboutRecoveryPhraseScreen.stories.tsx": require("../src/features/SetupWallet/useCases/CreateWallet/AboutRecoveryPhraseScreen.stories.tsx"),
    "./src/features/SetupWallet/useCases/CreateWallet/RecoveryPhraseScreen.stories.tsx": require("../src/features/SetupWallet/useCases/CreateWallet/RecoveryPhraseScreen.stories.tsx"),
    "./src/features/SetupWallet/useCases/CreateWallet/VerifyRecoveryPhraseScreen.stories.tsx": require("../src/features/SetupWallet/useCases/CreateWallet/VerifyRecoveryPhraseScreen.stories.tsx"),
    "./src/features/SetupWallet/useCases/CreateWallet/WalletDetailsScreen.stories.tsx": require("../src/features/SetupWallet/useCases/CreateWallet/WalletDetailsScreen.stories.tsx"),
    "./src/features/SetupWallet/useCases/RestoreWallet/RestoreWalletDetailsScreen.stories.tsx": require("../src/features/SetupWallet/useCases/RestoreWallet/RestoreWalletDetailsScreen.stories.tsx"),
    "./src/features/SetupWallet/useCases/SelectWalletFromList/SelectWalletFromListScreen.stories.tsx": require("../src/features/SetupWallet/useCases/SelectWalletFromList/SelectWalletFromListScreen.stories.tsx"),
    "./src/features/Staking/Governance/common/Action/Action.stories.tsx": require("../src/features/Staking/Governance/common/Action/Action.stories.tsx"),
    "./src/features/Staking/Governance/common/LearnMoreLink/LearnMoreLink.stories.tsx": require("../src/features/Staking/Governance/common/LearnMoreLink/LearnMoreLink.stories.tsx"),
    "./src/features/Staking/Governance/useCases/ChangeVote/ChangeVoteScreen.stories.tsx": require("../src/features/Staking/Governance/useCases/ChangeVote/ChangeVoteScreen.stories.tsx"),
    "./src/features/Staking/Governance/useCases/ConfirmTx/ConfirmTxScreen.stories.tsx": require("../src/features/Staking/Governance/useCases/ConfirmTx/ConfirmTxScreen.stories.tsx"),
    "./src/features/Staking/Governance/useCases/EnterDrepIdModal/EnterDrepIdModal.stories.tsx": require("../src/features/Staking/Governance/useCases/EnterDrepIdModal/EnterDrepIdModal.stories.tsx"),
    "./src/features/Staking/Governance/useCases/FailedTx/FailedTxScreen.stories.tsx": require("../src/features/Staking/Governance/useCases/FailedTx/FailedTxScreen.stories.tsx"),
    "./src/features/Staking/Governance/useCases/Home/HomeScreen.stories.tsx": require("../src/features/Staking/Governance/useCases/Home/HomeScreen.stories.tsx"),
    "./src/features/Staking/Governance/useCases/SuccessTx/SuccessTxScreen.stories.tsx": require("../src/features/Staking/Governance/useCases/SuccessTx/SuccessTxScreen.stories.tsx"),
    "./src/features/Swap/common/AmountCard/AmountCard.stories.tsx": require("../src/features/Swap/common/AmountCard/AmountCard.stories.tsx"),
    "./src/features/Swap/common/ButtonGroup/ButtonGroup.stories.tsx": require("../src/features/Swap/common/ButtonGroup/ButtonGroup.stories.tsx"),
    "./src/features/Swap/common/ConfirmRawTx/ConfirmRawTx.stories.tsx": require("../src/features/Swap/common/ConfirmRawTx/ConfirmRawTx.stories.tsx"),
    "./src/features/Swap/common/ConfirmWithSpendingPassword/ConfirmWithSpendingPassword.stories.tsx": require("../src/features/Swap/common/ConfirmWithSpendingPassword/ConfirmWithSpendingPassword.stories.tsx"),
    "./src/features/Swap/common/LiquidityPool/LiquidityPool.stories.tsx": require("../src/features/Swap/common/LiquidityPool/LiquidityPool.stories.tsx"),
    "./src/features/Swap/common/SelectPool/SelectPoolFromList/SelectPoolFromList.stories.tsx": require("../src/features/Swap/common/SelectPool/SelectPoolFromList/SelectPoolFromList.stories.tsx"),
    "./src/features/Swap/common/ServiceUnavailable/ServiceUnavailable.stories.tsx": require("../src/features/Swap/common/ServiceUnavailable/ServiceUnavailable.stories.tsx"),
    "./src/features/Swap/useCases/ConfirmTxScreen/ConfirmTxScreen.stories.tsx": require("../src/features/Swap/useCases/ConfirmTxScreen/ConfirmTxScreen.stories.tsx"),
    "./src/features/Swap/useCases/ConfirmTxScreen/ShowFailedTxScreen/ShowFailedTxScreen.stories.tsx": require("../src/features/Swap/useCases/ConfirmTxScreen/ShowFailedTxScreen/ShowFailedTxScreen.stories.tsx"),
    "./src/features/Swap/useCases/ConfirmTxScreen/ShowSubmittedTxScreen/ShowSubmittedTxScreen.stories.tsx": require("../src/features/Swap/useCases/ConfirmTxScreen/ShowSubmittedTxScreen/ShowSubmittedTxScreen.stories.tsx"),
    "./src/features/Swap/useCases/ConfirmTxScreen/TransactionSummary.stories.tsx": require("../src/features/Swap/useCases/ConfirmTxScreen/TransactionSummary.stories.tsx"),
    "./src/features/Swap/useCases/StartSwapScreen/CreateOrder/Actions/AmountActions/AmountActions.stories.tsx": require("../src/features/Swap/useCases/StartSwapScreen/CreateOrder/Actions/AmountActions/AmountActions.stories.tsx"),
    "./src/features/Swap/useCases/StartSwapScreen/CreateOrder/Actions/AmountActions/ClearQuantities.stories.tsx": require("../src/features/Swap/useCases/StartSwapScreen/CreateOrder/Actions/AmountActions/ClearQuantities.stories.tsx"),
    "./src/features/Swap/useCases/StartSwapScreen/CreateOrder/Actions/AmountActions/SwitchTokens.stories.tsx": require("../src/features/Swap/useCases/StartSwapScreen/CreateOrder/Actions/AmountActions/SwitchTokens.stories.tsx"),
    "./src/features/Swap/useCases/StartSwapScreen/CreateOrder/Actions/OrderActions/OrderActions.stories.tsx": require("../src/features/Swap/useCases/StartSwapScreen/CreateOrder/Actions/OrderActions/OrderActions.stories.tsx"),
    "./src/features/Swap/useCases/StartSwapScreen/CreateOrder/CreateOrder.stories.tsx": require("../src/features/Swap/useCases/StartSwapScreen/CreateOrder/CreateOrder.stories.tsx"),
    "./src/features/Swap/useCases/StartSwapScreen/CreateOrder/EditBuyAmount/EditBuyAmount.stories.tsx": require("../src/features/Swap/useCases/StartSwapScreen/CreateOrder/EditBuyAmount/EditBuyAmount.stories.tsx"),
    "./src/features/Swap/useCases/StartSwapScreen/CreateOrder/EditBuyAmount/SelectBuyTokenFromListScreen/SelectBuyTokenFromListScreen.stories.tsx": require("../src/features/Swap/useCases/StartSwapScreen/CreateOrder/EditBuyAmount/SelectBuyTokenFromListScreen/SelectBuyTokenFromListScreen.stories.tsx"),
    "./src/features/Swap/useCases/StartSwapScreen/CreateOrder/EditPool/SelectPoolFromListScreen/SelectPoolFromListScreen.stories.tsx": require("../src/features/Swap/useCases/StartSwapScreen/CreateOrder/EditPool/SelectPoolFromListScreen/SelectPoolFromListScreen.stories.tsx"),
    "./src/features/Swap/useCases/StartSwapScreen/CreateOrder/EditPool/ShowPoolActions.stories.tsx": require("../src/features/Swap/useCases/StartSwapScreen/CreateOrder/EditPool/ShowPoolActions.stories.tsx"),
    "./src/features/Swap/useCases/StartSwapScreen/CreateOrder/EditPrice/EditPrice.stories.tsx": require("../src/features/Swap/useCases/StartSwapScreen/CreateOrder/EditPrice/EditPrice.stories.tsx"),
    "./src/features/Swap/useCases/StartSwapScreen/CreateOrder/EditSellAmount/EditSellAmount.stories.tsx": require("../src/features/Swap/useCases/StartSwapScreen/CreateOrder/EditSellAmount/EditSellAmount.stories.tsx"),
    "./src/features/Swap/useCases/StartSwapScreen/CreateOrder/EditSellAmount/SelectSellTokenFromListScreen/SelectSellTokenFromListScreen.stories.tsx": require("../src/features/Swap/useCases/StartSwapScreen/CreateOrder/EditSellAmount/SelectSellTokenFromListScreen/SelectSellTokenFromListScreen.stories.tsx"),
    "./src/features/Swap/useCases/StartSwapScreen/CreateOrder/EditSlippage/EditSlippage.stories.tsx": require("../src/features/Swap/useCases/StartSwapScreen/CreateOrder/EditSlippage/EditSlippage.stories.tsx"),
    "./src/features/Swap/useCases/StartSwapScreen/CreateOrder/EditSlippage/EditSlippageScreen/EditSlippageScreen.stories.tsx": require("../src/features/Swap/useCases/StartSwapScreen/CreateOrder/EditSlippage/EditSlippageScreen/EditSlippageScreen.stories.tsx"),
    "./src/features/Swap/useCases/StartSwapScreen/CreateOrder/EditSlippage/ShowSlippageActions.stories.tsx": require("../src/features/Swap/useCases/StartSwapScreen/CreateOrder/EditSlippage/ShowSlippageActions.stories.tsx"),
    "./src/features/Swap/useCases/StartSwapScreen/CreateOrder/EditSlippage/ShowSlippageInfo.stories.tsx": require("../src/features/Swap/useCases/StartSwapScreen/CreateOrder/EditSlippage/ShowSlippageInfo.stories.tsx"),
    "./src/features/Swap/useCases/StartSwapScreen/CreateOrder/WarnLimitPrice/WarnLimitPrice.stories.tsx": require("../src/features/Swap/useCases/StartSwapScreen/CreateOrder/WarnLimitPrice/WarnLimitPrice.stories.tsx"),
    "./src/features/Swap/useCases/StartSwapScreen/CreateOrder/WarnPriceImpact/WarnPriceImpact.stories.tsx": require("../src/features/Swap/useCases/StartSwapScreen/CreateOrder/WarnPriceImpact/WarnPriceImpact.stories.tsx"),
    "./src/features/Swap/useCases/StartSwapScreen/CreateOrder/WarnSlippage/WarnSlippage.stories.tsx": require("../src/features/Swap/useCases/StartSwapScreen/CreateOrder/WarnSlippage/WarnSlippage.stories.tsx"),
    "./src/features/Swap/useCases/StartSwapScreen/ListOrders/CompletedOrders.stories.tsx": require("../src/features/Swap/useCases/StartSwapScreen/ListOrders/CompletedOrders.stories.tsx"),
    "./src/features/Swap/useCases/StartSwapScreen/ListOrders/ListOrders.stories.tsx": require("../src/features/Swap/useCases/StartSwapScreen/ListOrders/ListOrders.stories.tsx"),
    "./src/features/Swap/useCases/StartSwapScreen/ListOrders/OpenOrders.stories.tsx": require("../src/features/Swap/useCases/StartSwapScreen/ListOrders/OpenOrders.stories.tsx"),
    "./src/features/ToggleAnalyticsSettings/ToggleAnalyticsSettings.stories.tsx": require("../src/features/ToggleAnalyticsSettings/ToggleAnalyticsSettings.stories.tsx"),
    "./src/HW/Instructions/Instructions.stories.tsx": require("../src/HW/Instructions/Instructions.stories.tsx"),
    "./src/HW/LedgerConnect/DeviceItem/DeviceItem.stories.tsx": require("../src/HW/LedgerConnect/DeviceItem/DeviceItem.stories.tsx"),
    "./src/HW/LedgerConnect/LedgerConnect.stories.tsx": require("../src/HW/LedgerConnect/LedgerConnect.stories.tsx"),
    "./src/HW/LedgerTransportSwitchModal/LedgerTransportSwitchModal.stories.tsx": require("../src/HW/LedgerTransportSwitchModal/LedgerTransportSwitchModal.stories.tsx"),
    "./src/legacy/Modal/Modal.stories.tsx": require("../src/legacy/Modal/Modal.stories.tsx"),
    "./src/Legal/PrivacyPolicy/PrivacyPolicy.stories.tsx": require("../src/Legal/PrivacyPolicy/PrivacyPolicy.stories.tsx"),
    "./src/metrics/metrics.stories.tsx": require("../src/metrics/metrics.stories.tsx"),
    "./src/NftDetails/NftDetails.stories.tsx": require("../src/NftDetails/NftDetails.stories.tsx"),
    "./src/NftDetails/NftDetailsImage.stories.tsx": require("../src/NftDetails/NftDetailsImage.stories.tsx"),
    "./src/Nfts/Nfts.stories.tsx": require("../src/Nfts/Nfts.stories.tsx"),
    "./src/Nfts/NoNftsScreen.stories.tsx": require("../src/Nfts/NoNftsScreen.stories.tsx"),
    "./src/Staking/DelegationConfirmation/DelegationConfirmation.stories.tsx": require("../src/Staking/DelegationConfirmation/DelegationConfirmation.stories.tsx"),
    "./src/Staking/FailedTx/FailedTxScreen.stories.tsx": require("../src/Staking/FailedTx/FailedTxScreen.stories.tsx"),
    "./src/Staking/PoolDetails/PoolDetailScreen.stories.tsx": require("../src/Staking/PoolDetails/PoolDetailScreen.stories.tsx"),
    "./src/Staking/PoolTransition/PoolTransitionModal.stories.tsx": require("../src/Staking/PoolTransition/PoolTransitionModal.stories.tsx"),
    "./src/Staking/PoolWarningModal/PoolWarningModal.stories.tsx": require("../src/Staking/PoolWarningModal/PoolWarningModal.stories.tsx"),
    "./src/Staking/StakingCenter/StakingCenter.stories.tsx": require("../src/Staking/StakingCenter/StakingCenter.stories.tsx"),
    "./src/TxHistory/AssetList/ChipButton/ChipButton.stories.tsx": require("../src/TxHistory/AssetList/ChipButton/ChipButton.stories.tsx"),
    "./src/TxHistory/AssetList/FilterBalancesByType.stories.tsx": require("../src/TxHistory/AssetList/FilterBalancesByType.stories.tsx"),
    "./src/TxHistory/BalanceBanner.stories.tsx": require("../src/TxHistory/BalanceBanner.stories.tsx"),
    "./src/TxHistory/ModalInfo/ModalInfo.stories.tsx": require("../src/TxHistory/ModalInfo/ModalInfo.stories.tsx"),
    "./src/TxHistory/TxDetails/AssetList.stories.tsx": require("../src/TxHistory/TxDetails/AssetList.stories.tsx"),
    "./src/TxHistory/TxDetails/TxDetails.stories.tsx": require("../src/TxHistory/TxDetails/TxDetails.stories.tsx"),
    "./src/TxHistory/TxHistory.stories.tsx": require("../src/TxHistory/TxHistory.stories.tsx"),
    "./src/TxHistory/TxHistoryList/ActionsBanner/ActionsBanner.stories.tsx": require("../src/TxHistory/TxHistoryList/ActionsBanner/ActionsBanner.stories.tsx"),
  };
};

configure(getStories, module, false);
