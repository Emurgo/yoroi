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
    id: 'global.txLabels.amount',
    defaultMessage: '!!!Amount',
  },
  amountInputLabel: {
    id: 'global.txLabels.amount',
    defaultMessage: '!!!Amount',
  },
  amountInputError: {
    id: 'global.error',
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
    id: 'swap.swapScreen.balance',
    defaultMessage: '!!!Insufficient balance',
  },
  amountInputErrorMinPrimaryBalanceForTokens: {
    id: 'global.ok',
    defaultMessage: '!!!Minimum primary balance for tokens',
  },
  memoLabel: {
    id: 'components.txhistory.txdetails.memo',
    defaultMessage: '!!!Memo',
  },
  memoInputLabel: {
    id: 'components.txhistory.txdetails.memo',
    defaultMessage: '!!!Memo',
  },
  memoInputError: {
    id: 'global.error',
    defaultMessage: '!!!Memo input error',
  },
  memoInputErrorTooLong: {
    id: 'components.txhistory.txdetails.memo',
    defaultMessage: '!!!Memo too long',
  },
  memoInputErrorInvalidCharacters: {
    id: 'components.txhistory.txdetails.memo',
    defaultMessage: '!!!Invalid characters in memo',
  },
  next: {
    id: 'global.next',
    defaultMessage: '!!!Next',
  },
  nfts: {
    id: 'portfolio.portfolioDashboardScreen.nfts',
    defaultMessage: '!!! NFTs',
  },
  noAssetsAddedYet: {
    id: 'components.send.listamountstosendscreen.title',
    defaultMessage: '!!!No assets added yet',
  },
  noBalance: {
    id: 'global.actions.dialogs.logout.noButton',
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
    id: 'swap.swapScreen.dex',
    defaultMessage: '!!! Dex',
  },
  sendButton: {
    id: 'txReview.overview.sendLabel',
    defaultMessage: '!!!Send',
  },
  sendTitle: {
    id: 'components.send.sendscreen.title',
    defaultMessage: '!!!Send',
  },
  tokens: {
    id: 'txReview.walletBalanceTokens.title',
    defaultMessage: '!!! Tokens',
  },
  totalLabel: {
    id: 'swap.listOrders.total',
    defaultMessage: '!!!Total',
  },
  manyNameServersWarning: {
    id: 'components.txhistory.flawedwalletmodal.title',
    defaultMessage: '!!!Many name servers warning',
  },
  max: {
    id: 'global.max',
    defaultMessage: '!!!Max',
  },
  minPrimaryBalanceForTokens: {
    id: 'global.ok',
    defaultMessage: '!!!Minimum primary balance for tokens',
  },
  addressInputLabel: {
    id: 'components.send.sendscreen.addressInputLabel',
    defaultMessage: '!!!Address',
  },
  addressReaderQrText: {
    id: 'claim.code',
    defaultMessage: '!!!Scan QR code',
  },
  asset: {
    id: 'discover.filterOptions.parent.nft',
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
    id: 'components.send.assetselectorscreen.found',
    defaultMessage: '!!!Found',
  },
  helperAddressErrorInvalid: {
    id: 'components.send.sendscreen.addressInputLabel',
    defaultMessage: '!!!Invalid address',
  },
  helperAddressErrorWrongBlockchain: {
    id: 'send.helper.addressError.wrongBlockchain',
    defaultMessage: '!!!Wrong blockchain',
  },
  helperAddressErrorWrongNetwork: {
    id: 'claim.apiError.invalidRequest',
    defaultMessage: '!!!Wrong network',
  },
  helperMemoErrorTooLong: {
    id: 'components.txhistory.txdetails.memo',
    defaultMessage: '!!!Memo too long',
  },
  helperMemoInstructions: {
    id: 'components.txhistory.txdetails.memo',
    defaultMessage: '!!!Memo instructions',
  },
  helperResolverErrorDomainNotFound: {
    id: 'claim.domain',
    defaultMessage: '!!!Domain not found',
  },
  noAssets: {
    id: 'components.send.assetselectorscreen.noAssets',
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
    id: 'components.send.selectasset.title',
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
    id: 'components.send.assetselectorscreen.unknownAsset',
    defaultMessage: '!!!Unknown asset',
  },
  youHave: {
    id: 'components.send.assetselectorscreen.youHave',
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
