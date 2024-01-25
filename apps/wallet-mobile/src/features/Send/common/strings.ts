import {defineMessages, useIntl} from 'react-intl'

import globalMessages, {confirmationMessages, txLabels} from '../../../i18n/global-messages'

export const useStrings = () => {
  const intl = useIntl()

  return {
    addressInputLabel: intl.formatMessage(messages.addressInputLabel),
    addressReaderQrText: intl.formatMessage(messages.addressReaderQrText),
    all: intl.formatMessage(globalMessages.all),
    amount: intl.formatMessage(txLabels.amount),
    apply: intl.formatMessage(globalMessages.apply),
    asset: intl.formatMessage(messages.asset),
    assets: (qty: number) => intl.formatMessage(globalMessages.assets, {qty}),
    assetsLabel: intl.formatMessage(globalMessages.assetsLabel),
    availableFunds: intl.formatMessage(globalMessages.availableFunds),
    availableFundsBannerIsFetching: intl.formatMessage(messages.availableFundsBannerIsFetching),
    availableFundsBannerNotAvailable: intl.formatMessage(messages.availableFundsBannerNotAvailable),
    backButton: intl.formatMessage(confirmationMessages.commonButtons.backButton),
    balanceAfterLabel: intl.formatMessage(messages.balanceAfterLabel),
    balanceAfterNotAvailable: intl.formatMessage(messages.balanceAfterNotAvailable),
    checkboxSendAll: (options) => intl.formatMessage(messages.checkboxSendAll, options),
    checkboxSendAllAssets: intl.formatMessage(messages.checkboxSendAllAssets),
    continueButton: intl.formatMessage(messages.continueButton),
    domainNotRegisteredError: intl.formatMessage(messages.domainNotRegisteredError),
    domainRecordNotFoundError: intl.formatMessage(messages.domainRecordNotFoundError),
    domainUnsupportedError: intl.formatMessage(messages.domainUnsupportedError),
    errorBannerNetworkError: intl.formatMessage(messages.errorBannerNetworkError),
    errorBannerPendingOutgoingTransaction: intl.formatMessage(messages.errorBannerPendingOutgoingTransaction),
    failedTxButton: intl.formatMessage(messages.failedTxButton),
    failedTxText: intl.formatMessage(messages.failedTxText),
    failedTxTitle: intl.formatMessage(messages.failedTxTitle),
    feeLabel: intl.formatMessage(messages.feeLabel),
    feeNotAvailable: intl.formatMessage(messages.feeNotAvailable),
    found: intl.formatMessage(messages.found),
    helperAddressErrorInvalid: intl.formatMessage(messages.helperAddressErrorInvalid),
    helperAddressErrorWrongNetwork: intl.formatMessage(messages.helperAddressErrorWrongNetwork),
    helperMemoErrorTooLong: intl.formatMessage(messages.helperMemoErrorTooLong),
    helperMemoInstructions: intl.formatMessage(messages.helperMemoInstructions),
    helperResolverErrorUnsupportedDomain: intl.formatMessage(messages.helperResolverErrorUnsupportedDomain),
    manyNameServersWarning: intl.formatMessage(messages.manyNameServersWarning),
    max: intl.formatMessage(globalMessages.max),
    memoLabel: intl.formatMessage(messages.memoLabel),
    minPrimaryBalanceForTokens: intl.formatMessage(amountInputErrorMessages.minPrimaryBalanceForTokens),
    next: intl.formatMessage(globalMessages.next),
    nfts: (qty: number) => intl.formatMessage(globalMessages.nfts, {qty}),
    noAssets: intl.formatMessage(messages.noAssets),
    noAssetsAddedYet: (fungible) => intl.formatMessage(messages.noAssetsAddedYet, {fungible}),
    noBalance: intl.formatMessage(amountInputErrorMessages.insufficientBalance),
    ok: intl.formatMessage(globalMessages.ok),
    pleaseWait: intl.formatMessage(globalMessages.pleaseWait),
    pools: intl.formatMessage(globalMessages.pools),
    receiver: intl.formatMessage(messages.receiver),
    resolvedAddress: intl.formatMessage(messages.resolvedAddress),
    resolverNoticeTitle: intl.formatMessage(messages.resolverNoticeTitle),
    searchTokens: intl.formatMessage(messages.searchTokens),
    selecteAssetTitle: intl.formatMessage(messages.selectAssetTitle),
    sendAllContinueButton: intl.formatMessage(confirmationMessages.commonButtons.continueButton),
    sendAllWarningAlert1: (options) => intl.formatMessage(messages.sendAllWarningAlert1, options),
    sendAllWarningAlert2: intl.formatMessage(messages.sendAllWarningAlert2),
    sendAllWarningAlert3: intl.formatMessage(messages.sendAllWarningAlert3),
    sendAllWarningText: intl.formatMessage(messages.sendAllWarningText),
    sendAllWarningTitle: intl.formatMessage(messages.sendAllWarningTitle),
    submittedTxButton: intl.formatMessage(messages.submittedTxButton),
    submittedTxText: intl.formatMessage(messages.submittedTxText),
    submittedTxTitle: intl.formatMessage(messages.submittedTxTitle),
    tokens: (qty: number) => intl.formatMessage(globalMessages.tokens, {qty}),
    unknownAsset: intl.formatMessage(messages.unknownAsset),
    walletAddress: intl.formatMessage(messages.walletAddress),
    youHave: intl.formatMessage(messages.youHave),
  }
}

