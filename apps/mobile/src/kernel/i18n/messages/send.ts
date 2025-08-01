import {defineMessages} from 'react-intl'

export const sendMessages = defineMessages({
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
    defaultMessage: '!!!Fee not available',
  },
  amountLabel: {
    id: 'components.send.sendscreen.amountLabel',
    defaultMessage: '!!!Amount',
  },
  amountInputLabel: {
    id: 'components.send.sendscreen.amountInputLabel',
    defaultMessage: '!!!Amount',
  },
  amountInputError: {
    id: 'components.send.sendscreen.amountInput.error',
    defaultMessage: '!!!Amount input error',
  },
  amountInputErrorInvalidAmount: {
    id: 'components.send.sendscreen.amountInput.error.INVALID_AMOUNT',
    defaultMessage: '!!!Please enter valid amount',
  },
  amountInputErrorTooManyDecimalPlaces: {
    id: 'components.send.sendscreen.amountInput.error.TOO_MANY_DECIMAL_PLACES',
    defaultMessage: '!!!Too many decimal places',
  },
  amountInputErrorTooLarge: {
    id: 'components.send.sendscreen.amountInput.error.TOO_LARGE',
    defaultMessage: '!!!Amount too large',
  },
  amountInputErrorTooLow: {
    id: 'components.send.sendscreen.amountInput.error.TOO_LOW',
    defaultMessage: '!!!Amount too low',
  },
  amountInputErrorInsufficientBalance: {
    id: 'components.send.sendscreen.amountInput.error.INSUFFICIENT_BALANCE',
    defaultMessage: '!!!Insufficient balance',
  },
  amountInputErrorMinPrimaryBalanceForTokens: {
    id: 'components.send.sendscreen.amountInput.error.MIN_PRIMARY_BALANCE_FOR_TOKENS',
    defaultMessage: '!!!Minimum primary balance for tokens',
  },
  memoLabel: {
    id: 'components.send.sendscreen.memoLabel',
    defaultMessage: '!!!Memo',
  },
  memoInputLabel: {
    id: 'components.send.sendscreen.memoInputLabel',
    defaultMessage: '!!!Memo',
  },
  memoInputError: {
    id: 'components.send.sendscreen.memoInput.error',
    defaultMessage: '!!!Memo input error',
  },
  memoInputErrorTooLong: {
    id: 'components.send.sendscreen.memoInput.error.TOO_LONG',
    defaultMessage: '!!!Memo too long',
  },
  memoInputErrorInvalidCharacters: {
    id: 'components.send.sendscreen.memoInput.error.INVALID_CHARACTERS',
    defaultMessage: '!!!Invalid characters in memo',
  },
  next: {
    id: 'components.send.sendscreen.next',
    defaultMessage: '!!!Next',
  },
  nfts: {
    id: 'global.nfts',
    defaultMessage: '!!! NFTs',
  },
  noAssetsAddedYet: {
    id: 'components.send.sendscreen.noAssetsAddedYet',
    defaultMessage: '!!!No assets added yet',
  },
  noBalance: {
    id: 'components.send.sendscreen.noBalance',
    defaultMessage: '!!!No balance',
  },
  ok: {
    id: 'global.ok',
    defaultMessage: '!!!OK',
  },
  pleaseWait: {
    id: 'global.pleaseWait',
    defaultMessage: '!!!please wait ...',
  },
  pools: {
    id: 'global.pools',
    defaultMessage: '!!! Dex',
  },
  sendButton: {
    id: 'components.send.sendscreen.sendButton',
    defaultMessage: '!!!Send',
  },
  sendTitle: {
    id: 'components.send.sendscreen.title',
    defaultMessage: '!!!Send',
  },
  tokens: {
    id: 'global.tokens',
    defaultMessage: '!!! Tokens',
  },
  totalLabel: {
    id: 'components.send.sendscreen.totalLabel',
    defaultMessage: '!!!Total',
  },
  manyNameServersWarning: {
    id: 'components.send.sendscreen.manyNameServersWarning',
    defaultMessage: '!!!Many name servers warning',
  },
  max: {
    id: 'global.max',
    defaultMessage: '!!!Max',
  },
  minPrimaryBalanceForTokens: {
    id: 'components.send.sendscreen.minPrimaryBalanceForTokens',
    defaultMessage: '!!!Minimum primary balance for tokens',
  },
  addressInputLabel: {
    id: 'components.send.sendscreen.addressInputLabel',
    defaultMessage: '!!!Address',
  },
  addressReaderQrText: {
    id: 'components.send.sendscreen.addressReaderQrText',
    defaultMessage: '!!!Scan QR code',
  },
  asset: {
    id: 'components.send.sendscreen.asset',
    defaultMessage: '!!!Asset',
  },
  availableFundsBannerIsFetching: {
    id: 'components.send.sendscreen.availableFundsBannerIsFetching',
    defaultMessage: '!!!Fetching available funds...',
  },
  availableFundsBannerNotAvailable: {
    id: 'components.send.sendscreen.availableFundsBannerNotAvailable',
    defaultMessage: '!!!Available funds not available',
  },
  balanceAfterLabel: {
    id: 'components.send.sendscreen.balanceAfterLabel',
    defaultMessage: '!!!Balance after',
  },
  balanceAfterNotAvailable: {
    id: 'components.send.sendscreen.balanceAfterNotAvailable',
    defaultMessage: '!!!Balance after not available',
  },
  checkboxSendAll: {
    id: 'components.send.sendscreen.checkboxSendAll',
    defaultMessage: '!!!Send all {assetId}',
  },
  checkboxSendAllAssets: {
    id: 'components.send.sendscreen.checkboxSendAllAssets',
    defaultMessage: '!!!Send all assets',
  },
  continueButton: {
    id: 'components.send.sendscreen.continueButton',
    defaultMessage: '!!!Continue',
  },
  domainNotRegisteredError: {
    id: 'components.send.sendscreen.domainNotRegisteredError',
    defaultMessage: '!!!Domain not registered',
  },
  domainRecordNotFoundError: {
    id: 'components.send.sendscreen.domainRecordNotFoundError',
    defaultMessage: '!!!Domain record not found',
  },
  domainUnsupportedError: {
    id: 'components.send.sendscreen.domainUnsupportedError',
    defaultMessage: '!!!Domain unsupported',
  },
  errorBannerNetworkError: {
    id: 'components.send.sendscreen.errorBannerNetworkError',
    defaultMessage: '!!!Network error',
  },
  errorBannerPendingOutgoingTransaction: {
    id: 'components.send.sendscreen.errorBannerPendingOutgoingTransaction',
    defaultMessage: '!!!Pending outgoing transaction',
  },
  found: {
    id: 'components.send.sendscreen.found',
    defaultMessage: '!!!Found',
  },
  helperAddressErrorInvalid: {
    id: 'components.send.sendscreen.helperAddressErrorInvalid',
    defaultMessage: '!!!Invalid address',
  },
  helperAddressErrorWrongBlockchain: {
    id: 'components.send.sendscreen.helperAddressErrorWrongBlockchain',
    defaultMessage: '!!!Wrong blockchain',
  },
  helperAddressErrorWrongNetwork: {
    id: 'components.send.sendscreen.helperAddressErrorWrongNetwork',
    defaultMessage: '!!!Wrong network',
  },
  helperMemoErrorTooLong: {
    id: 'components.send.sendscreen.helperMemoErrorTooLong',
    defaultMessage: '!!!Memo too long',
  },
  helperMemoInstructions: {
    id: 'components.send.sendscreen.helperMemoInstructions',
    defaultMessage: '!!!Memo instructions',
  },
  helperResolverErrorDomainNotFound: {
    id: 'components.send.sendscreen.helperResolverErrorDomainNotFound',
    defaultMessage: '!!!Domain not found',
  },
  noAssets: {
    id: 'components.send.sendscreen.noAssets',
    defaultMessage: '!!!No assets',
  },
  resolvedAddress: {
    id: 'components.send.sendscreen.resolvedAddress',
    defaultMessage: '!!!Resolved address',
  },
  resolverNoticeTitle: {
    id: 'components.send.sendscreen.resolverNoticeTitle',
    defaultMessage: '!!!Resolver notice',
  },
  resolverNoticeText: {
    id: 'components.send.sendscreen.resolverNoticeText',
    defaultMessage: '!!!Resolver notice text',
  },
  searchTokens: {
    id: 'components.send.sendscreen.searchTokens',
    defaultMessage: '!!!Search tokens',
  },
  selectAssetTitle: {
    id: 'components.send.sendscreen.selectAssetTitle',
    defaultMessage: '!!!Select asset',
  },
  sendAllWarningAlert1: {
    id: 'components.send.sendscreen.sendAllWarningAlert1',
    defaultMessage: '!!!Send all warning alert 1 {assetNameOrId}',
  },
  sendAllWarningAlert2: {
    id: 'components.send.sendscreen.sendAllWarningAlert2',
    defaultMessage: '!!!Send all warning alert 2',
  },
  sendAllWarningAlert3: {
    id: 'components.send.sendscreen.sendAllWarningAlert3',
    defaultMessage: '!!!Send all warning alert 3',
  },
  sendAllWarningText: {
    id: 'components.send.sendscreen.sendAllWarningText',
    defaultMessage: '!!!Send all warning text',
  },
  sendAllWarningTitle: {
    id: 'components.send.sendscreen.sendAllWarningTitle',
    defaultMessage: '!!!Send all warning title',
  },
  submittedTxButton: {
    id: 'components.send.sendscreen.submittedTxButton',
    defaultMessage: '!!!Submitted',
  },
  submittedTxText: {
    id: 'components.send.sendscreen.submittedTxText',
    defaultMessage: '!!!Transaction submitted',
  },
  submittedTxTitle: {
    id: 'components.send.sendscreen.submittedTxTitle',
    defaultMessage: '!!!Transaction submitted',
  },
  unknownAsset: {
    id: 'components.send.sendscreen.unknownAsset',
    defaultMessage: '!!!Unknown asset',
  },
  youHave: {
    id: 'components.send.sendscreen.youHave',
    defaultMessage: '!!!You have',
  },
  failedTxButton: {
    id: 'components.send.sendscreen.failedTxButton',
    defaultMessage: '!!!Failed',
  },
  failedTxText: {
    id: 'components.send.sendscreen.failedTxText',
    defaultMessage: '!!!Transaction failed',
  },
  failedTxTitle: {
    id: 'components.send.sendscreen.failedTxTitle',
    defaultMessage: '!!!Transaction failed',
  },
})
