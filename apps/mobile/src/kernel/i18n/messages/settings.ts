import {defineMessages} from 'react-intl'

export const settingsMessages = defineMessages({
  // Main settings
  appSettingsTitle: {
    id: 'components.settings.appSettingsTitle',
    defaultMessage: '!!!App Settings',
  },
  aboutTitle: {
    id: 'components.settings.aboutTitle',
    defaultMessage: '!!!About',
  },
  systemLogTitle: {
    id: 'components.settings.systemLogTitle',
    defaultMessage: '!!!System Log',
  },
  settingsTitle: {
    id: 'components.settings.settingsTitle',
    defaultMessage: '!!!Settings',
  },
  changeWalletNameTitle: {
    id: 'components.settings.changeWalletNameTitle',
    defaultMessage: '!!!Change Wallet Name',
  },
  termsOfServiceTitle: {
    id: 'components.settings.termsOfServiceTitle',
    defaultMessage: '!!!Terms of Service',
  },
  privacyPolicyTitle: {
    id: 'components.settings.privacyPolicyTitle',
    defaultMessage: '!!!Privacy Policy',
  },
  removeWalletTitle: {
    id: 'components.settings.removeWalletTitle',
    defaultMessage: '!!!Remove Wallet',
  },
  languageTitle: {
    id: 'components.settings.languageTitle',
    defaultMessage: '!!!Language',
  },
  themeTitle: {
    id: 'components.settings.themeTitle',
    defaultMessage: '!!!Theme',
  },
  networkTitle: {
    id: 'components.settings.networkTitle',
    defaultMessage: '!!!Network',
  },
  enableEasyConfirmationTitle: {
    id: 'components.settings.enableEasyConfirmationTitle',
    defaultMessage: '!!!Enable Easy Confirmation',
  },
  disableEasyConfirmationTitle: {
    id: 'components.settings.disableEasyConfirmationTitle',
    defaultMessage: '!!!Disable Easy Confirmation',
  },
  changePasswordTitle: {
    id: 'components.settings.changePasswordTitle',
    defaultMessage: '!!!Change Password',
  },
  changeCustomPinTitle: {
    id: 'components.settings.changeCustomPinTitle',
    defaultMessage: '!!!Change Custom PIN',
  },
  collateral: {
    id: 'components.settings.collateral',
    defaultMessage: '!!!Collateral',
  },
  customPinTitle: {
    id: 'components.settings.customPinTitle',
    defaultMessage: '!!!Custom PIN',
  },
  walletTabTitle: {
    id: 'components.settings.walletTabTitle',
    defaultMessage: '!!!Wallet',
  },
  appTabTitle: {
    id: 'components.settings.appTabTitle',
    defaultMessage: '!!!App',
  },
  notifications: {
    id: 'components.settings.notifications',
    defaultMessage: '!!!Notifications',
  },
  toggleAnalyticsSettingsTitle: {
    id: 'components.settings.toggleAnalyticsSettingsTitle',
    defaultMessage: '!!!Toggle Analytics Settings',
  },

  // About section
  aboutWalletType: {
    id: 'components.settings.about.walletType',
    defaultMessage: '!!!Wallet Type',
  },
  aboutByronWallet: {
    id: 'components.settings.about.byronWallet',
    defaultMessage: '!!!Byron Wallet',
  },
  aboutShelleyWallet: {
    id: 'components.settings.about.shelleyWallet',
    defaultMessage: '!!!Shelley Wallet',
  },
  aboutUnknownWalletType: {
    id: 'components.settings.about.unknownWalletType',
    defaultMessage: '!!!Unknown Wallet Type',
  },
  aboutFcmToken: {
    id: 'components.settings.about.fcmToken',
    defaultMessage: '!!!FCM Token',
  },

  // Enable Login with OS
  enableLoginWithOsHeading: {
    id: 'components.settings.enableLoginWithOs.heading',
    defaultMessage: '!!!Enable Login with OS',
  },
  enableLoginWithOsSubHeading1: {
    id: 'components.settings.enableLoginWithOs.subHeading1',
    defaultMessage: '!!!Sub Heading 1',
  },
  enableLoginWithOsSubHeading2: {
    id: 'components.settings.enableLoginWithOs.subHeading2',
    defaultMessage: '!!!Sub Heading 2',
  },
  enableLoginWithOsNotNowButton: {
    id: 'components.settings.enableLoginWithOs.notNowButton',
    defaultMessage: '!!!Not Now',
  },
  enableLoginWithOsLinkButton: {
    id: 'components.settings.enableLoginWithOs.linkButton',
    defaultMessage: '!!!Link',
  },

  // Easy Confirmation
  easyConfirmationDisableHeading: {
    id: 'components.settings.easyConfirmation.disableHeading',
    defaultMessage: '!!!Disable Easy Confirmation',
  },
  easyConfirmationDisableButton: {
    id: 'components.settings.easyConfirmation.disableButton',
    defaultMessage: '!!!Disable',
  },
  easyConfirmationEnableHeading: {
    id: 'components.settings.easyConfirmation.enableHeading',
    defaultMessage: '!!!Enable Easy Confirmation',
  },
  easyConfirmationEnableWarning: {
    id: 'components.settings.easyConfirmation.enableWarning',
    defaultMessage: '!!!Enable Warning',
  },
  easyConfirmationEnableRootPassword: {
    id: 'components.settings.easyConfirmation.enableRootPassword',
    defaultMessage: '!!!Enable Root Password',
  },
  easyConfirmationEnableButton: {
    id: 'components.settings.easyConfirmation.enableButton',
    defaultMessage: '!!!Enable',
  },

  // Remove Wallet
  removeWalletDescriptionParagraph1: {
    id: 'components.settings.removeWallet.descriptionParagraph1',
    defaultMessage: '!!!Remove Wallet Description Paragraph 1',
  },
  removeWalletDescriptionParagraph2: {
    id: 'components.settings.removeWallet.descriptionParagraph2',
    defaultMessage: '!!!Remove Wallet Description Paragraph 2',
  },
  removeWalletWalletName: {
    id: 'components.settings.removeWallet.walletName',
    defaultMessage: '!!!Wallet Name',
  },
  removeWalletWalletNameInput: {
    id: 'components.settings.removeWallet.walletNameInput',
    defaultMessage: '!!!Wallet Name Input',
  },
  removeWalletWalletNameMismatchError: {
    id: 'components.settings.removeWallet.walletNameMismatchError',
    defaultMessage: '!!!Wallet Name Mismatch Error',
  },
  removeWalletRemove: {
    id: 'components.settings.removeWallet.remove',
    defaultMessage: '!!!Remove',
  },
  removeWalletHasWrittenDownMnemonic: {
    id: 'components.settings.removeWallet.hasWrittenDownMnemonic',
    defaultMessage: '!!!Has Written Down Mnemonic',
  },

  // Rename Wallet
  renameWalletChangeButton: {
    id: 'components.settings.renameWallet.changeButton',
    defaultMessage: '!!!Change',
  },
  renameWalletWalletNameInputLabel: {
    id: 'components.settings.renameWallet.walletNameInputLabel',
    defaultMessage: '!!!Wallet Name Input Label',
  },

  // Change Password
  changePasswordOldPasswordInputLabel: {
    id: 'components.settings.changePassword.oldPasswordInputLabel',
    defaultMessage: '!!!Old Password Input Label',
  },
  changePasswordNewPasswordInputLabel: {
    id: 'components.settings.changePassword.newPasswordInputLabel',
    defaultMessage: '!!!New Password Input Label',
  },
  changePasswordPasswordStrengthRequirement: {
    id: 'components.settings.changePassword.passwordStrengthRequirement',
    defaultMessage: '!!!Password Strength Requirement',
  },
  changePasswordRepeatPasswordInputLabel: {
    id: 'components.settings.changePassword.repeatPasswordInputLabel',
    defaultMessage: '!!!Repeat Password Input Label',
  },
  changePasswordRepeatPasswordInputNotMatchError: {
    id: 'components.settings.changePassword.repeatPasswordInputNotMatchError',
    defaultMessage: '!!!Repeat Password Input Not Match Error',
  },
  changePasswordContinueButton: {
    id: 'components.settings.changePassword.continueButton',
    defaultMessage: '!!!Continue',
  },

  // Wallet Settings
  walletSettingsGeneral: {
    id: 'components.settings.walletSettings.general',
    defaultMessage: '!!!General',
  },
  walletSettingsActions: {
    id: 'components.settings.walletSettings.actions',
    defaultMessage: '!!!Actions',
  },
  walletSettingsSwitchWallet: {
    id: 'components.settings.walletSettings.switchWallet',
    defaultMessage: '!!!Switch Wallet',
  },
  walletSettingsLogout: {
    id: 'components.settings.walletSettings.logout',
    defaultMessage: '!!!Logout',
  },
  walletSettingsWalletName: {
    id: 'components.settings.walletSettings.walletName',
    defaultMessage: '!!!Wallet Name',
  },
  walletSettingsSecurity: {
    id: 'components.settings.walletSettings.security',
    defaultMessage: '!!!Security',
  },
  walletSettingsChangePassword: {
    id: 'components.settings.walletSettings.changePassword',
    defaultMessage: '!!!Change Password',
  },
  walletSettingsEasyConfirmation: {
    id: 'components.settings.walletSettings.easyConfirmation',
    defaultMessage: '!!!Easy Confirmation',
  },
  walletSettingsEasyConfirmationInfo: {
    id: 'components.settings.walletSettings.easyConfirmationInfo',
    defaultMessage: '!!!Easy Confirmation Info',
  },
  walletSettingsRemoveWallet: {
    id: 'components.settings.walletSettings.removeWallet',
    defaultMessage: '!!!Remove Wallet',
  },
  walletSettingsNetwork: {
    id: 'components.settings.walletSettings.network',
    defaultMessage: '!!!Network',
  },
  walletSettingsWalletType: {
    id: 'components.settings.walletSettings.walletType',
    defaultMessage: '!!!Wallet Type',
  },
  walletSettingsByronWallet: {
    id: 'components.settings.walletSettings.byronWallet',
    defaultMessage: '!!!Byron Wallet',
  },
  walletSettingsShelleyWallet: {
    id: 'components.settings.walletSettings.shelleyWallet',
    defaultMessage: '!!!Shelley Wallet',
  },
  walletSettingsUnknownWalletType: {
    id: 'components.settings.walletSettings.unknownWalletType',
    defaultMessage: '!!!Unknown Wallet Type',
  },
  walletSettingsAbout: {
    id: 'components.settings.walletSettings.about',
    defaultMessage: '!!!About',
  },
  walletSettingsResync: {
    id: 'components.settings.walletSettings.resync',
    defaultMessage: '!!!Resync',
  },
  walletSettingsCollateral: {
    id: 'components.settings.walletSettings.collateral',
    defaultMessage: '!!!Collateral',
  },
  walletSettingsMultipleAddresses: {
    id: 'components.settings.walletSettings.multipleAddresses',
    defaultMessage: '!!!Multiple Addresses',
  },
  walletSettingsSingleAddress: {
    id: 'components.settings.walletSettings.singleAddress',
    defaultMessage: '!!!Single Address',
  },
  walletSettingsMultipleAddressesInfo: {
    id: 'components.settings.walletSettings.multipleAddressesInfo',
    defaultMessage: '!!!Multiple Addresses Info',
  },
  walletSettingsInAppNotifications: {
    id: 'components.settings.walletSettings.inAppNotifications',
    defaultMessage: '!!!In App Notifications',
  },
  walletSettingsAllowNotifications: {
    id: 'components.settings.walletSettings.allowNotifications',
    defaultMessage: '!!!Allow Notifications',
  },
  walletSettingsDisplayDuration: {
    id: 'components.settings.walletSettings.displayDuration',
    defaultMessage: '!!!Display Duration',
  },
  walletSettingsNotifications: {
    id: 'components.settings.walletSettings.notifications',
    defaultMessage: '!!!Notifications',
  },

  // Application Settings
  applicationSettingsGeneral: {
    id: 'components.settings.applicationSettings.general',
    defaultMessage: '!!!General',
  },
  applicationSettingsSecurityReporting: {
    id: 'components.settings.applicationSettings.securityReporting',
    defaultMessage: '!!!Security Reporting',
  },
  applicationSettingsSelectLanguage: {
    id: 'components.settings.applicationSettings.selectLanguage',
    defaultMessage: '!!!Select Language',
  },
  applicationSettingsSelectTheme: {
    id: 'components.settings.applicationSettings.selectTheme',
    defaultMessage: '!!!Select Theme',
  },
  applicationSettingsSelectFiatCurrency: {
    id: 'components.settings.applicationSettings.selectFiatCurrency',
    defaultMessage: '!!!Select Fiat Currency',
  },
  applicationSettingsAbout: {
    id: 'components.settings.applicationSettings.about',
    defaultMessage: '!!!About',
  },
  applicationSettingsChangePin: {
    id: 'components.settings.applicationSettings.changePin',
    defaultMessage: '!!!Change PIN',
  },
  applicationSettingsPrivacyMode: {
    id: 'components.settings.applicationSettings.privacyMode',
    defaultMessage: '!!!Privacy Mode',
  },
  applicationSettingsPrivacyModeInfo: {
    id: 'components.settings.applicationSettings.privacyModeInfo',
    defaultMessage: '!!!Privacy Mode Info',
  },
  applicationSettingsBiometricsSignIn: {
    id: 'components.settings.applicationSettings.biometricsSignIn',
    defaultMessage: '!!!Biometrics Sign In',
  },
  applicationSettingsBiometricsSignInInfo: {
    id: 'components.settings.applicationSettings.biometricsSignInInfo',
    defaultMessage: '!!!Biometrics Sign In Info',
  },
  applicationSettingsTermsOfservice: {
    id: 'components.settings.applicationSettings.termsOfservice',
    defaultMessage: '!!!Terms of Service',
  },
  applicationSettingsCrashReporting: {
    id: 'components.settings.applicationSettings.crashReporting',
    defaultMessage: '!!!Crash Reporting',
  },
  applicationSettingsCrashReportingInfo: {
    id: 'components.settings.applicationSettings.crashReportingInfo',
    defaultMessage: '!!!Crash Reporting Info',
  },
  applicationSettingsAnalytics: {
    id: 'components.settings.applicationSettings.analytics',
    defaultMessage: '!!!Analytics',
  },
  applicationSettingsPrivacyPolicy: {
    id: 'components.settings.applicationSettings.privacyPolicy',
    defaultMessage: '!!!Privacy Policy',
  },
  applicationSettingsScreenSharing: {
    id: 'components.settings.applicationSettings.screenSharing',
    defaultMessage: '!!!Screen Sharing',
  },
  applicationSettingsScreenSharingInfo: {
    id: 'components.settings.applicationSettings.screenSharingInfo',
    defaultMessage: '!!!Screen Sharing Info',
  },
  applicationSettingsNetwork: {
    id: 'components.settings.applicationSettings.network',
    defaultMessage: '!!!Network',
  },

  // Change Network
  changeNetworkNetworkNoticeTitle: {
    id: 'components.settings.changeNetwork.networkNoticeTitle',
    defaultMessage: '!!!Network Notice Title',
  },
  changeNetworkNetworkNoticeMessage: {
    id: 'components.settings.changeNetwork.networkNoticeMessage',
    defaultMessage: '!!!Network Notice Message',
  },
  changeNetworkNetworkNoticeListTitle: {
    id: 'components.settings.changeNetwork.networkNoticeListTitle',
    defaultMessage: '!!!Network Notice List Title',
  },
  changeNetworkNetworkNoticeList: {
    id: 'components.settings.changeNetwork.networkNoticeList',
    defaultMessage: '!!!Network Notice List',
  },
  changeNetworkNetworkNoticeButton: {
    id: 'components.settings.changeNetwork.networkNoticeButton',
    defaultMessage: '!!!Network Notice Button',
  },
  changeNetworkPreparingNetwork: {
    id: 'components.settings.changeNetwork.preparingNetwork',
    defaultMessage: '!!!Preparing Network',
  },
  changeNetworkNetworkTagModalTitle: {
    id: 'components.settings.changeNetwork.networkTagModalTitle',
    defaultMessage: '!!!Network Tag Modal Title',
  },
  changeNetworkNetworkTagModalText: {
    id: 'components.settings.changeNetwork.networkTagModalText',
    defaultMessage: '!!!Network Tag Modal Text',
  },
})
