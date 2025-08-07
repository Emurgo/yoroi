import {defineMessages} from 'react-intl'

export const settingsMessages = defineMessages({
  // Main settings
  appSettingsTitle: {
    id: 'menu.appSettings',
    defaultMessage: '!!!App Settings',
  },
  aboutTitle: {
    id: 'components.settings.walletsettingscreen.about',
    defaultMessage: '!!!About',
  },
  systemLogTitle: {
    id: 'global.log',
    defaultMessage: '!!!System Log',
  },
  settingsTitle: {
    id: 'menu.settings',
    defaultMessage: '!!!Settings',
  },
  changeWalletNameTitle: {
    id: 'components.settings.changewalletname.title',
    defaultMessage: '!!!Change Wallet Name',
  },
  termsOfServiceTitle: {
    id: 'termsOfService.tosAgreement',
    defaultMessage: '!!!Terms of Service',
  },
  privacyPolicyTitle: {
    id: 'termsOfService.privacyPolicyTitle',
    defaultMessage: '!!!Privacy Policy',
  },
  removeWalletTitle: {
    id: 'components.settings.walletsettingscreen.removeWallet',
    defaultMessage: '!!!Remove Wallet',
  },
  languageTitle: {
    id: 'global.title',
    defaultMessage: '!!!Language',
  },
  themeTitle: {
    id: 'components.settings.applicationsettingsscreen.selectTheme',
    defaultMessage: '!!!Theme',
  },
  networkTitle: {
    id: 'global.network',
    defaultMessage: '!!!Network',
  },
  enableEasyConfirmationTitle: {
    id: 'components.settings.enableeasyconfirmationscreen.title',
    defaultMessage: '!!!Enable Easy Confirmation',
  },
  disableEasyConfirmationTitle: {
    id: 'components.settings.disableeasyconfirmationscreen.title',
    defaultMessage: '!!!Disable Easy Confirmation',
  },
  changePasswordTitle: {
    id: 'components.settings.changepasswordscreen.continueButton',
    defaultMessage: '!!!Change Password',
  },
  changeCustomPinTitle: {
    id: 'txReview.overview.receiveToLabel',
    defaultMessage: '!!!Change Custom PIN',
  },
  collateral: {
    id: 'global.collateral',
    defaultMessage: '!!!Collateral',
  },
  customPinTitle: {
    id: 'txReview.overview.receiveToLabel',
    defaultMessage: '!!!Custom PIN',
  },
  walletTabTitle: {
    id: 'txReview.overview.wallet',
    defaultMessage: '!!!Wallet',
  },
  appTabTitle: {
    id: 'components.settings.applicationsettingsscreen.tabTitle',
    defaultMessage: '!!!App',
  },
  notifications: {
    id: 'components.txhistory.notifications.title',
    defaultMessage: '!!!Notifications',
  },
  toggleAnalyticsSettingsTitle: {
    id: 'components.settings.applicationsettingsscreen.analytics',
    defaultMessage: '!!!Toggle Analytics Settings',
  },

  // About section
  aboutWalletType: {
    id: 'components.settings.applicationsettingsscreen.walletType',
    defaultMessage: '!!!Wallet Type',
  },
  aboutByronWallet: {
    id: 'txReview.overview.wallet',
    defaultMessage: '!!!Byron Wallet',
  },
  aboutShelleyWallet: {
    id: 'txReview.overview.wallet',
    defaultMessage: '!!!Shelley Wallet',
  },
  aboutUnknownWalletType: {
    id: 'components.settings.walletsettingscreen.unknownWalletType',
    defaultMessage: '!!!Unknown Wallet Type',
  },
  aboutFcmToken: {
    id: 'components.settings.walletsettingscreen.fcmToken',
    defaultMessage: '!!!FCM Token',
  },

  // Enable Login with OS
  enableLoginWithOsHeading: {
    id: 'components.login.appstartscreen.loginButton',
    defaultMessage: '!!!Enable Login with OS',
  },
  enableLoginWithOsSubHeading1: {
    id: 'components.settings.biometricslinkscreen.subHeading1',
    defaultMessage: '!!!Sub Heading 1',
  },
  enableLoginWithOsSubHeading2: {
    id: 'components.settings.biometricslinkscreen.subHeading2',
    defaultMessage: '!!!Sub Heading 2',
  },
  enableLoginWithOsNotNowButton: {
    id: 'components.walletinit.biometricScreen.ignoreButton.title',
    defaultMessage: '!!!Not Now',
  },
  enableLoginWithOsLinkButton: {
    id: 'components.settings.biometricslinkscreen.linkButton',
    defaultMessage: '!!!Link',
  },

  // Easy Confirmation
  easyConfirmationDisableHeading: {
    id: 'components.settings.disableeasyconfirmationscreen.title',
    defaultMessage: '!!!Disable Easy Confirmation',
  },
  easyConfirmationDisableButton: {
    id: 'components.settings.disableeasyconfirmationscreen.disableButton',
    defaultMessage: '!!!Disable',
  },
  easyConfirmationEnableHeading: {
    id: 'components.settings.enableeasyconfirmationscreen.title',
    defaultMessage: '!!!Enable Easy Confirmation',
  },
  easyConfirmationEnableWarning: {
    id: 'components.settings.enableeasyconfirmationscreen.enableButton',
    defaultMessage: '!!!Enable Warning',
  },
  easyConfirmationEnableRootPassword: {
    id: 'components.settings.enableeasyconfirmationscreen.enableButton',
    defaultMessage: '!!!Enable Root Password',
  },
  easyConfirmationEnableButton: {
    id: 'components.settings.enableeasyconfirmationscreen.enableButton',
    defaultMessage: '!!!Enable',
  },

  // Remove Wallet
  removeWalletDescriptionParagraph1: {
    id: 'components.settings.walletsettingscreen.removeWallet',
    defaultMessage: '!!!Remove Wallet Description Paragraph 1',
  },
  removeWalletDescriptionParagraph2: {
    id: 'components.settings.walletsettingscreen.removeWallet',
    defaultMessage: '!!!Remove Wallet Description Paragraph 2',
  },
  removeWalletWalletName: {
    id: 'components.walletinit.walletform.walletNameInputLabel',
    defaultMessage: '!!!Wallet Name',
  },
  removeWalletWalletNameInput: {
    id: 'components.walletinit.walletform.walletNameInputLabel',
    defaultMessage: '!!!Wallet Name Input',
  },
  removeWalletWalletNameMismatchError: {
    id: 'global.error',
    defaultMessage: '!!!Wallet Name Mismatch Error',
  },
  removeWalletRemove: {
    id: 'components.settings.collateral.removeCollateral',
    defaultMessage: '!!!Remove',
  },
  removeWalletHasWrittenDownMnemonic: {
    id: 'components.settings.removewalletscreen.hasWrittenDownMnemonic',
    defaultMessage: '!!!Has Written Down Mnemonic',
  },

  // Rename Wallet
  renameWalletChangeButton: {
    id: 'components.governance.actionYouHaveSelected',
    defaultMessage: '!!!Change',
  },
  renameWalletWalletNameInputLabel: {
    id: 'components.walletinit.walletform.walletNameInputLabel',
    defaultMessage: '!!!Wallet Name Input Label',
  },

  // Change Password
  changePasswordOldPasswordInputLabel: {
    id: 'components.settings.changepasswordscreen.oldPasswordInputLabel',
    defaultMessage: '!!!Old Password Input Label',
  },
  changePasswordNewPasswordInputLabel: {
    id: 'components.settings.changepasswordscreen.newPasswordInputLabel',
    defaultMessage: '!!!New Password Input Label',
  },
  changePasswordPasswordStrengthRequirement: {
    id: 'components.walletinit.passwordstrengthindicator.passwordRequirementsNote',
    defaultMessage: '!!!Password Strength Requirement',
  },
  changePasswordRepeatPasswordInputLabel: {
    id: 'components.walletinit.walletform.repeatPasswordInputLabel',
    defaultMessage: '!!!Repeat Password Input Label',
  },
  changePasswordRepeatPasswordInputNotMatchError: {
    id: 'global.error',
    defaultMessage: '!!!Repeat Password Input Not Match Error',
  },
  changePasswordContinueButton: {
    id: 'global.continue',
    defaultMessage: '!!!Continue',
  },

  // Wallet Settings
  walletSettingsGeneral: {
    id: 'components.settings.walletsettingscreen.general',
    defaultMessage: '!!!General',
  },
  walletSettingsActions: {
    id: 'components.settings.walletsettingscreen.actions',
    defaultMessage: '!!!Actions',
  },
  walletSettingsSwitchWallet: {
    id: 'components.settings.walletsettingscreen.switchWallet',
    defaultMessage: '!!!Switch Wallet',
  },
  walletSettingsLogout: {
    id: 'global.actions.dialogs.logout.title',
    defaultMessage: '!!!Logout',
  },
  walletSettingsWalletName: {
    id: 'components.walletinit.walletform.walletNameInputLabel',
    defaultMessage: '!!!Wallet Name',
  },
  walletSettingsSecurity: {
    id: 'components.settings.walletsettingscreen.security',
    defaultMessage: '!!!Security',
  },
  walletSettingsChangePassword: {
    id: 'components.settings.changepasswordscreen.continueButton',
    defaultMessage: '!!!Change Password',
  },
  walletSettingsEasyConfirmation: {
    id: 'txReview.confirm',
    defaultMessage: '!!!Easy Confirmation',
  },
  walletSettingsEasyConfirmationInfo: {
    id: 'txReview.confirm',
    defaultMessage: '!!!Easy Confirmation Info',
  },
  walletSettingsRemoveWallet: {
    id: 'components.settings.walletsettingscreen.removeWallet',
    defaultMessage: '!!!Remove Wallet',
  },
  walletSettingsNetwork: {
    id: 'global.network',
    defaultMessage: '!!!Network',
  },
  walletSettingsWalletType: {
    id: 'components.settings.applicationsettingsscreen.walletType',
    defaultMessage: '!!!Wallet Type',
  },
  walletSettingsByronWallet: {
    id: 'txReview.overview.wallet',
    defaultMessage: '!!!Byron Wallet',
  },
  walletSettingsShelleyWallet: {
    id: 'txReview.overview.wallet',
    defaultMessage: '!!!Shelley Wallet',
  },
  walletSettingsUnknownWalletType: {
    id: 'components.settings.walletsettingscreen.unknownWalletType',
    defaultMessage: '!!!Unknown Wallet Type',
  },
  walletSettingsAbout: {
    id: 'components.settings.walletsettingscreen.about',
    defaultMessage: '!!!About',
  },
  walletSettingsResync: {
    id: 'global.actions.dialogs.resync.title',
    defaultMessage: '!!!Resync',
  },
  walletSettingsCollateral: {
    id: 'global.collateral',
    defaultMessage: '!!!Collateral',
  },
  walletSettingsMultipleAddresses: {
    id: 'global.multipleAddresses',
    defaultMessage: '!!!Multiple Addresses',
  },
  walletSettingsSingleAddress: {
    id: 'discover.discoverList.singleAddress',
    defaultMessage: '!!!Single Address',
  },
  walletSettingsMultipleAddressesInfo: {
    id: 'components.send.sendscreen.addressInputLabel',
    defaultMessage: '!!!Multiple Addresses Info',
  },
  walletSettingsInAppNotifications: {
    id: 'components.txhistory.notifications.title',
    defaultMessage: '!!!In App Notifications',
  },
  walletSettingsAllowNotifications: {
    id: 'components.settings.walletsettingscreen.allowNotifications',
    defaultMessage: '!!!Allow Notifications',
  },
  walletSettingsDisplayDuration: {
    id: 'components.settings.manageNotificationDisplayDuration.displayDuration',
    defaultMessage: '!!!Display Duration',
  },
  walletSettingsNotifications: {
    id: 'components.txhistory.notifications.title',
    defaultMessage: '!!!Notifications',
  },

  // Application Settings
  applicationSettingsGeneral: {
    id: 'components.settings.walletsettingscreen.general',
    defaultMessage: '!!!General',
  },
  applicationSettingsSecurityReporting: {
    id: 'components.settings.walletsettingscreen.security',
    defaultMessage: '!!!Security Reporting',
  },
  applicationSettingsSelectLanguage: {
    id: 'analytics.selectLanguage',
    defaultMessage: '!!!Select Language',
  },
  applicationSettingsSelectTheme: {
    id: 'components.settings.applicationsettingsscreen.selectTheme',
    defaultMessage: '!!!Select Theme',
  },
  applicationSettingsSelectFiatCurrency: {
    id: 'components.settings.applicationsettingsscreen.selectFiatCurrency',
    defaultMessage: '!!!Select Fiat Currency',
  },
  applicationSettingsAbout: {
    id: 'components.settings.walletsettingscreen.about',
    defaultMessage: '!!!About',
  },
  applicationSettingsChangePin: {
    id: 'components.settings.changecustompinscreen.title',
    defaultMessage: '!!!Change PIN',
  },
  applicationSettingsPrivacyMode: {
    id: 'components.settings.applicationsettingsscreen.privacyMode',
    defaultMessage: '!!!Privacy Mode',
  },
  applicationSettingsPrivacyModeInfo: {
    id: 'portfolio.portfolioTokensDetailScreen.info',
    defaultMessage: '!!!Privacy Mode Info',
  },
  applicationSettingsBiometricsSignIn: {
    id: 'components.send.biometricauthscreen.headings2',
    defaultMessage: '!!!Biometrics Sign In',
  },
  applicationSettingsBiometricsSignInInfo: {
    id: 'components.send.biometricauthscreen.headings2',
    defaultMessage: '!!!Biometrics Sign In Info',
  },
  applicationSettingsTermsOfservice: {
    id: 'termsOfService.tosAgreement',
    defaultMessage: '!!!Terms of Service',
  },
  applicationSettingsCrashReporting: {
    id: 'components.settings.applicationsettingsscreen.crashReporting',
    defaultMessage: '!!!Crash Reporting',
  },
  applicationSettingsCrashReportingInfo: {
    id: 'portfolio.portfolioTokensDetailScreen.info',
    defaultMessage: '!!!Crash Reporting Info',
  },
  applicationSettingsAnalytics: {
    id: 'components.settings.applicationsettingsscreen.analytics',
    defaultMessage: '!!!Analytics',
  },
  applicationSettingsPrivacyPolicy: {
    id: 'termsOfService.privacyPolicyTitle',
    defaultMessage: '!!!Privacy Policy',
  },
  applicationSettingsScreenSharing: {
    id: 'components.settings.applicationsettingsscreen.screenSharing',
    defaultMessage: '!!!Screen Sharing',
  },
  applicationSettingsScreenSharingInfo: {
    id: 'portfolio.portfolioTokensDetailScreen.info',
    defaultMessage: '!!!Screen Sharing Info',
  },
  applicationSettingsNetwork: {
    id: 'global.network',
    defaultMessage: '!!!Network',
  },

  // Change Network
  changeNetworkNetworkNoticeTitle: {
    id: 'global.network',
    defaultMessage: '!!!Network Notice Title',
  },
  changeNetworkNetworkNoticeMessage: {
    id: 'global.network',
    defaultMessage: '!!!Network Notice Message',
  },
  changeNetworkNetworkNoticeListTitle: {
    id: 'global.network',
    defaultMessage: '!!!Network Notice List Title',
  },
  changeNetworkNetworkNoticeList: {
    id: 'global.network',
    defaultMessage: '!!!Network Notice List',
  },
  changeNetworkNetworkNoticeButton: {
    id: 'global.network',
    defaultMessage: '!!!Network Notice Button',
  },
  changeNetworkPreparingNetwork: {
    id: 'global.network',
    defaultMessage: '!!!Preparing Network',
  },
  changeNetworkNetworkTagModalTitle: {
    id: 'global.network',
    defaultMessage: '!!!Network Tag Modal Title',
  },
  changeNetworkNetworkTagModalText: {
    id: 'global.network',
    defaultMessage: '!!!Network Tag Modal Text',
  },
})