export const amountInputErrorMessages = defineMessages({
  INVALID_AMOUNT: {
    id: 'components.send.sendscreen.amountInput.error.INVALID_AMOUNT',
    defaultMessage: '!!!Please enter valid amount',
  },
  TOO_MANY_DECIMAL_PLACES: {
    id: 'components.send.sendscreen.amountInput.error.TOO_MANY_DECIMAL_PLACES',
    defaultMessage: '!!!Please enter valid amount',
  },
  TOO_LARGE: {
    id: 'components.send.sendscreen.amountInput.error.TOO_LARGE',
    defaultMessage: '!!!Amount too large',
  },
  TOO_LOW: {
    id: 'components.send.sendscreen.amountInput.error.TOO_LOW',
    defaultMessage: '!!!Amount is too low',
  },
  LT_MIN_UTXO: {
    id: 'components.send.sendscreen.amountInput.error.LT_MIN_UTXO',
    defaultMessage: '!!!Cannot send less than {minUtxo} {ticker}',
  },
  NEGATIVE: {
    id: 'components.send.sendscreen.amountInput.error.NEGATIVE',
    defaultMessage: '!!!Amount must be positive',
  },
  insufficientBalance: {
    id: 'components.send.sendscreen.amountInput.error.insufficientBalance',
    defaultMessage: '!!!Not enough money to make this transaction',
  },
  assetOverflow: {
    id: 'components.send.sendscreen.amountInput.error.assetOverflow',
    defaultMessage: '!!!!Maximum value of a token inside a UTXO exceeded (overflow).',
  },
  minPrimaryBalanceForTokens: {
    id: 'global.info.minPrimaryBalanceForTokens',
    defaultMessage: '!!!Keep some balance for tokens',
  },
})

