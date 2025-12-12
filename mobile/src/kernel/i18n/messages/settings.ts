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

  // Advanced Address Retrieval
  advancedAddressRetrievalTitle: {
    id: 'components.settings.advancedaddressretrieval.title',
    defaultMessage: '!!!Advanced Address Retrieval',
  },
  advancedAddressRetrievalDescription: {
    id: 'components.settings.advancedaddressretrieval.description',
    defaultMessage:
      '!!!Generate addresses from multiple accounts for airdrop recovery. This tool will derive addresses from your wallet seed phrase.',
  },
  advancedAddressRetrievalNumberOfAccounts: {
    id: 'components.settings.advancedaddressretrieval.numberOfAccounts',
    defaultMessage: '!!!Number of Accounts',
  },
  advancedAddressRetrievalNumberOfAccountsPlaceholder: {
    id: 'components.settings.advancedaddressretrieval.numberOfAccountsPlaceholder',
    defaultMessage: '!!!e.g., 10',
  },
  advancedAddressRetrievalNumberOfAccountsHelper: {
    id: 'components.settings.advancedaddressretrieval.numberOfAccountsHelper',
    defaultMessage: '!!!Enter the number of accounts to generate (1-1000)',
  },
  advancedAddressRetrievalAddressesPerAccount: {
    id: 'components.settings.advancedaddressretrieval.addressesPerAccount',
    defaultMessage: '!!!Addresses per Account',
  },
  advancedAddressRetrievalAddressesPerAccountPlaceholder: {
    id: 'components.settings.advancedaddressretrieval.addressesPerAccountPlaceholder',
    defaultMessage: '!!!e.g., 20',
  },
  advancedAddressRetrievalAddressesPerAccountHelper: {
    id: 'components.settings.advancedaddressretrieval.addressesPerAccountHelper',
    defaultMessage:
      '!!!Enter the number of addresses to generate per account (1-10000)',
  },
  advancedAddressRetrievalInvalidInputTitle: {
    id: 'components.settings.advancedaddressretrieval.invalidInputTitle',
    defaultMessage: '!!!Invalid Input',
  },
  advancedAddressRetrievalInvalidInputMessage: {
    id: 'components.settings.advancedaddressretrieval.invalidInputMessage',
    defaultMessage:
      '!!!Please enter valid numbers: accounts (1-1000) and addresses per account (1-10000).',
  },
  advancedAddressRetrievalDiscoveringProgress: {
    id: 'components.settings.advancedaddressretrieval.discoveringProgress',
    defaultMessage:
      '!!!Discovering {accountCount} accounts with {addressCount} addresses each...',
  },
  advancedAddressRetrievalExportingCsv: {
    id: 'components.settings.advancedaddressretrieval.exportingCsv',
    defaultMessage: '!!!Exporting CSV...',
  },
  advancedAddressRetrievalDiscoveryCompleteTitle: {
    id: 'components.settings.advancedaddressretrieval.discoveryCompleteTitle',
    defaultMessage: '!!!Discovery Complete',
  },
  advancedAddressRetrievalDiscoveryCompleteMessage: {
    id: 'components.settings.advancedaddressretrieval.discoveryCompleteMessage',
    defaultMessage: '!!!Discovered {count} addresses.',
  },
  advancedAddressRetrievalDiscoveryCompleteDescription: {
    id: 'components.settings.advancedaddressretrieval.discoveryCompleteDescription',
    defaultMessage:
      '!!!You can now check addresses for UTXOs, history, and airdrop eligibility, or export them to a CSV file.',
  },
  advancedAddressRetrievalExportCompleteMessage: {
    id: 'components.settings.advancedaddressretrieval.exportCompleteMessage',
    defaultMessage:
      '!!!Exported {count} addresses to CSV file: {fileName}\n\nThe file has been saved to your Downloads folder.',
  },
  advancedAddressRetrievalSkip: {
    id: 'components.settings.advancedaddressretrieval.skip',
    defaultMessage: '!!!Skip',
  },
  advancedAddressRetrievalCheckAddresses: {
    id: 'components.settings.advancedaddressretrieval.checkAddresses',
    defaultMessage: '!!!Check Addresses',
  },
  advancedAddressRetrievalErrorTitle: {
    id: 'components.settings.advancedaddressretrieval.errorTitle',
    defaultMessage: '!!!Error',
  },
  advancedAddressRetrievalDiscoveryError: {
    id: 'components.settings.advancedaddressretrieval.discoveryError',
    defaultMessage: '!!!Failed to discover addresses. Please try again.',
  },
  advancedAddressRetrievalCheckingAddresses: {
    id: 'components.settings.advancedaddressretrieval.checkingAddresses',
    defaultMessage: '!!!Checking addresses...',
  },
  advancedAddressRetrievalCheckedProgress: {
    id: 'components.settings.advancedaddressretrieval.checkedProgress',
    defaultMessage: '!!!Checked {checked} of {total} addresses...',
  },
  advancedAddressRetrievalPaused: {
    id: 'components.settings.advancedaddressretrieval.paused',
    defaultMessage: '!!!Paused. Click Resume to continue.',
  },
  advancedAddressRetrievalVerificationCompleteTitle: {
    id: 'components.settings.advancedaddressretrieval.verificationCompleteTitle',
    defaultMessage: '!!!Verification Complete',
  },
  advancedAddressRetrievalVerificationCompleteMessage: {
    id: 'components.settings.advancedaddressretrieval.verificationCompleteMessage',
    defaultMessage:
      '!!!Checked {total} addresses.\n\nSaved {saved} addresses to wallet:\n• {utxoCount} with UTXOs\n• {historyCount} with history\n• {airdropCount} eligible for airdrop',
  },
  advancedAddressRetrievalVerificationError: {
    id: 'components.settings.advancedaddressretrieval.verificationError',
    defaultMessage: '!!!Failed to verify addresses. Please try again.',
  },
  advancedAddressRetrievalEnterPasswordTitle: {
    id: 'components.settings.advancedaddressretrieval.enterPasswordTitle',
    defaultMessage: '!!!Enter Wallet Password',
  },
  advancedAddressRetrievalEnterPasswordSummary: {
    id: 'components.settings.advancedaddressretrieval.enterPasswordSummary',
    defaultMessage: '!!!Enter your wallet password to discover addresses.',
  },
  advancedAddressRetrievalHardwareWalletTitle: {
    id: 'components.settings.advancedaddressretrieval.hardwareWalletTitle',
    defaultMessage: '!!!Hardware Wallet Mode',
  },
  advancedAddressRetrievalHardwareWalletContent: {
    id: 'components.settings.advancedaddressretrieval.hardwareWalletContent',
    defaultMessage:
      '!!!For hardware wallets, addresses will be generated only for accounts that have already been set up and have their public keys stored. New accounts cannot be derived without connecting to your hardware device.',
  },
  advancedAddressRetrievalFirstAccountOnlyTitle: {
    id: 'components.settings.advancedaddressretrieval.firstAccountOnlyTitle',
    defaultMessage: '!!!First Account Only',
  },
  advancedAddressRetrievalFirstAccountOnlyContent: {
    id: 'components.settings.advancedaddressretrieval.firstAccountOnlyContent',
    defaultMessage:
      '!!!Hardware wallets are restricted to the first account (account 0) only. This is because hardware wallets require physical device connection to derive addresses for additional accounts.',
  },
  advancedAddressRetrievalImportantTitle: {
    id: 'components.settings.advancedaddressretrieval.importantTitle',
    defaultMessage: '!!!Important',
  },
  advancedAddressRetrievalImportantContent: {
    id: 'components.settings.advancedaddressretrieval.importantContent',
    defaultMessage:
      '!!!This feature generates addresses from your wallet seed phrase. Make sure you are in a secure environment and do not share the exported files with untrusted parties.',
  },
  advancedAddressRetrievalDiscovering: {
    id: 'components.settings.advancedaddressretrieval.discovering',
    defaultMessage: '!!!Discovering...',
  },
  advancedAddressRetrievalDiscover: {
    id: 'components.settings.advancedaddressretrieval.discover',
    defaultMessage: '!!!Discover Addresses',
  },
  advancedAddressRetrievalExportCsv: {
    id: 'components.settings.advancedaddressretrieval.exportCsv',
    defaultMessage: '!!!Export CSV',
  },
  advancedAddressRetrievalExportCompleteTitle: {
    id: 'components.settings.advancedaddressretrieval.exportCompleteTitle',
    defaultMessage: '!!!Export Complete',
  },
  advancedAddressRetrievalExportError: {
    id: 'components.settings.advancedaddressretrieval.exportError',
    defaultMessage: '!!!Failed to export CSV. Please try again.',
  },
  advancedAddressRetrievalResumeChecking: {
    id: 'components.settings.advancedaddressretrieval.resumeChecking',
    defaultMessage: '!!!Resume Checking',
  },
  advancedAddressRetrievalPause: {
    id: 'components.settings.advancedaddressretrieval.pause',
    defaultMessage: '!!!Pause',
  },
  advancedAddressRetrievalStartOver: {
    id: 'components.settings.advancedaddressretrieval.startOver',
    defaultMessage: '!!!Start Over',
  },
  advancedAddressRetrievalCheckingAddressesFor: {
    id: 'components.settings.advancedaddressretrieval.checkingAddressesFor',
    defaultMessage:
      '!!!Checking addresses for UTXOs, history, and airdrop eligibility...',
  },
  advancedAddressRetrievalProgress: {
    id: 'components.settings.advancedaddressretrieval.progress',
    defaultMessage: '!!!Progress: {processed} / {total}',
  },
  advancedAddressRetrievalProcessComplete: {
    id: 'components.settings.advancedaddressretrieval.processComplete',
    defaultMessage: '!!!Process complete!',
  },
  advancedAddressRetrievalAddressesSavedToWallet: {
    id: 'components.settings.advancedaddressretrieval.addressesSavedToWallet',
    defaultMessage: '!!!Addresses saved to wallet:',
  },
  advancedAddressRetrievalWithUtxos: {
    id: 'components.settings.advancedaddressretrieval.withUtxos',
    defaultMessage: '!!!• {count} with UTXOs',
  },
  advancedAddressRetrievalWithHistory: {
    id: 'components.settings.advancedaddressretrieval.withHistory',
    defaultMessage: '!!!• {count} with history',
  },
  advancedAddressRetrievalEligibleForAirdrop: {
    id: 'components.settings.advancedaddressretrieval.eligibleForAirdrop',
    defaultMessage: '!!!• {count} eligible for airdrop',
  },
  advancedAddressRetrievalNoStoredAccountKeys: {
    id: 'components.settings.advancedaddressretrieval.noStoredAccountKeys',
    defaultMessage:
      '!!!No stored account public keys found. Hardware wallets need to have accounts set up first.',
  },
  advancedAddressRetrievalRootKeyRequired: {
    id: 'components.settings.advancedaddressretrieval.rootKeyRequired',
    defaultMessage: '!!!Root key required for non-hardware wallets',
  },
  advancedAddressRetrievalCsvHeaderAccount: {
    id: 'components.settings.advancedaddressretrieval.csvHeaderAccount',
    defaultMessage: '!!!Account',
  },
  advancedAddressRetrievalCsvHeaderAddressIndex: {
    id: 'components.settings.advancedaddressretrieval.csvHeaderAddressIndex',
    defaultMessage: '!!!Address Index',
  },
  advancedAddressRetrievalCsvHeaderAddress: {
    id: 'components.settings.advancedaddressretrieval.csvHeaderAddress',
    defaultMessage: '!!!Address',
  },
  advancedAddressRetrievalCsvHeaderDerivationPath: {
    id: 'components.settings.advancedaddressretrieval.csvHeaderDerivationPath',
    defaultMessage: '!!!Derivation Path',
  },
})
