import {defineMessages} from 'react-intl'

export const setupWalletMessages = defineMessages({
  notFound: {
    id: 'components.walletinit.createwallet.createwalletscreen.notFound',
    defaultMessage: '!!!Not found',
  },
  clearAll: {
    id: 'components.walletinit.createwallet.createwalletscreen.clearAll',
    defaultMessage: '!!!Clear all',
  },
  passwordStrengthRequirement: {
    id: 'components.walletinit.createwallet.createwalletscreen.passwordLengthRequirement',
    defaultMessage: '!!!Minimum {requiredPasswordLength} characters',
  },
  repeatPasswordInputLabel: {
    id: 'components.walletinit.walletform.repeatPasswordInputLabel',
    defaultMessage: '!!!Repeat password',
  },
  repeatPasswordInputError: {
    id: 'components.walletinit.walletform.repeatPasswordInputError',
    defaultMessage: '!!!Passwords do not match',
  },
  logoTitle: {
    id: 'components.walletinit.walletinitmenu.logo.title',
    defaultMessage: '!!!Yoroi',
  },
  logoSubtitle: {
    id: 'components.walletinit.walletinitmenu.logo.subtitle',
    defaultMessage: '!!!Light wallet for Cardano assets',
  },
  learnMore: {
    id: 'components.walletinit.learnMoreInfo.button.title',
    defaultMessage: '!!!Learn more on Yoroi FAQ',
  },
  continueButton: {
    id: 'components.walletinit.txnavigationbuttons.continueButton',
    defaultMessage: '!!!Continue',
  },
  next: {
    id: 'components.walletinit.txnavigationbuttons.nextButton',
    defaultMessage: '!!!Next',
  },
  createWalletButtonCard: {
    id: 'components.walletinit.walletinitmenu.createwalletbutton.title',
    defaultMessage: '!!!Create new wallet',
  },
  restoreWalletButtonCard: {
    id: 'components.walletinit.walletinitmenu.restorewalletbutton.title',
    defaultMessage: '!!!Restore wallet',
  },
  scanQrCodeTitle: {
    id: 'components.walletinit.walletinitmenu.scanqrcodebutton.title',
    defaultMessage: '!!!Scan QR code',
  },
  connectHardwareWalletButtonCard: {
    id: 'components.walletinit.connectnanox.savenanoxscreen.title',
    defaultMessage: '!!!Connect hardware wallet',
  },
  aboutRecoveryPhraseCardTitle: {
    id: 'components.walletinit.aboutRecoveryPhrase.aboutRecoveryStepper.title',
    defaultMessage: '!!!About recovery phrase',
  },
  aboutRecoveryPhraseCardFirstItem: {
    id: 'components.walletinit.aboutRecoveryPhrase.aboutRecoveryPhraseCard.firstItem',
    defaultMessage: '!!!Write down the recovery phrase',
  },
  aboutRecoveryPhraseCardSecondItem: {
    id: 'components.walletinit.aboutRecoveryPhrase.aboutRecoveryPhraseCard.secondItem',
    defaultMessage: '!!!Keep it safe',
  },
  aboutRecoveryPhraseCardThirdItem: {
    id: 'components.walletinit.aboutRecoveryPhrase.aboutRecoveryPhraseCard.thirdItem',
    defaultMessage: '!!!Never share it',
  },
  aboutRecoveryPhraseCardFourthItem: {
    id: 'components.walletinit.aboutRecoveryPhrase.aboutRecoveryPhraseCard.fourthItem',
    defaultMessage: '!!!Store it securely',
  },
  aboutRecoveryPhraseCardFifthItem: {
    id: 'components.walletinit.aboutRecoveryPhrase.aboutRecoveryPhraseCard.fifthItem',
    defaultMessage: '!!!Use it to restore your wallet',
  },
  recoveryPhraseTitle: {
    id: 'components.walletinit.recoveryPhrase.title',
    defaultMessage: '!!!Recovery phrase',
  },
  stepRecoveryPhrase: {
    id: 'components.walletinit.recoveryPhrase.recoveryStepper.title',
    defaultMessage: '!!!Step 1 of 3',
  },
  hideRecoveryPhraseButton: {
    id: 'components.walletinit.recoveryPhrase.hideRecoveryPhraseButton',
    defaultMessage: '!!!Hide recovery phrase',
  },
  showRecoveryPhraseButton: {
    id: 'components.walletinit.recoveryPhrase.showRecoveryPhraseButton',
    defaultMessage: '!!!Show recovery phrase',
  },
  recoveryPhraseModalTitle: {
    id: 'components.walletinit.recoveryPhrase.recoveryPhraseModal.title',
    defaultMessage: '!!!Recovery phrase',
  },
  recoveryPhraseCardTitle: {
    id: 'components.walletinit.recoveryPhrase.recoveryPhraseCard.title',
    defaultMessage: '!!!Recovery phrase',
  },
  recoveryPhraseCardFirstItem: {
    id: 'components.walletinit.recoveryPhrase.recoveryPhraseCard.firstItem',
    defaultMessage: '!!!Write down the recovery phrase',
  },
  recoveryPhraseCardSecondItem: {
    id: 'components.walletinit.recoveryPhrase.recoveryPhraseCard.secondItem',
    defaultMessage: '!!!Keep it safe',
  },
  recoveryPhraseCardThirdItem: {
    id: 'components.walletinit.recoveryPhrase.recoveryPhraseCard.thirdItem',
    defaultMessage: '!!!Never share it',
  },
  recoveryPhraseCardFourthItem: {
    id: 'components.walletinit.recoveryPhrase.recoveryPhraseCard.fourthItem',
    defaultMessage: '!!!Store it securely',
  },
  recoveryPhraseCardFifthItem: {
    id: 'components.walletinit.recoveryPhrase.recoveryPhraseCard.fifthItem',
    defaultMessage: '!!!Use it to restore your wallet',
  },
  verifyRecoveryPhraseTitle: {
    id: 'components.walletinit.verifyRecoveryPhrase.title',
    defaultMessage: '!!!Verify recovery phrase',
  },
  stepVerifyRecoveryPhrase: {
    id: 'components.walletinit.verifyRecoveryPhrase.verifyRecoveryStepper.title',
    defaultMessage: '!!!Step 2 of 3',
  },
  verifyRecoveryPhraseErrorMessage: {
    id: 'components.walletinit.verifyRecoveryPhrase.errorMessage',
    defaultMessage: '!!!Incorrect word',
  },
  verifyRecoveryPhraseSuccessMessage: {
    id: 'components.walletinit.verifyRecoveryPhrase.successMessage',
    defaultMessage: '!!!Correct',
  },
  walletDetailsModalTitle: {
    id: 'components.walletinit.walletDetails.walletDetailsModalTitle.title',
    defaultMessage: '!!!Wallet details',
  },
  walletNameModalCardTitle: {
    id: 'components.walletinit.walletDetails.walletNameModalCardTitle.title',
    defaultMessage: '!!!Wallet name',
  },
  walletNameModalCardFirstItem: {
    id: 'components.walletinit.walletDetails.walletNameModalCardItem.first',
    defaultMessage: '!!!Choose a name for your wallet',
  },
  walletNameModalCardSecondItem: {
    id: 'components.walletinit.walletDetails.walletNameModalCardItem.second',
    defaultMessage: '!!!This name will be used to identify your wallet',
  },
  walletPasswordModalCardTitle: {
    id: 'components.walletinit.walletDetails.walletPasswordModalCardTitle.title',
    defaultMessage: '!!!Wallet password',
  },
  walletPasswordModalCardFirstItem: {
    id: 'components.walletinit.walletDetails.walletPasswordModalCardItem.first',
    defaultMessage: '!!!Choose a strong password',
  },
  walletPasswordModalCardSecondItem: {
    id: 'components.walletinit.walletDetails.walletPasswordModalCardItem.second',
    defaultMessage: '!!!This password will protect your wallet',
  },
  walletChecksumModalCardTitle: {
    id: 'components.walletinit.walletDetails.walletChecksumModalCardTitle.title',
    defaultMessage: '!!!Wallet checksum',
  },
  walletChecksumModalCardFirstItem: {
    id: 'components.walletinit.walletDetails.walletChecksumModalCardItem.first',
    defaultMessage: '!!!This is your wallet checksum',
  },
  walletChecksum: {
    id: 'components.walletinit.walletDetails.walletChecksumModalCardItem.walletchecksum',
    defaultMessage: '!!!Checksum',
  },
  walletChecksumModalCardSecondItem: {
    id: 'components.walletinit.walletDetails.walletChecksumModalCardItem.second',
    defaultMessage: '!!!Use it to verify your wallet',
  },
  walletChecksumModalCardThirdItem: {
    id: 'components.walletinit.walletDetails.walletChecksumModalCardItem.third',
    defaultMessage: '!!!Keep it safe',
  },
  stepWalletDetails: {
    id: 'components.walletinit.walletDetails.stepWalletDetails',
    defaultMessage: '!!!Step 3 of 3',
  },
  walletDetailsTitle: {
    id: 'components.walletinit.walletDetails.walletDetailsTitle',
    defaultMessage: '!!!Wallet details',
  },
  walletDetailsPasswordHelper: {
    id: 'components.walletinit.walletDetails.walletDetailsPasswordHelper',
    defaultMessage: '!!!Password must be at least 10 characters',
  },
  walletDetailsNameInput: {
    id: 'components.walletinit.walletDetails.walletDetailsNameInput',
    defaultMessage: '!!!Wallet name',
  },
  walletDetailsPasswordInput: {
    id: 'components.walletinit.walletDetails.walletDetailsPasswordInput',
    defaultMessage: '!!!Password',
  },
  walletDetailsConfirmPasswordInput: {
    id: 'components.walletinit.walletDetails.walletDetailsConfirmPasswordInput',
    defaultMessage: '!!!Confirm password',
  },
  invalidChecksum: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.invalidchecksum',
    defaultMessage: '!!!Invalid checksum',
  },
  validChecksum: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.validchecksum',
    defaultMessage: '!!!Valid checksum',
  },
  stepRestoreWalletScreen: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.stepRestoreWalletScreen',
    defaultMessage: '!!!Step 1 of 2',
  },
  choose15WordsMnemonicTitle: {
    id: 'components.walletinit.restorewallet.choose15WordsMnemonicTitle',
    defaultMessage: '!!!15 words',
  },
  choose24WordsMnemonicTitle: {
    id: 'components.walletinit.restorewallet.choose24WordsMnemonicTitle',
    defaultMessage: '!!!24 words',
  },
  restoreWalletScreenTitle: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.restoreWalletScreenTitle',
    defaultMessage:
      '!!!Add the <b>recovery phrase</b> you received upon your wallet creation process.',
  },
  restoreDuplicatedWalletModalTitle: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.restoreDuplicatedWalletModalTitle',
    defaultMessage: '!!!Wallet already exists',
  },
  restoreDuplicatedWalletModalText: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.restoreDuplicatedWalletModalText',
    defaultMessage: '!!!A wallet with this recovery phrase already exists',
  },
  restoreDuplicatedWalletModalButton: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.restoreDuplicatedWalletModalButton',
    defaultMessage: '!!!OK',
  },
  preparingWallet: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.preparingWallet',
    defaultMessage: '!!!Preparing wallet',
  },
  continueInBackground: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.continueInBackground',
    defaultMessage: '!!!Continue in background',
  },
  wordNotFound: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.wordNotFound',
    defaultMessage: '!!!Word not found',
  },
  hwModalTitle: {
    id: 'components.ledger.ledgertransportswitchmodal.title',
    defaultMessage: '!!!Connect hardware wallet',
  },
  hwModalText: {
    id: 'components.ledger.ledgertransportswitchmodal.text',
    defaultMessage: '!!!Connect your hardware wallet to continue',
  },
  hwModalUsbButton: {
    id: 'components.ledger.ledgertransportswitchmodal.usbButton',
    defaultMessage: '!!!USB',
  },
  hwModalBtButton: {
    id: 'components.ledger.ledgertransportswitchmodal.bluetoothButton',
    defaultMessage: '!!!Bluetooth',
  },
  hwModalIosWarning: {
    id: 'components.ledger.ledgertransportswitchmodal.iosWarning',
    defaultMessage: '!!!iOS users must use USB',
  },
  hwWalletDetailsTitle: {
    id: 'components.walletinit.connectnanox.savenanoxscreen.title',
    defaultMessage: '!!!Hardware wallet details',
  },
  hwExportKey: {
    id: 'components.walletinit.connectnanox.connectnanoxscreen.exportKey',
    defaultMessage: '!!!Export public key',
  },
  bluetoothError: {
    id: 'components.walletinit.connectnanox.connectnanoxscreen.error',
    defaultMessage: '!!!Bluetooth error',
  },
  hwIntroTitle: {
    id: 'components.walletinit.connectnanox.checknanoxscreen.steppertitle',
    defaultMessage: '!!!Intro',
  },
  hwCheckIntroline: {
    id: 'components.walletinit.connectnanox.checknanoxscreen.introline',
    defaultMessage: '!!!Check your hardware wallet',
  },
  hwCheckTitle: {
    id: 'components.walletinit.connectnanox.checknanoxscreen.title',
    defaultMessage: '!!!Hardware wallet check',
  },
  ledgerSupportLink: {
    id: 'components.walletinit.connectnanox.checknanoxscreen.learnMore',
    defaultMessage: '!!!Ledger support',
  },
  addNewWalletTitle: {
    id: 'components.walletinit.walletinitscreen.title',
    defaultMessage: '!!!Add new wallet',
  },
  createWalletTitle: {
    id: 'components.walletinit.walletinitmenu.createwalletbutton.title',
    defaultMessage: '!!!Create wallet',
  },
  restoreWalletTitle: {
    id: 'components.walletinit.walletinitmenu.restorewalletbutton.title',
    defaultMessage: '!!!Restore wallet',
  },
  importReadOnlyTitle: {
    id: 'components.send.sendscreen.feeNotAvailable',
    defaultMessage: '!!!Import read-only wallet',
  },
  saveReadOnlyWalletTitle: {
    id: 'components.send.sendscreen.feeNotAvailable',
    defaultMessage: '!!!Save read-only wallet',
  },
  mnemonicShowTitle: {
    id: 'components.walletinit.createwallet.mnemonicshowscreen.title',
    defaultMessage: '!!!Show recovery phrase',
  },
  mnemonicCheckTitle: {
    id: 'components.walletinit.createwallet.mnemoniccheckscreen.title',
    defaultMessage: '!!!Check recovery phrase',
  },
  walletNameInputLabel: {
    id: 'components.walletinit.walletform.walletNameInputLabel',
    defaultMessage: '!!!Wallet name',
  },
  save: {
    id: 'components.walletinit.connectnanox.savenanoxscreen.save',
    defaultMessage: '!!!Save',
  },
  walletNameErrorTooLong: {
    id: 'components.walletinit.walletform.walletNameInputLabel',
    defaultMessage: '!!!Wallet name is too long',
  },
  walletNameErrorMustBeFilled: {
    id: 'components.walletinit.walletform.walletNameInputLabel',
    defaultMessage: '!!!Wallet name must be filled',
  },
  defaultWalletName: {
    id: 'components.walletinit.connectnanox.savenanoxscreen.ledgerWalletNameSuggestion',
    defaultMessage: '!!!My Wallet',
  },
  checksumLabel: {
    id: 'components.walletinit.walletDetails.walletChecksumModalCardTitle.title',
    defaultMessage: '!!!Checksum',
  },
  walletAddressLabel: {
    id: 'components.receive.addresscard.title',
    defaultMessage: '!!!Wallet address',
  },
  key: {
    id: 'analytics.private',
    defaultMessage: '!!!Key',
  },
  derivationPath: {
    id: 'components.receive.addressmodal.BIP32path',
    defaultMessage: '!!!Derivation path',
  },
  importReadOnlyWalletTitle: {
    id: 'components.walletinit.importreadonlywalletscreen.title',
    defaultMessage: '!!!Import read-only wallet',
  },
  importReadOnlyWalletDescription: {
    id: 'components.walletinit.importreadonlywalletscreen.paragraph',
    defaultMessage: '!!!Enter your wallet address',
  },
  importReadOnlyWalletAddress: {
    id: 'components.receive.addresscard.title',
    defaultMessage: '!!!Wallet address',
  },
  importReadOnlyWalletAddressPlaceholder: {
    id: 'components.send.sendscreen.addressInputLabel',
    defaultMessage: '!!!Enter wallet address',
  },
  importReadOnlyWalletImport: {
    id: 'components.settings.collateral.collateralInfoModalText',
    defaultMessage: '!!!Import',
  },
  connectWalletButtonCard: {
    id: 'components.walletinit.connectnanox.savenanoxscreen.title',
    defaultMessage: '!!!Connect hardware wallet',
  },
  cardanoMainnet: {
    id: 'components.walletinit.walletinitmenu.cardanoMainnetbutton.title',
    defaultMessage: '!!!Cardano Mainnet',
  },
  cardanoTestnet: {
    id: 'global.actions.dialogs.logout.noButton',
    defaultMessage: '!!!Cardano Testnet',
  },
  cardanoMainnetDescription: {
    id: 'portfolio.portfolioTokensDetailScreen.transactions',
    defaultMessage: '!!!Mainnet for real transactions',
  },
  cardanoTestnetDescription: {
    id: 'components.walletinit.walletinitmenu.cardanoTestnetDescription',
    defaultMessage: '!!!Testnet for testing',
  },
  aboutRecoveryPhraseTitle: {
    id: 'components.walletinit.aboutRecoveryPhrase.aboutRecoveryPhrase.title',
    defaultMessage: '!!!About recovery phrase',
  },
  stepAboutRecoveryPhrase: {
    id: 'components.walletinit.aboutRecoveryPhrase.aboutRecoveryStepper.title',
    defaultMessage: '!!!Step 1 of 3',
  },
  connectNanoXTitle: {
    id: 'components.walletinit.connectnanox.connectnanoxscreen.title',
    defaultMessage: '!!!Connect hardware wallet',
  },
  saveNanoXTitle: {
    id: 'components.walletinit.connectnanox.savenanoxscreen.title',
    defaultMessage: '!!!Save hardware wallet',
  },
  checkNanoXTitle: {
    id: 'components.walletinit.connectnanox.checknanoxscreen.title',
    defaultMessage: '!!!Check hardware wallet',
  },
  restoreWalletFromLinkSecurityWarningTitle: {
    id: 'components.walletinit.restorewalletfromlink.securityWarning.title',
    defaultMessage: '!!!Security Warning',
  },
  restoreWalletFromLinkSecurityWarningDescription: {
    id: 'components.walletinit.restorewalletfromlink.securityWarning.description',
    defaultMessage:
      '!!!You are about to restore a wallet from a link or QR code. Verify the source of this link/QR code. Malicious links could steal your funds. Only restore from trusted sources. By continuing, you acknowledge these risks.',
  },
  restoreWalletFromLinkContinueButton: {
    id: 'components.walletinit.restorewalletfromlink.securityWarning.continueButton',
    defaultMessage: '!!!I Understand, Continue',
  },
  shareWalletSetup: {
    id: 'setupWallet.shareWalletSetup',
    defaultMessage: '!!!Share Wallet Setup',
  },
  shareError: {
    id: 'setupWallet.shareError',
    defaultMessage: '!!!Share Error',
  },
  copied: {
    id: 'setupWallet.copied',
    defaultMessage: '!!!Copied',
  },
  walletSetupCopied: {
    id: 'setupWallet.walletSetupCopied',
    defaultMessage: '!!!Wallet setup copied to clipboard',
  },
  copyError: {
    id: 'setupWallet.copyError',
    defaultMessage: '!!!Copy Error',
  },
  shareWalletDetailsTitle: {
    id: 'setupWallet.shareWalletDetailsTitle',
    defaultMessage: '!!!Share Wallet Details',
  },
  shareWalletDetailsDescription: {
    id: 'setupWallet.shareWalletDetailsDescription',
    defaultMessage:
      '!!!Share the wallet setup JSON with other co-signers so they can import this multisig wallet.',
  },
  walletName: {
    id: 'setupWallet.walletName',
    defaultMessage: '!!!Wallet Name',
  },
  coSignersCount: {
    id: 'setupWallet.coSignersCount',
    defaultMessage: '!!!Co-Signers',
  },
  quorumRules: {
    id: 'setupWallet.quorumRules',
    defaultMessage: '!!!Quorum',
  },
  copyJSON: {
    id: 'setupWallet.copyJSON',
    defaultMessage: '!!!Copy JSON',
  },
  walletSetupJSON: {
    id: 'setupWallet.walletSetupJSON',
    defaultMessage: '!!!Wallet Setup JSON',
  },
  transactionCopiedToClipboard: {
    id: 'setupWallet.transactionCopiedToClipboard',
    defaultMessage: '!!!Transaction copied to clipboard',
  },
  notAllSignersSigned: {
    id: 'setupWallet.notAllSignersSigned',
    defaultMessage: '!!!Not All Signers Signed',
  },
  exportAndShareWithSigners: {
    id: 'setupWallet.exportAndShareWithSigners',
    defaultMessage: '!!!Export and share with signers',
  },
  signaturesRequired: {
    id: 'setupWallet.signaturesRequired',
    defaultMessage: '!!!Signatures Required',
  },
  signaturesReceived: {
    id: 'setupWallet.signaturesReceived',
    defaultMessage: '!!!Signatures Received',
  },
  exportTransaction: {
    id: 'setupWallet.exportTransaction',
    defaultMessage: '!!!Export Transaction',
  },
  submitTransaction: {
    id: 'setupWallet.submitTransaction',
    defaultMessage: '!!!Submit Transaction',
  },
  coSignTransactionTitle: {
    id: 'setupWallet.coSignTransactionTitle',
    defaultMessage: '!!!Co-Sign Transaction',
  },
  coSignTransactionDescription: {
    id: 'setupWallet.coSignTransactionDescription',
    defaultMessage: '!!!Import a transaction JSON file to sign it with your wallet.',
  },
  multisigTransaction: {
    id: 'setupWallet.multisigTransaction',
    defaultMessage: '!!!Multisig Transaction',
  },
  multipartyTransaction: {
    id: 'setupWallet.multipartyTransaction',
    defaultMessage: '!!!Multiparty Transaction',
  },
  selectJSONFile: {
    id: 'setupWallet.selectJSONFile',
    defaultMessage: '!!!Select JSON File',
  },
  pasteJSONManually: {
    id: 'setupWallet.pasteJSONManually',
    defaultMessage: '!!!Paste JSON Manually',
  },
  parseJSON: {
    id: 'setupWallet.parseJSON',
    defaultMessage: '!!!Parse JSON',
  },
  transactionImported: {
    id: 'setupWallet.transactionImported',
    defaultMessage: '!!!Transaction Imported',
  },
  transactionDetails: {
    id: 'setupWallet.transactionDetails',
    defaultMessage: '!!!Transaction Details',
  },
  fee: {
    id: 'setupWallet.fee',
    defaultMessage: '!!!Fee',
  },
  outputs: {
    id: 'setupWallet.outputs',
    defaultMessage: '!!!Outputs',
  },
  passwordInputLabel: {
    id: 'setupWallet.passwordInputLabel',
    defaultMessage: '!!!Password',
  },
  signTransaction: {
    id: 'setupWallet.signTransaction',
    defaultMessage: '!!!Sign Transaction',
  },
  selectDifferentFile: {
    id: 'setupWallet.selectDifferentFile',
    defaultMessage: '!!!Select Different File',
  },
  multisigSigningStatus: {
    id: 'setupWallet.multisigSigningStatus',
    defaultMessage: '!!!Multisig Signing Status',
  },
  quorumNotMet: {
    id: 'setupWallet.quorumNotMet',
    defaultMessage: '!!!Quorum Not Met',
  },
  transactionExported: {
    id: 'setupWallet.transactionExported',
    defaultMessage: '!!!Transaction Exported',
  },
  addCoSignersTitle: {
    id: 'setupWallet.addCoSignersTitle',
    defaultMessage: '!!!Add Co-Signers',
  },
  addCoSignersDescription: {
    id: 'setupWallet.addCoSignersDescription',
    defaultMessage: '!!!Add co-signers by entering their public keys.',
  },
  coSignersList: {
    id: 'setupWallet.coSignersList',
    defaultMessage: '!!!Co-Signers',
  },
  addNewCoSigner: {
    id: 'setupWallet.addNewCoSigner',
    defaultMessage: '!!!Add New Co-Signer',
  },
  coSignerNameLabel: {
    id: 'setupWallet.coSignerNameLabel',
    defaultMessage: '!!!Co-Signer Name',
  },
  publicKeyLabel: {
    id: 'setupWallet.publicKeyLabel',
    defaultMessage: '!!!Public Key',
  },
  addCoSignerButton: {
    id: 'setupWallet.addCoSignerButton',
    defaultMessage: '!!!Add Co-Signer',
  },
  reviewMultisigWalletTitle: {
    id: 'setupWallet.reviewMultisigWalletTitle',
    defaultMessage: '!!!Review Multisig Wallet',
  },
  walletNameInputLabel: {
    id: 'setupWallet.walletNameInputLabel',
    defaultMessage: '!!!Wallet Name',
  },
  repeatPasswordInputLabel: {
    id: 'setupWallet.repeatPasswordInputLabel',
    defaultMessage: '!!!Repeat Password',
  },
  walletConfiguration: {
    id: 'setupWallet.walletConfiguration',
    defaultMessage: '!!!Wallet Configuration',
  },
  createWalletButton: {
    id: 'setupWallet.createWalletButton',
    defaultMessage: '!!!Create Multisig Wallet',
  },
  createMultisigWalletTitle: {
    id: 'setupWallet.createMultisigWalletTitle',
    defaultMessage: '!!!Create Multisig Wallet',
  },
  createMultisigWalletDescription: {
    id: 'setupWallet.createMultisigWalletDescription',
    defaultMessage: '!!!Create a multisig wallet with multiple co-signers.',
  },
  noParentWalletsAvailable: {
    id: 'setupWallet.noParentWalletsAvailable',
    defaultMessage: '!!!No Parent Wallets Available',
  },
  createMultisigWalletButton: {
    id: 'setupWallet.createMultisigWalletButton',
    defaultMessage: '!!!Create Multisig Wallet',
  },
  importMultisigWalletButton: {
    id: 'setupWallet.importMultisigWalletButton',
    defaultMessage: '!!!Import Multisig Wallet',
  },
  noWalletSelected: {
    id: 'setupWallet.noWalletSelected',
    defaultMessage: '!!!No Wallet Selected',
  },
  selectWalletToImport: {
    id: 'setupWallet.selectWalletToImport',
    defaultMessage: '!!!Select a wallet to import the multisig wallet.',
  },
  importMultisigWalletTitle: {
    id: 'setupWallet.importMultisigWalletTitle',
    defaultMessage: '!!!Import Multisig Wallet',
  },
  importMultisigWalletDescription: {
    id: 'setupWallet.importMultisigWalletDescription',
    defaultMessage: '!!!Import a multisig wallet from a JSON file.',
  },
  fileImported: {
    id: 'setupWallet.fileImported',
    defaultMessage: '!!!File Imported',
  },
  validateAndImport: {
    id: 'setupWallet.validateAndImport',
    defaultMessage: '!!!Validate & Import',
  },
  defineQuorumTitle: {
    id: 'setupWallet.defineQuorumTitle',
    defaultMessage: '!!!Define Quorum Rules',
  },
  defineQuorumDescription: {
    id: 'setupWallet.defineQuorumDescription',
    defaultMessage: '!!!Configure how many signatures are required for transactions.',
  },
  quorumTypeLabel: {
    id: 'setupWallet.quorumTypeLabel',
    defaultMessage: '!!!Quorum Type',
  },
  quorumAllOf: {
    id: 'setupWallet.quorumAllOf',
    defaultMessage: '!!!Require All Of',
  },
  quorumAllOfDescription: {
    id: 'setupWallet.quorumAllOfDescription',
    defaultMessage: '!!!All co-signers must sign',
  },
  quorumAnyOf: {
    id: 'setupWallet.quorumAnyOf',
    defaultMessage: '!!!Require Any Of',
  },
  quorumAnyOfDescription: {
    id: 'setupWallet.quorumAnyOfDescription',
    defaultMessage: '!!!Any co-signer can sign',
  },
  quorumNOf: {
    id: 'setupWallet.quorumNOf',
    defaultMessage: '!!!Require N Of K',
  },
  quorumNOfDescription: {
    id: 'setupWallet.quorumNOfDescription',
    defaultMessage: '!!!N of K co-signers must sign',
  },
  requiredSignaturesLabel: {
    id: 'setupWallet.requiredSignaturesLabel',
    defaultMessage: '!!!Required Signatures',
  },
  noParentWalletsDescription: {
    id: 'setupWallet.noParentWalletsDescription',
    defaultMessage: '!!!You need at least one regular wallet to create a multisig wallet.',
  },
  selectParentWalletTitle: {
    id: 'setupWallet.selectParentWalletTitle',
    defaultMessage: '!!!Select Parent Wallet',
  },
  selectParentWalletDescription: {
    id: 'setupWallet.selectParentWalletDescription',
    defaultMessage: '!!!Select a wallet to generate a shared key from.',
  },
  parentWalletNotFound: {
    id: 'setupWallet.parentWalletNotFound',
    defaultMessage: '!!!Parent wallet not found',
  },
  generateSharedKeyTitle: {
    id: 'setupWallet.generateSharedKeyTitle',
    defaultMessage: '!!!Generate Shared Key',
  },
  generateSharedKeyDescription: {
    id: 'setupWallet.generateSharedKeyDescription',
    defaultMessage: '!!!Generate a shared wallet key from your parent wallet.',
  },
  generateSharedKeyButton: {
    id: 'setupWallet.generateSharedKeyButton',
    defaultMessage: '!!!Generate Shared Key',
  },
  sharedKeyGenerated: {
    id: 'setupWallet.sharedKeyGenerated',
    defaultMessage: '!!!Shared Key Generated',
  },
  createMultisigWalletButtonCard: {
    id: 'setupWallet.createMultisigWalletButtonCard',
    defaultMessage: '!!!Create Multisig Wallet',
  },
  coSigners: {
    id: 'setupWallet.coSigners',
    defaultMessage: '!!!Co-Signers',
  },
  exportWalletSetup: {
    id: 'setupWallet.exportWalletSetup',
    defaultMessage: '!!!Export Wallet Setup',
  },
  exportWalletSetupDescription: {
    id: 'setupWallet.exportWalletSetupDescription',
    defaultMessage: '!!!Export wallet setup JSON to share with co-signers.',
  },
  notMultisigWallet: {
    id: 'setupWallet.notMultisigWallet',
    defaultMessage: '!!!Not a Multisig Wallet',
  },
  selectMultisigWallet: {
    id: 'setupWallet.selectMultisigWallet',
    defaultMessage: '!!!Please select a multisig wallet.',
  },
})
