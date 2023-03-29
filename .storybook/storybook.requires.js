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
    "./src/components/AssetItem/AssetItem.stories.tsx": require("../src/components/AssetItem/AssetItem.stories.tsx"),
    "./src/components/Boundary/Boundary.stories.tsx": require("../src/components/Boundary/Boundary.stories.tsx"),
    "./src/components/Button/Button.stories.tsx": require("../src/components/Button/Button.stories.tsx"),
    "./src/components/Checkbox/Checkbox.stories.tsx": require("../src/components/Checkbox/Checkbox.stories.tsx"),
    "./src/components/ConfirmTx/ConfirmTx.stories.tsx": require("../src/components/ConfirmTx/ConfirmTx.stories.tsx"),
    "./src/components/ConfirmTx/Dialog.stories.tsx": require("../src/components/ConfirmTx/Dialog.stories.tsx"),
    "./src/components/DangerousActionModal/DangerousActionModal.stories.tsx": require("../src/components/DangerousActionModal/DangerousActionModal.stories.tsx"),
    "./src/components/ErrorBoundary/ErrorBoundary.stories.tsx": require("../src/components/ErrorBoundary/ErrorBoundary.stories.tsx"),
    "./src/components/ErrorModal/ErrorModal.stories.tsx": require("../src/components/ErrorModal/ErrorModal.stories.tsx"),
    "./src/components/ErrorPanel/ErrorPanel.stories.tsx": require("../src/components/ErrorPanel/ErrorPanel.stories.tsx"),
    "./src/components/HideableText/HideableText.stories.tsx": require("../src/components/HideableText/HideableText.stories.tsx"),
    "./src/components/Icon/Icon.stories.tsx": require("../src/components/Icon/Icon.stories.tsx"),
    "./src/components/LanguagePicker/LanguagePicker.stories.tsx": require("../src/components/LanguagePicker/LanguagePicker.stories.tsx"),
    "./src/components/LanguagePicker/LanguagePickerWarning.stories.tsx": require("../src/components/LanguagePicker/LanguagePickerWarning.stories.tsx"),
    "./src/components/Link/Link.stories.tsx": require("../src/components/Link/Link.stories.tsx"),
    "./src/components/LoadingOverlay/LoadingOverlay.stories.tsx": require("../src/components/LoadingOverlay/LoadingOverlay.stories.tsx"),
    "./src/components/Modal/Modal.stories.tsx": require("../src/components/Modal/Modal.stories.tsx"),
    "./src/components/NftPreview/NftPreview.stories.tsx": require("../src/components/NftPreview/NftPreview.stories.tsx"),
    "./src/components/StandardModal/StandardModal.stories.tsx": require("../src/components/StandardModal/StandardModal.stories.tsx"),
    "./src/components/TextInput/TextInput.stories.tsx": require("../src/components/TextInput/TextInput.stories.tsx"),
    "./src/components/TokenIcon/ModeratedNftIcon.stories.tsx": require("../src/components/TokenIcon/ModeratedNftIcon.stories.tsx"),
    "./src/components/TokenIcon/TokenIcon.stories.tsx": require("../src/components/TokenIcon/TokenIcon.stories.tsx"),
    "./src/Dashboard/Dashboard.stories.tsx": require("../src/Dashboard/Dashboard.stories.tsx"),
    "./src/Dashboard/StakePoolInfos.stories.tsx": require("../src/Dashboard/StakePoolInfos.stories.tsx"),
    "./src/Dashboard/WithdrawStakingRewards/ConfirmTx/ConfirmTxWithHW.stories.tsx": require("../src/Dashboard/WithdrawStakingRewards/ConfirmTx/ConfirmTxWithHW.stories.tsx"),
    "./src/Dashboard/WithdrawStakingRewards/ConfirmTx/ConfirmTxWithOS.stories.tsx": require("../src/Dashboard/WithdrawStakingRewards/ConfirmTx/ConfirmTxWithOS.stories.tsx"),
    "./src/Dashboard/WithdrawStakingRewards/ConfirmTx/ConfirmTxWithPassword.stories.tsx": require("../src/Dashboard/WithdrawStakingRewards/ConfirmTx/ConfirmTxWithPassword.stories.tsx"),
    "./src/Dashboard/WithdrawStakingRewards/TransferSummary/TransferSummary.stories.tsx": require("../src/Dashboard/WithdrawStakingRewards/TransferSummary/TransferSummary.stories.tsx"),
    "./src/Dashboard/WithdrawStakingRewards/WithdrawStakingRewards.stories.tsx": require("../src/Dashboard/WithdrawStakingRewards/WithdrawStakingRewards.stories.tsx"),
    "./src/features/Send/useCases/ConfirmTx/ConfirmTxScreen.stories.tsx": require("../src/features/Send/useCases/ConfirmTx/ConfirmTxScreen.stories.tsx"),
    "./src/features/Send/useCases/ListSelectedTokens/AddToken/AddToken.stories.tsx": require("../src/features/Send/useCases/ListSelectedTokens/AddToken/AddToken.stories.tsx"),
    "./src/features/Send/useCases/ListSelectedTokens/AddToken/SelectTokenFromListScreen.stories.tsx": require("../src/features/Send/useCases/ListSelectedTokens/AddToken/SelectTokenFromListScreen.stories.tsx"),
    "./src/features/Send/useCases/ListSelectedTokens/AddToken/ShowError/MaxTokensPerTx.stories.tsx": require("../src/features/Send/useCases/ListSelectedTokens/AddToken/ShowError/MaxTokensPerTx.stories.tsx"),
    "./src/features/Send/useCases/ListSelectedTokens/EditAmount/EditAmountScreen.stories.tsx": require("../src/features/Send/useCases/ListSelectedTokens/EditAmount/EditAmountScreen.stories.tsx"),
    "./src/features/Send/useCases/ListSelectedTokens/ListSelectedTokensScreen.stories.tsx": require("../src/features/Send/useCases/ListSelectedTokens/ListSelectedTokensScreen.stories.tsx"),
    "./src/features/Send/useCases/ListSelectedTokens/RemoveToken.stories.tsx": require("../src/features/Send/useCases/ListSelectedTokens/RemoveToken.stories.tsx"),
    "./src/features/Send/useCases/StartMultiTokenTx/InputReceiver/ReadQRCodeScreen.stories.tsx": require("../src/features/Send/useCases/StartMultiTokenTx/InputReceiver/ReadQRCodeScreen.stories.tsx"),
    "./src/features/Send/useCases/StartMultiTokenTx/StartMultiTokenTxScreen.stories.tsx": require("../src/features/Send/useCases/StartMultiTokenTx/StartMultiTokenTxScreen.stories.tsx"),
    "./src/FirstRun/LanguagePickerScreen/LanguagePickerScreen.stories.tsx": require("../src/FirstRun/LanguagePickerScreen/LanguagePickerScreen.stories.tsx"),
    "./src/FirstRun/TermsOfServiceScreen/TermsOfServiceScreen.stories.tsx": require("../src/FirstRun/TermsOfServiceScreen/TermsOfServiceScreen.stories.tsx"),
    "./src/HW/Instructions/Instructions.stories.tsx": require("../src/HW/Instructions/Instructions.stories.tsx"),
    "./src/HW/LedgerConnect/DeviceItem/DeviceItem.stories.tsx": require("../src/HW/LedgerConnect/DeviceItem/DeviceItem.stories.tsx"),
    "./src/HW/LedgerConnect/LedgerConnect.stories.tsx": require("../src/HW/LedgerConnect/LedgerConnect.stories.tsx"),
    "./src/HW/LedgerTransportSwitchModal/LedgerTransportSwitchModal.stories.tsx": require("../src/HW/LedgerTransportSwitchModal/LedgerTransportSwitchModal.stories.tsx"),
    "./src/Menu/Menu.stories.tsx": require("../src/Menu/Menu.stories.tsx"),
    "./src/NftDetails/NftDetails.stories.tsx": require("../src/NftDetails/NftDetails.stories.tsx"),
    "./src/NftDetails/NftDetailsImage.stories.tsx": require("../src/NftDetails/NftDetailsImage.stories.tsx"),
    "./src/Nfts/ImageGallery/ImageGallery.stories.tsx": require("../src/Nfts/ImageGallery/ImageGallery.stories.tsx"),
    "./src/Nfts/Nfts.stories.tsx": require("../src/Nfts/Nfts.stories.tsx"),
    "./src/Nfts/NoNftsScreen.stories.tsx": require("../src/Nfts/NoNftsScreen.stories.tsx"),
    "./src/Receive/Addresses.stories.tsx": require("../src/Receive/Addresses.stories.tsx"),
    "./src/Receive/AddressModal.stories.tsx": require("../src/Receive/AddressModal.stories.tsx"),
    "./src/Receive/ReceiveScreen.stories.tsx": require("../src/Receive/ReceiveScreen.stories.tsx"),
    "./src/Search/SearchBar.stories.tsx": require("../src/Search/SearchBar.stories.tsx"),
    "./src/SelectedWallet/WalletSelection/WalletSelectionScreen.stories.tsx": require("../src/SelectedWallet/WalletSelection/WalletSelectionScreen.stories.tsx"),
    "./src/Settings/ApplicationSettings/ApplicationSettingsScreen.stories.tsx": require("../src/Settings/ApplicationSettings/ApplicationSettingsScreen.stories.tsx"),
    "./src/Settings/ChangeLanguage/ChangeLanguageScreen.stories.tsx": require("../src/Settings/ChangeLanguage/ChangeLanguageScreen.stories.tsx"),
    "./src/Settings/ChangePassword/ChangePasswordScreen.stories.tsx": require("../src/Settings/ChangePassword/ChangePasswordScreen.stories.tsx"),
    "./src/Settings/ChangeWalletName/ChangeWalletName.stories.tsx": require("../src/Settings/ChangeWalletName/ChangeWalletName.stories.tsx"),
    "./src/Settings/Currency/ChangeCurrencyScreen.stories.tsx": require("../src/Settings/Currency/ChangeCurrencyScreen.stories.tsx"),
    "./src/Settings/EasyConfirmation/EasyConfirmationScreen.stories.tsx": require("../src/Settings/EasyConfirmation/EasyConfirmationScreen.stories.tsx"),
    "./src/Settings/EnableLoginWithOs/EnableLoginWithOsScreen.stories.tsx": require("../src/Settings/EnableLoginWithOs/EnableLoginWithOsScreen.stories.tsx"),
    "./src/Settings/RemoveWallet/RemoveWalletScreen.stories.tsx": require("../src/Settings/RemoveWallet/RemoveWalletScreen.stories.tsx"),
    "./src/Settings/Support/SupportScreen.stories.tsx": require("../src/Settings/Support/SupportScreen.stories.tsx"),
    "./src/Settings/TermsOfService/TermsOfServiceScreen.stories.tsx": require("../src/Settings/TermsOfService/TermsOfServiceScreen.stories.tsx"),
    "./src/Settings/WalletSettings/WalletSettingsScreen.stories.tsx": require("../src/Settings/WalletSettings/WalletSettingsScreen.stories.tsx"),
    "./src/Staking/DelegationConfirmation/DelegationConfirmation.stories.tsx": require("../src/Staking/DelegationConfirmation/DelegationConfirmation.stories.tsx"),
    "./src/Staking/PoolDetails/PoolDetailScreen.stories.tsx": require("../src/Staking/PoolDetails/PoolDetailScreen.stories.tsx"),
    "./src/Staking/PoolWarningModal/PoolWarningModal.stories.tsx": require("../src/Staking/PoolWarningModal/PoolWarningModal.stories.tsx"),
    "./src/Staking/StakingCenter/StakingCenter.stories.tsx": require("../src/Staking/StakingCenter/StakingCenter.stories.tsx"),
    "./src/theme/Palette.stories.tsx": require("../src/theme/Palette.stories.tsx"),
    "./src/theme/Theme.stories.tsx": require("../src/theme/Theme.stories.tsx"),
    "./src/theme/Typography.stories.tsx": require("../src/theme/Typography.stories.tsx"),
    "./src/TxHistory/AssetList/ActionsBanner.stories.tsx": require("../src/TxHistory/AssetList/ActionsBanner.stories.tsx"),
    "./src/TxHistory/AssetList/ChipButton/ChipButton.stories.tsx": require("../src/TxHistory/AssetList/ChipButton/ChipButton.stories.tsx"),
    "./src/TxHistory/BalanceBanner.stories.tsx": require("../src/TxHistory/BalanceBanner.stories.tsx"),
    "./src/TxHistory/ModalInfo/ModalInfo.stories.tsx": require("../src/TxHistory/ModalInfo/ModalInfo.stories.tsx"),
    "./src/TxHistory/PairedBalance.stories.tsx": require("../src/TxHistory/PairedBalance.stories.tsx"),
    "./src/TxHistory/TxDetails/AssetList.stories.tsx": require("../src/TxHistory/TxDetails/AssetList.stories.tsx"),
    "./src/TxHistory/TxDetails/TxDetails.stories.tsx": require("../src/TxHistory/TxDetails/TxDetails.stories.tsx"),
    "./src/TxHistory/TxHistory.stories.tsx": require("../src/TxHistory/TxHistory.stories.tsx"),
    "./src/TxHistory/TxHistoryList/ActionsBanner/ActionsBanner.stories.tsx": require("../src/TxHistory/TxHistoryList/ActionsBanner/ActionsBanner.stories.tsx"),
    "./src/WalletInit/CheckNanoX/CheckNanoXScreen.stories.tsx": require("../src/WalletInit/CheckNanoX/CheckNanoXScreen.stories.tsx"),
    "./src/WalletInit/ConnectNanoX/ConnectNanoXScreen.stories.tsx": require("../src/WalletInit/ConnectNanoX/ConnectNanoXScreen.stories.tsx"),
    "./src/WalletInit/CreateWallet/CreateWalletScreen.stories.tsx": require("../src/WalletInit/CreateWallet/CreateWalletScreen.stories.tsx"),
    "./src/WalletInit/ImportReadOnlyWallet/ImportReadOnlyWalletScreen.stories.tsx": require("../src/WalletInit/ImportReadOnlyWallet/ImportReadOnlyWalletScreen.stories.tsx"),
    "./src/WalletInit/MnemonicBackupModal/MnemonicBackupImportanceModal.stories.tsx": require("../src/WalletInit/MnemonicBackupModal/MnemonicBackupImportanceModal.stories.tsx"),
    "./src/WalletInit/MnemonicCheck/MnemonicCheckScreen.stories.tsx": require("../src/WalletInit/MnemonicCheck/MnemonicCheckScreen.stories.tsx"),
    "./src/WalletInit/MnemonicExplanationModal/MnemonicExplanationModal.stories.tsx": require("../src/WalletInit/MnemonicExplanationModal/MnemonicExplanationModal.stories.tsx"),
    "./src/WalletInit/MnemonicInput/MnemonicInput.stories.tsx": require("../src/WalletInit/MnemonicInput/MnemonicInput.stories.tsx"),
    "./src/WalletInit/MnemonicShow/MnemonicShowScreen.stories.tsx": require("../src/WalletInit/MnemonicShow/MnemonicShowScreen.stories.tsx"),
    "./src/WalletInit/RestoreWallet/RestoreWalletScreen.stories.tsx": require("../src/WalletInit/RestoreWallet/RestoreWalletScreen.stories.tsx"),
    "./src/WalletInit/SaveNanoX/SaveNanoXScreen.stories.tsx": require("../src/WalletInit/SaveNanoX/SaveNanoXScreen.stories.tsx"),
    "./src/WalletInit/SaveReadOnlyWallet/SaveReadOnlyWalletScreen.stories.tsx": require("../src/WalletInit/SaveReadOnlyWallet/SaveReadOnlyWalletScreen.stories.tsx"),
    "./src/WalletInit/VerifyRestoredWallet/VerifyRestoredWalletScreen.stories.tsx": require("../src/WalletInit/VerifyRestoredWallet/VerifyRestoredWalletScreen.stories.tsx"),
    "./src/WalletInit/WalletAddress/WalletAddress.stories.tsx": require("../src/WalletInit/WalletAddress/WalletAddress.stories.tsx"),
    "./src/WalletInit/WalletCredentials/WalletCredentialsScreen.stories.tsx": require("../src/WalletInit/WalletCredentials/WalletCredentialsScreen.stories.tsx"),
    "./src/WalletInit/WalletFreshInit/WalletFreshInitScreen.stories.tsx": require("../src/WalletInit/WalletFreshInit/WalletFreshInitScreen.stories.tsx"),
    "./src/WalletInit/WalletInit/ExpandableItem/ExpandableItem.stories.tsx": require("../src/WalletInit/WalletInit/ExpandableItem/ExpandableItem.stories.tsx"),
    "./src/WalletInit/WalletInit/WalletInitScreen.stories.tsx": require("../src/WalletInit/WalletInit/WalletInitScreen.stories.tsx"),
    "./src/WalletInit/WalletNameForm/WalletNameForm.stories.tsx": require("../src/WalletInit/WalletNameForm/WalletNameForm.stories.tsx"),
  };
};

configure(getStories, module, false);