export const messages = defineMessages({
  walletAddress: {
    id: 'components.send.sendscreen.walletAddress',
    defaultMessage: '!!!Wallet Address',
  },
  receiver: {
    id: 'components.send.sendscreen.receiver',
    defaultMessage: '!!!Receiver',
  },
  feeLabel: {
    id: 'components.send.sendscreen.feeLabel',
    defaultMessage: '!!!Fee',
  },
  feeNotAvailable: {
    id: 'components.send.sendscreen.feeNotAvailable',
    defaultMessage: '!!!-',
  },
  balanceAfterLabel: {
    id: 'global.txLabels.balanceAfterTx',
    defaultMessage: '!!!Balance after',
  },
  balanceAfterNotAvailable: {
    id: 'components.send.sendscreen.balanceAfterNotAvailable',
    defaultMessage: '!!!-',
  },
  availableFundsBannerIsFetching: {
    id: 'components.send.sendscreen.availableFundsBannerIsFetching',
    defaultMessage: '!!!Checking balance...',
  },
  availableFundsBannerNotAvailable: {
    id: 'components.send.sendscreen.availableFundsBannerNotAvailable',
    defaultMessage: '!!!-',
  },
  addressInputErrorInvalidAddress: {
    id: 'components.send.sendscreen.addressInputErrorInvalidAddress',
    defaultMessage: '!!!Please enter valid address',
  },
  addressInputErrorInvalidDomain: {
    id: 'components.send.sendscreen.addressInputErrorInvalidDomain',
    defaultMessage: '!!!Please enter valid domain',
  },
  addressInputLabel: {
    id: 'components.send.confirmscreen.receiver',
    defaultMessage: '!!!Receiver address, ADA Handle or domains',
  },
  checkboxSendAllAssets: {
    id: 'components.send.sendscreen.checkboxSendAllAssets',
    defaultMessage: '!!!Send all assets (including all tokens)',
  },
  checkboxSendAll: {
    id: 'components.send.sendscreen.checkboxSendAll',
    defaultMessage: '!!!Send all {assetId}',
  },
  domainNotRegisteredError: {
    id: 'components.send.sendscreen.domainNotRegisteredError',
    defaultMessage: '!!!Domain is not registered',
    description: 'some desc',
  },
  domainRecordNotFoundError: {
    id: 'components.send.sendscreen.domainRecordNotFoundError',
    defaultMessage: '!!!No Cardano record found for this domain',
    description: 'some desc',
  },
  domainUnsupportedError: {
    id: 'components.send.sendscreen.domainUnsupportedError',
    defaultMessage: '!!!Domain is not supported',
    description: 'some desc',
  },
  searchTokens: {
    id: 'components.send.sendscreen.searchTokens',
    defaultMessage: '!!!Search tokens',
  },
  selectAssetTitle: {
    id: 'components.send.selectasset.title',
    defaultMessage: '!!!Select asset',
  },
  unknownAsset: {
    id: 'components.send.assetselectorscreen.unknownAsset',
    defaultMessage: '!!!Unknown asset',
  },
  noAssets: {
    id: 'components.send.assetselectorscreen.noAssets',
    defaultMessage: '!!!No assets found',
  },
  found: {
    id: 'components.send.assetselectorscreen.found',
    defaultMessage: '!!!found',
  },
  youHave: {
    id: 'components.send.assetselectorscreen.youHave',
    defaultMessage: '!!!You have',
  },
  noAssetsAddedYet: {
    id: 'components.send.assetselectorscreen.noAssetsAddedYet',
    defaultMessage: '!!!No {fungible} added yet',
  },
  sendAllWarningTitle: {
    id: 'components.send.sendscreen.sendAllWarningTitle',
    defaultMessage: '!!!Do you really want to send all?',
  },
  sendAllWarningText: {
    id: 'components.send.sendscreen.sendAllWarningText',
    defaultMessage:
      '!!!You have selected the send all option. Please confirm that you understand how this feature works.',
  },
  sendAllWarningAlert1: {
    id: 'components.send.sendscreen.sendAllWarningAlert1',
    defaultMessage: '!!!All you {assetNameOrId} balance will be transferred in this transaction.',
  },
  sendAllWarningAlert2: {
    id: 'components.send.sendscreen.sendAllWarningAlert2',
    defaultMessage:
      '!!!All your tokens, including NFTs and any other native ' +
      'assets in your wallet, will also be transferred in this transaction.',
  },
  sendAllWarningAlert3: {
    id: 'components.send.sendscreen.sendAllWarningAlert3',
    defaultMessage: '!!!After you confirm the transaction in the next screen, your wallet will be emptied.',
  },
  continueButton: {
    id: 'components.send.sendscreen.continueButton',
    defaultMessage: '!!!Continue',
  },
  errorBannerNetworkError: {
    id: 'components.send.sendscreen.errorBannerNetworkError',
    defaultMessage: '!!!We are experiencing issues with fetching your current balance. Click to retry.',
  },
  errorBannerPendingOutgoingTransaction: {
    id: 'components.send.sendscreen.errorBannerPendingOutgoingTransaction',
    defaultMessage: '!!!You cannot send a new transaction while an existing one is still pending',
  },
  submittedTxTitle: {
    id: 'components.send.sendscreen.submittedTxTitle',
    defaultMessage: '!!!Transaction submitted',
  },
  submittedTxText: {
    id: 'components.send.sendscreen.submittedTxText',
    defaultMessage: '!!!Check this transaction in the list of wallet transactions',
  },
  submittedTxButton: {
    id: 'components.send.sendscreen.submittedTxButton',
    defaultMessage: '!!!Go to transactions',
  },
  failedTxTitle: {
    id: 'components.send.sendscreen.failedTxTitle',
    defaultMessage: '!!!Transaction failed',
  },
  failedTxText: {
    id: 'components.send.sendscreen.failedTxText',
    defaultMessage: '!!!Your transaction has not been processed properly due to technical issues',
  },
  failedTxButton: {
    id: 'components.send.sendscreen.failedTxButton',
    defaultMessage: '!!!Try again',
  },
  asset: {
    id: 'global.assets.assetLabel',
    defaultMessage: '!!!Asset',
  },
  addressReaderQrText: {
    id: 'components.send.addressreaderqr.text',
    defaultMessage: '!!!Scan recipients QR code to add a wallet address',
  },
  resolvedAddress: {
    id: 'components.send.sendscreen.resolvedAddress',
    defaultMessage: '!!!Related Address',
  },
  resolverNoticeTitle: {
    id: 'components.send.sendscreen.resolverNoticeTitle',
    defaultMessage: '!!!Yoroi Supports Name Resolution',
  },
  manyNameServersWarning: {
    id: 'send.warning.resolver.manyNameServers',
    defaultMessage: '!!!Multiple name servers found. Please select one.',
  },
  helperAddressErrorInvalid: {
    id: 'send.helper.addressError.invalid',
    defaultMessage: '!!!Please enter valid address',
  },
  helperAddressErrorWrongNetwork: {
    id: 'send.helper.addressError.wrongNetwork',
    defaultMessage: '!!!Please enter valid domain',
  },
  helperResolverErrorUnsupportedDomain: {
    id: 'send.helper.resolverError.unsupportedDomain',
    defaultMessage: '!!!Domain is not supported',
  },
  memoLabel: {
    id: 'components.send.memofield.label',
    defaultMessage: '!!!Memo',
  },
  helperMemoInstructions: {
    id: 'components.send.memofield.message',
    defaultMessage: '!!!(Optional) Memo is stored locally',
  },
  helperMemoErrorTooLong: {
    id: 'components.send.memofield.error',
    defaultMessage: '!!!Memo is too long',
  },
})
