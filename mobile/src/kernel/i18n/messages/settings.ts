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
    id: 'components.settings.changecustompinscreen.title',
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
    defaultMessage: '!!!Application',
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
  aboutFirebaseProjectId: {
    id: 'components.settings.walletsettingscreen.firebaseProjectId',
    defaultMessage: '!!!Firebase Project',
  },
  // Enable Login with OS
  enableLoginWithOsHeading: {
    id: 'components.settings.biometricslinkscreen.heading',
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
    id: 'components.settings.biometricslinkscreen.notNowButton',
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
    id: 'components.settings.enableeasyconfirmationscreen.enableHeading',
    defaultMessage: '!!!Enable Easy Confirmation',
  },
  easyConfirmationEnableWarning: {
    id: 'components.settings.enableeasyconfirmationscreen.enableWarning',
    defaultMessage: '!!!Enable Warning',
  },
  easyConfirmationEnableRootPassword: {
    id: 'components.settings.enableeasyconfirmationscreen.enableMasterPassword',
    defaultMessage: '!!!Enable Root Password',
  },
  easyConfirmationEnableButton: {
    id: 'components.settings.enableeasyconfirmationscreen.enableButton',
    defaultMessage: '!!!Enable',
  },

  // Remove Wallet
  removeWalletDescriptionParagraph1: {
    id: 'components.settings.removewalletscreen.descriptionParagraph1',
    defaultMessage: '!!!Remove Wallet Description Paragraph 1',
  },
  removeWalletDescriptionParagraph2: {
    id: 'components.settings.removewalletscreen.descriptionParagraph2',
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
    id: 'components.settings.removewalletscreen.walletNameMismatchError',
    defaultMessage: '!!!Wallet Name Mismatch Error',
  },
  removeWalletRemove: {
    id: 'components.settings.removewalletscreen.remove',
    defaultMessage: '!!!Remove',
  },
  removeWalletHasWrittenDownMnemonic: {
    id: 'components.settings.removewalletscreen.hasWrittenDownMnemonic',
    defaultMessage: '!!!Has Written Down Mnemonic',
  },

  // Rename Wallet
  renameWalletChangeButton: {
    id: 'components.settings.changewalletname.changeButton',
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
    id: 'components.settings.changepasswordscreen.newPasswordInputNotMatchError',
    defaultMessage: '!!!Password Strength Requirement',
  },
  changePasswordRepeatPasswordInputLabel: {
    id: 'components.walletinit.walletform.repeatPasswordInputLabel',
    defaultMessage: '!!!Repeat Password Input Label',
  },
  changePasswordRepeatPasswordInputNotMatchError: {
    id: 'components.settings.changepasswordscreen.repeatPasswordInputNotMatchError',
    defaultMessage: '!!!Repeat Password Input Not Match Error',
  },
  changePasswordContinueButton: {
    id: 'components.settings.changepasswordscreen.continueButton',
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
    id: 'components.settings.walletsettingscreen.easyConfirmation',
    defaultMessage: '!!!Easy Confirmation',
  },
  walletSettingsEasyConfirmationInfo: {
    id: 'components.settings.walletsettingscreen.easyConfirmationInfo',
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
    id: 'components.settings.walletsettingscreen.byronWallet',
    defaultMessage: '!!!Byron Wallet',
  },
  walletSettingsShelleyWallet: {
    id: 'components.settings.walletsettingscreen.shelleyWallet',
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
    id: 'global.multipleAddressesInfo',
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
  walletSettingsShareWallet: {
    id: 'components.settings.walletsettingscreen.shareWallet',
    defaultMessage: '!!!Share Wallet',
  },

  // Share Wallet
  shareWalletTitle: {
    id: 'components.settings.sharewallet.title',
    defaultMessage: '!!!Share Wallet',
  },
  shareWalletDescription: {
    id: 'components.settings.sharewallet.description',
    defaultMessage:
      '!!!Generate a shareable link or QR code to restore this wallet on another device.',
  },
  shareWalletFullWallet: {
    id: 'components.settings.sharewallet.fullWallet',
    defaultMessage: '!!!Share Full Wallet',
  },
  shareWalletReadOnlyWallet: {
    id: 'components.settings.sharewallet.readOnlyWallet',
    defaultMessage: '!!!Share Read-Only Wallet',
  },
  shareWalletEnterPassword: {
    id: 'components.settings.sharewallet.enterPassword',
    defaultMessage: '!!!Enter Password',
  },
  shareWalletPassword: {
    id: 'components.settings.sharewallet.password',
    defaultMessage: '!!!Password',
  },
  shareWalletConfirm: {
    id: 'components.settings.sharewallet.confirm',
    defaultMessage: '!!!Confirm',
  },
  shareWalletWrongPassword: {
    id: 'components.settings.sharewallet.wrongPassword',
    defaultMessage: '!!!Wrong password',
  },
  shareWalletError: {
    id: 'components.settings.sharewallet.error',
    defaultMessage: '!!!An error occurred',
  },
  shareWalletWalletLinkGenerated: {
    id: 'components.settings.sharewallet.walletLinkGenerated',
    defaultMessage: '!!!Wallet Link Generated',
  },
  shareWalletWalletLink: {
    id: 'components.settings.sharewallet.walletLink',
    defaultMessage: '!!!Wallet Link',
  },
  shareWalletCopyLink: {
    id: 'components.settings.sharewallet.copyLink',
    defaultMessage: '!!!Copy Link',
  },
  shareWalletLinkCopied: {
    id: 'components.settings.sharewallet.linkCopied',
    defaultMessage: '!!!Link Copied',
  },
  shareWalletClose: {
    id: 'components.settings.sharewallet.close',
    defaultMessage: '!!!Close',
  },
  shareWalletShareQRCode: {
    id: 'components.settings.sharewallet.shareQRCode',
    defaultMessage: '!!!Share QR Code',
  },
  shareWalletFullWalletLink: {
    id: 'components.settings.sharewallet.fullWalletLink',
    defaultMessage: '!!!Full Wallet Link',
  },
  shareWalletReadOnlyWalletLink: {
    id: 'components.settings.sharewallet.readOnlyWalletLink',
    defaultMessage: '!!!Read-Only Wallet Link',
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
    id: 'components.settings.applicationsettingsscreen.selectLanguage',
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
    id: 'components.settings.applicationsettingsscreen.privacyModeInfo',
    defaultMessage: '!!!Privacy Mode Info',
  },
  applicationSettingsBiometricsSignIn: {
    id: 'components.settings.applicationsettingsscreen.biometricsSignIn',
    defaultMessage: '!!!Biometrics Sign In',
  },
  applicationSettingsBiometricsSignInInfo: {
    id: 'components.settings.applicationsettingsscreen.biometricsSignInInfo',
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
    id: 'components.settings.applicationsettingsscreen.crashReportingInfo',
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
  applicationSettingsNetwork: {
    id: 'global.network',
    defaultMessage: '!!!Network',
  },

  // Change Network
  changeNetworkNetworkNoticeTitle: {
    id: 'components.settings.applicationsettingsscreen.network.notice.title',
    defaultMessage: '!!!Network Notice Title',
  },
  changeNetworkNetworkNoticeMessage: {
    id: 'components.settings.applicationsettingsscreen.network.notice.message',
    defaultMessage: '!!!Network Notice Message',
  },
  changeNetworkNetworkNoticeListTitle: {
    id: 'components.settings.applicationsettingsscreen.network.notice.listTitle',
    defaultMessage: '!!!Network Notice List Title',
  },
  changeNetworkNetworkNoticeList: {
    id: 'components.settings.applicationsettingsscreen.network.notice.list',
    defaultMessage: '!!!Network Notice List',
  },
  changeNetworkNetworkNoticeButton: {
    id: 'components.settings.applicationsettingsscreen.network.notice.button',
    defaultMessage: '!!!Network Notice Button',
  },
  changeNetworkPreparingNetwork: {
    id: 'components.settings.applicationsettingsscreen.network.preparingNetworks',
    defaultMessage: '!!!Preparing Network',
  },
  changeNetworkNetworkTagModalTitle: {
    id: 'components.settings.applicationsettingsscreen.network.tag.modal.title',
    defaultMessage: '!!!Network Tag Modal Title',
  },
  changeNetworkNetworkTagModalText: {
    id: 'components.settings.applicationsettingsscreen.network.tag.modal.text',
    defaultMessage: '!!!Network Tag Modal Text',
  },
})
