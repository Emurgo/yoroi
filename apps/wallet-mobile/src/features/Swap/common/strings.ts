import {defineMessages, useIntl} from 'react-intl'

import globalMessages, {errorMessages, ledgerMessages} from '../../../kernel/i18n/global-messages'

export const useStrings = () => {
  const intl = useIntl()

  return {
    swapTitle: intl.formatMessage(messages.swapTitle),
    tokenSwap: intl.formatMessage(messages.tokenSwap),
    orderSwap: intl.formatMessage(messages.orderSwap),
    dex: intl.formatMessage(messages.dex),
    marketButton: intl.formatMessage(messages.marketButton),
    limitButton: intl.formatMessage(messages.limitButton),
    swapFrom: intl.formatMessage(messages.swapFrom),
    swapTo: intl.formatMessage(messages.swapTo),
    currentBalance: intl.formatMessage(messages.currentBalance),
    balance: intl.formatMessage(messages.balance),
    clear: intl.formatMessage(messages.clear),
    selectToken: intl.formatMessage(messages.selectToken),
    marketPrice: intl.formatMessage(messages.marketPrice),
    marketPriceInfo: intl.formatMessage(messages.marketPriceInfo),
    limitPriceInfo: intl.formatMessage(messages.limitPriceInfo),
    limitPrice: intl.formatMessage(messages.limitPrice),
    slippageTolerance: intl.formatMessage(messages.slippageTolerance),
    slippageToleranceInfo: intl.formatMessage(messages.slippageToleranceInfo),
    swapButton: intl.formatMessage(messages.swapButton),
    verifiedBy: (pool: string) => intl.formatMessage(messages.verifiedBy, {pool}),
    assetsIn: intl.formatMessage(messages.assetsIn),
    slippageInfo: intl.formatMessage(messages.slippageInfo),
    autoPool: intl.formatMessage(messages.autoPool),
    changePool: intl.formatMessage(messages.changePool),
    swapMinAda: intl.formatMessage(messages.swapMinAda),
    swapMinAdaTitle: intl.formatMessage(messages.swapMinAdaTitle),
    swapMinReceived: intl.formatMessage(messages.swapMinReceived),
    swapMinReceivedTitle: intl.formatMessage(messages.swapMinReceivedTitle),
    swapFeesTitle: intl.formatMessage(messages.swapFeesTitle),
    swapLiquidityFee: intl.formatMessage(messages.swapLiquidityFee),
    swapLiqProvFee: intl.formatMessage(messages.swapLiqProvFee),
    swapLiquidityFeeInfo: (fee: string, options: {b: (content: React.ReactNode[]) => React.ReactNode}) =>
      intl.formatMessage(messages.swapLiquidityFeeInfo, {fee, ...options}),
    swapFees: intl.formatMessage(messages.swapFees),
    poolVerification: (pool: string) => intl.formatMessage(messages.poolVerification, {pool}),
    poolVerificationInfo: (pool: string) => intl.formatMessage(messages.poolVerificationInfo, {pool}),
    eachVerifiedToken: intl.formatMessage(messages.eachVerifiedToken),
    verifiedBadge: intl.formatMessage(messages.verifiedBadge),
    enterSlippage: intl.formatMessage(messages.enterSlippage),
    slippageToleranceError: intl.formatMessage(messages.slippageToleranceError),
    pools: (qty: number) => intl.formatMessage(globalMessages.pools, {qty}),
    openOrders: intl.formatMessage(messages.openOrders),
    noAssetsFound: intl.formatMessage(messages.noAssetsFound),
    noAssetsFoundFor: (search: string) => intl.formatMessage(messages.noAssetsFoundFor, {search}),
    completedOrders: intl.formatMessage(messages.completedOrders),
    signTransaction: intl.formatMessage(messages.signTransaction),
    enterSpendingPassword: intl.formatMessage(messages.enterSpendingPassword),
    spendingPassword: intl.formatMessage(messages.spendingPassword),
    sign: intl.formatMessage(messages.sign),
    searchTokens: intl.formatMessage(messages.searchTokens),
    confirm: intl.formatMessage(messages.confirm),
    chooseConnectionMethod: intl.formatMessage(messages.chooseConnectionMethod),
    selecteAssetTitle: intl.formatMessage(messages.selectAssetTitle),
    tokens: (qty: number) => intl.formatMessage(globalMessages.tokens, {qty}),
    apply: intl.formatMessage(globalMessages.apply),
    found: intl.formatMessage(messages.found),
    youHave: intl.formatMessage(messages.youHave),
    price: intl.formatMessage(messages.price),
    priceImpact: intl.formatMessage(messages.priceImpact),
    priceImpactRiskHigh: ({riskValue}: {riskValue: number}) =>
      intl.formatMessage(messages.priceImpactRiskHigh, {
        riskValue,
      }),
    priceImpactDescription: (risk: 'moderate' | 'high') =>
      intl.formatMessage(
        risk === 'moderate' ? messages.priceImpactModerateDescription : messages.priceImpactHighDescription,
      ),
    priceImpactInfo: intl.formatMessage(messages.priceImpactInfo),
    tvl: intl.formatMessage(messages.tvl),
    poolFee: intl.formatMessage(messages.poolFee),
    batcherFee: intl.formatMessage(messages.batcherFee),
    assets: (qty: number) => intl.formatMessage(globalMessages.assets, {qty}),
    available: intl.formatMessage(globalMessages.available),
    asset: intl.formatMessage(messages.asset),
    volume: intl.formatMessage(messages.volume),
    total: intl.formatMessage(globalMessages.total),
    listCompletedOrders: intl.formatMessage(messages.listCompletedOrders),
    listOpenOrders: intl.formatMessage(messages.listOpenOrders),
    listOrdersSheetTitle: intl.formatMessage(messages.listOrdersSheetTitle),
    listOrdersSheetButtonText: intl.formatMessage(messages.listOrdersSheetButtonText),
    listOrdersSheetContentTitle: intl.formatMessage(messages.listOrdersSheetContentTitle),
    listOrdersSheetLink: intl.formatMessage(messages.listOrdersSheetLink),
    listOrdersSheetAssetPrice: intl.formatMessage(messages.listOrdersSheetAssetPrice),
    listOrdersSheetAssetAmount: intl.formatMessage(messages.listOrdersSheetAssetAmount),
    listOrdersSheetTotalReturned: intl.formatMessage(messages.listOrdersSheetTotalReturned),
    listOrdersSheetCancellationFee: intl.formatMessage(messages.listOrdersSheetCancellationFee),
    listOrdersSheetConfirm: intl.formatMessage(messages.listOrdersSheetConfirm),
    listOrdersSheetBack: intl.formatMessage(messages.listOrdersSheetBack),
    listOrdersTimeCreated: intl.formatMessage(messages.listOrdersTimeCreated),
    listOrdersTimeCompleted: intl.formatMessage(messages.listOrdersTimeCompleted),
    listOrdersLiquidityPool: intl.formatMessage(messages.listOrdersLiquidityPool),
    listOrdersTotal: intl.formatMessage(messages.listOrdersTotal),
    listOrdersTxId: intl.formatMessage(messages.listOrdersTxId),
    limitPriceWarningTitle: intl.formatMessage(messages.limitPriceWarningTitle),
    limitPriceWarningDescription: intl.formatMessage(messages.limitPriceWarningDescription),
    limitPriceWarningYourPrice: intl.formatMessage(messages.limitPriceWarningYourPrice),
    limitPriceWarningMarketPrice: intl.formatMessage(messages.limitPriceWarningMarketPrice),
    limitPriceWarningBack: intl.formatMessage(messages.limitPriceWarningBack),
    limitPriceWarningConfirm: intl.formatMessage(messages.limitPriceWarningConfirm),
    error: intl.formatMessage(globalMessages.error),
    rejectedByUser: intl.formatMessage(ledgerMessages.rejectedByUserError),
    usbExplanation: intl.formatMessage(messages.usbExplanation),
    usbButton: intl.formatMessage(messages.usbButton),
    usbConnectionIsBlocked: intl.formatMessage(messages.usbConnectionIsBlocked),
    bluetoothExplanation: intl.formatMessage(messages.bluetoothExplanation),
    bluetoothButton: intl.formatMessage(messages.bluetoothButton),
    bluetoothError: intl.formatMessage(messages.bluetoothError),
    transactionSigned: intl.formatMessage(messages.transactionSigned),
    transactionDisplay: intl.formatMessage(messages.transactionDisplay),
    seeOnExplorer: intl.formatMessage(messages.seeOnExplorer),
    goToTransactions: intl.formatMessage(messages.goToTransactions),
    wrongPasswordMessage: intl.formatMessage(messages.wrongPasswordMessage),
    assignCollateral: intl.formatMessage(messages.assignCollateral),
    collateralNotFound: intl.formatMessage(messages.collateralNotFound),
    noActiveCollateral: intl.formatMessage(messages.noActiveCollateral),
    collateralTxPending: intl.formatMessage(messages.collateralTxPending),
    collateralTxPendingTitle: intl.formatMessage(messages.collateralTxPendingTitle),
    failedTxTitle: intl.formatMessage(messages.failedTxTitle),
    failedTxText: intl.formatMessage(messages.failedTxText),
    failedTxButton: intl.formatMessage(messages.failedTxButton),
    generalTxErrorMessage: intl.formatMessage(errorMessages.generalTxError.message),
    incorrectPasswordTitle: intl.formatMessage(errorMessages.incorrectPassword.title),
    incorrectPasswordMessage: intl.formatMessage(errorMessages.incorrectPassword.message),
    notEnoughBalance: intl.formatMessage(messages.notEnoughBalance),
    notEnoughSupply: intl.formatMessage(messages.notEnoughSupply),
    notEnoughFeeBalance: intl.formatMessage(messages.notEnoughFeeBalance),
    noPool: intl.formatMessage(messages.noPool),
    generalErrorTitle: intl.formatMessage(errorMessages.generalError.title),
    generalErrorMessage: (e: string) => intl.formatMessage(errorMessages.generalError.message, {message: e}),
    continueOnLedger: intl.formatMessage(ledgerMessages.continueOnLedger),
    continue: intl.formatMessage(messages.continue),
    cancel: intl.formatMessage(globalMessages.cancel),
    tryAgain: intl.formatMessage(globalMessages.tryAgain),
    bluetoothDisabledError: intl.formatMessage(ledgerMessages.bluetoothDisabledError),
    ledgerBluetoothDisabledError: intl.formatMessage(ledgerMessages.bluetoothDisabledError),
    ledgerGeneralConnectionError: intl.formatMessage(ledgerMessages.connectionError),
    ledgerUserError: intl.formatMessage(ledgerMessages.connectionError),
    ledgerAdaAppNeedsToBeOpenError: intl.formatMessage(ledgerMessages.appOpened),
    slippageWarningTitle: intl.formatMessage(messages.slippageWarningTitle),
    slippageWarningText: intl.formatMessage(messages.slippageWarningText),
    slippageWarningYourSlippage: intl.formatMessage(messages.slippageWarningYourSlippage),
    slippageWarningChangeAmount: intl.formatMessage(messages.slippageWarningChangeAmount),
    serviceUnavailable: intl.formatMessage(messages.serviceUnavailable),
    serviceUnavailableInfo: intl.formatMessage(messages.serviceUnavailableInfo),
    emptyOpenOrders: intl.formatMessage(messages.emptyOpenOrders),
    emptyOpenOrdersSub: intl.formatMessage(messages.emptyOpenOrdersSub),
    emptyCompletedOrders: intl.formatMessage(messages.emptyCompletedOrders),
    emptySearchCompletedOrders: intl.formatMessage(messages.emptySearchCompletedOrders),
    emptySearchOpenOrders: intl.formatMessage(messages.emptySearchOpenOrders),
    warning: intl.formatMessage(messages.warning),
    missingCollateral: intl.formatMessage(errorMessages.missingCollateral.title),
    backToSwapOrders: intl.formatMessage(messages.backToSwapOrders),
    preprodNoticeTitle: intl.formatMessage(messages.preprodNoticeTitle),
    preprodNoticeText: intl.formatMessage(messages.preprodNoticeText),
    sanchoNoticeTitle: intl.formatMessage(messages.sanchoNoticeTitle),
    sanchoNoticeText: intl.formatMessage(messages.sanchoNoticeText),
  }
}

const messages = defineMessages({
  swapFees: {
    id: 'swap.swapScreen.swapFees',
    defaultMessage: `!!!Swap fees include the following:\n • Matchmaker Fee\n • Frontend Fee\n • Liquidity Provider Fee`,
  },
  wrongPasswordMessage: {
    id: 'global.actions.dialogs.incorrectPassword.title',
    defaultMessage: '!!!Incorrect password.',
  },
  swapTitle: {
    id: 'swap.swapScreen.swapTitle',
    defaultMessage: '!!!Swap',
  },
  tokenSwap: {
    id: 'swap.swapScreen.tokenSwapTab',
    defaultMessage: '!!!Token swap',
  },
  orderSwap: {
    id: 'swap.swapScreen.ordersSwapTab',
    defaultMessage: '!!!Orders',
  },
  marketButton: {
    id: 'swap.swapScreen.marketButton',
    defaultMessage: '!!!Market Button',
  },
  limitButton: {
    id: 'swap.swapScreen.limitButton',
    defaultMessage: '!!!Limit',
  },
  swapFrom: {
    id: 'swap.swapScreen.swapFrom',
    defaultMessage: '!!!Swap from',
  },
  swapTo: {
    id: 'swap.swapScreen.swapTo',
    defaultMessage: '!!!Swap to',
  },
  currentBalance: {
    id: 'swap.swapScreen.currentBalance',
    defaultMessage: '!!!Current Balance',
  },
  balance: {
    id: 'swap.swapScreen.balance',
    defaultMessage: '!!!Balance',
  },
  selectToken: {
    id: 'swap.swapScreen.selectToken',
    defaultMessage: '!!!Select Token',
  },
  marketPrice: {
    id: 'swap.swapScreen.marketPrice',
    defaultMessage: '!!!Market Price',
  },
  marketPriceInfo: {
    id: 'swap.swapScreen.marketPriceInfo',
    defaultMessage:
      '!!!Market price is the best price available on the market among several DEXes that lets you buy or sell an asset instantly.',
  },
  limitPriceInfo: {
    id: 'swap.swapScreen.limitPriceInfo',
    defaultMessage:
      "!!!Limit price in a DEX is a specific pre-set price at which you can trade an asset. Unlike market orders, which execute immediately at the current market price, limit orders are set to execute only when the market reaches the trader's specified price.",
  },
  limitPrice: {
    id: 'swap.swapScreen.limitPrice',
    defaultMessage: '!!!Limit Price',
  },
  slippageTolerance: {
    id: 'swap.swapScreen.slippageTolerance',
    defaultMessage: '!!!Slippage Tolerance',
  },
  slippageToleranceError: {
    id: 'swap.swapScreen.slippageToleranceError',
    defaultMessage: '!!!Slippage must be a number between 0 and 75 and have up to 1 decimal',
  },
  slippageToleranceInfo: {
    id: 'swap.swapScreen.slippageToleranceInfo',
    defaultMessage: '!!!Slippage Tolerance Info',
  },
  verifiedBy: {
    id: 'swap.swapScreen.verifiedBy',
    defaultMessage: '!!!Verified by {pool}',
  },
  assetsIn: {
    id: 'swap.swapScreen.assetsIn',
    defaultMessage: '!!!This asset is in my portfolio',
  },
  slippageInfo: {
    id: 'swap.swapScreen.slippageInfo',
    defaultMessage: '!!!Slippage tolerance is set as a percentage of the total swap value.',
  },
  autoPool: {
    id: 'swap.swapScreen.autoPool',
    defaultMessage: '!!!(auto)',
  },
  changePool: {
    id: 'swap.swapScreen.changePool',
    defaultMessage: '!!!change dex',
  },
  swapMinAda: {
    id: 'swap.swapScreen.swapMinAda',
    defaultMessage:
      '!!!Min-ADA is the minimum ADA amount required to be contained when holding or sending Cardano native assets.',
  },
  swapMinAdaTitle: {
    id: 'swap.swapScreen.swapMinAdaTitle',
    defaultMessage: '!!!Min ADA',
  },
  preprodNoticeTitle: {
    id: 'swap.swapScreen.preprodNoticeTitle',
    defaultMessage: `!!!Swap is not available on testnet`,
  },
  preprodNoticeText: {
    id: 'swap.swapScreen.preprodNoticeText',
    defaultMessage: `!!!Switch to mainnet if you want to use the feature and swap real tokens`,
  },
  sanchoNoticeTitle: {
    id: 'swap.swapScreen.sanchoNoticeTitle',
    defaultMessage: `!!!Swap is not available on sanchonet`,
  },
  sanchoNoticeText: {
    id: 'swap.swapScreen.sanchoNoticeText',
    defaultMessage: `!!!Switch to mainnet if you want to use the feature and swap real tokens`,
  },
  swapFeesTitle: {
    id: 'swap.swapScreen.swapFeesTitle',
    defaultMessage: `!!!Fees`,
  },
  swapLiquidityFee: {
    id: 'swap.swapScreen.swapLiquidityFee',
    defaultMessage: '!!!Liquidity provider fee',
  },
  swapLiqProvFee: {
    id: 'swap.swapScreen.swapLiqProvFee',
    defaultMessage: '!!!Liq. prov. fee',
  },
  swapLiquidityFeeInfo: {
    id: 'swap.swapScreen.swapLiquidityFeeInfo',
    defaultMessage:
      '!!!Liquidity provider fee is a fixed <b>{fee}%</b> operational fee from the whole transaction volume, that is taken to support DEX “liquidity” allowing traders to buy and sell assets on the decentralized Cardano network.',
  },
  swapMinReceived: {
    id: 'swap.swapScreen.swapMinReceived',
    defaultMessage: '!!!Minimum amount of assets you can get because of the slippage tolerance.',
  },
  swapMinReceivedTitle: {
    id: 'swap.swapScreen.swapMinReceivedTitle',
    defaultMessage: '!!!Min Received',
  },
  enterSlippage: {
    id: 'swap.swapScreen.enterSlippage',
    defaultMessage: '!!!Enter a value from 0% to 75%. You can also enter up to 1 decimal',
  },
  poolVerification: {
    id: 'swap.swapScreen.poolVerification',
    defaultMessage: '!!!{pool} verification',
  },
  volume: {
    id: 'swap.swapScreen.volume',
    defaultMessage: '!!!Volume, 24h',
  },
  poolVerificationInfo: {
    id: 'swap.swapScreen.poolVerificationInfo',
    defaultMessage:
      '!!!Cardano projects that list their own tokens can apply for an additional {pool} verification. This verification is a manual validation that {pool} team performs with the help of Cardano Foundation.',
  },
  price: {
    id: 'global.price',
    defaultMessage: '!!! Price',
  },
  noAssetsFound: {
    id: 'swap.swapScreen.noAssetsFound',
    defaultMessage: '!!!No assets found for this pair',
  },
  noAssetsFoundFor: {
    id: 'swap.swapScreen.noAssetsFoundFor',
    defaultMessage: '!!!No assets found for "{search}"',
  },
  eachVerifiedToken: {
    id: 'swap.swapScreen.eachVerifiedToken',
    defaultMessage: '!!!Each verified tokens gets',
  },
  verifiedBadge: {
    id: 'swap.swapScreen.verifiedBadge',
    defaultMessage: '!!!verified badge',
  },
  openOrders: {
    id: 'swap.swapScreen.openOrders',
    defaultMessage: '!!!Open orders',
  },
  completedOrders: {
    id: 'swap.swapScreen.completedOrders',
    defaultMessage: '!!!Completed orders',
  },
  tvl: {
    id: 'swap.swapScreen.tvl',
    defaultMessage: '!!!TVL',
  },
  poolFee: {
    id: 'swap.swapScreen.poolFee',
    defaultMessage: '!!! Dex Fee',
  },
  batcherFee: {
    id: 'swap.swapScreen.batcherFee',
    defaultMessage: '!!! Batcher Fee',
  },
  limitPriceWarningTitle: {
    id: 'swap.swapScreen.limitPriceWarningTitle',
    defaultMessage: '!!!Limit price',
  },
  limitPriceWarningDescription: {
    id: 'swap.swapScreen.limitPriceWarningDescription',
    defaultMessage:
      '!!!Are you sure you want to proceed this order with the limit price that is 10% or more higher than the\n' +
      'market price?',
  },
  limitPriceWarningYourPrice: {
    id: 'swap.swapScreen.limitPriceWarningYourPrice',
    defaultMessage: '!!!Your limit price',
  },
  limitPriceWarningMarketPrice: {
    id: 'swap.swapScreen.limitPriceWarningMarketPrice',
    defaultMessage: '!!!Market price',
  },
  limitPriceWarningBack: {
    id: 'swap.swapScreen.limitPriceWarningBack',
    defaultMessage: '!!!Back',
  },
  limitPriceWarningConfirm: {
    id: 'swap.swapScreen.limitPriceWarningConfirm',
    defaultMessage: '!!!Swap',
  },
  transactionSigned: {
    id: 'swap.swapScreen.transactionSigned',
    defaultMessage: '!!!Transaction submitted',
  },
  transactionDisplay: {
    id: 'swap.swapScreen.transactionDisplay',
    defaultMessage: '!!!Your transactions will be displayed both in the list of transaction and Open swap orders',
  },
  dex: {
    id: 'swap.swapScreen.dex',
    defaultMessage: '!!! dex',
  },
  seeOnExplorer: {
    id: 'swap.swapScreen.seeOnExplorer',
    defaultMessage: '!!!see on explorer',
  },
  asset: {
    id: 'global.assets.assetLabel',
    defaultMessage: '!!!Asset',
  },
  clear: {
    id: 'global.clear',
    defaultMessage: '!!!Clear',
  },
  signTransaction: {
    id: 'global.signTransaction',
    defaultMessage: '!!!Sign transaction',
  },
  spendingPassword: {
    id: 'global.spendingPassword',
    defaultMessage: '!!!Spending Password',
  },
  enterSpendingPassword: {
    id: 'global.enterSpendingPassword',
    defaultMessage: '!!!Enter spending password to sign this transaction',
  },
  sign: {
    id: 'global.sign',
    defaultMessage: '!!!Sign',
  },
  swapButton: {
    id: 'global.swap',
    defaultMessage: '!!!Swap',
  },
  listCompletedOrders: {
    id: 'swap.listOrders.completed',
    defaultMessage: '!!!completed orders',
  },
  listOpenOrders: {
    id: 'swap.listOrders.open',
    defaultMessage: '!!!open orders',
  },
  listOrdersSheetTitle: {
    id: 'swap.listOrders.sheet.title',
    defaultMessage: '!!!Confirm order cancellation',
  },
  listOrdersSheetButtonText: {
    id: 'swap.listOrders.card.buttonText',
    defaultMessage: '!!!Cancel order',
  },
  listOrdersSheetContentTitle: {
    id: 'swap.listOrders.sheet.contentTitle',
    defaultMessage: '!!!Are you sure you want to cancel this order?',
  },
  listOrdersSheetLink: {
    id: 'swap.listOrders.sheet.link',
    defaultMessage: '!!!Learn more about swap orders in Yoroi',
  },
  listOrdersSheetAssetPrice: {
    id: 'swap.listOrders.sheet.assetPrice',
    defaultMessage: '!!!Asset price',
  },
  listOrdersSheetAssetAmount: {
    id: 'swap.listOrders.sheet.assetAmount',
    defaultMessage: '!!!Asset amount',
  },
  listOrdersSheetTotalReturned: {
    id: 'swap.listOrders.sheet.totalReturned',
    defaultMessage: '!!!Total returned',
  },
  listOrdersSheetCancellationFee: {
    id: 'swap.listOrders.sheet.cancellationFee',
    defaultMessage: '!!!Cancellation Fee',
  },
  listOrdersSheetConfirm: {
    id: 'swap.listOrders.sheet.confirm',
    defaultMessage: '!!!Confirm',
  },
  listOrdersSheetBack: {
    id: 'swap.listOrders.sheet.back',
    defaultMessage: '!!!Back',
  },
  listOrdersTotal: {
    id: 'swap.listOrders.total',
    defaultMessage: '!!!Total',
  },
  listOrdersLiquidityPool: {
    id: 'swap.listOrders.liquidityPool',
    defaultMessage: '!!!Liquidity Pool',
  },
  listOrdersTimeCreated: {
    id: 'swap.listOrders.timeCreated',
    defaultMessage: '!!!Time Created',
  },
  listOrdersTimeCompleted: {
    id: 'swap.listOrders.timeCompleted',
    defaultMessage: '!!!Time Completed',
  },
  listOrdersTxId: {
    id: 'swap.listOrders.txId',
    defaultMessage: '!!!Transaction ID',
  },
  chooseConnectionMethod: {
    id: 'components.ledger.ledgertransportswitchmodal.title',
    defaultMessage: '!!!Choose Connection Method',
  },
  usbExplanation: {
    id: 'components.ledger.ledgertransportswitchmodal.usbExplanation',
    defaultMessage:
      '!!!Choose this option if you want to connect to a Ledger Nano model X ' +
      'or S using an on-the-go USB cable adaptor:',
  },
  usbButton: {
    id: 'components.ledger.ledgertransportswitchmodal.usbButton',
    defaultMessage: '!!!Connect with USB',
  },
  usbConnectionIsBlocked: {
    id: 'components.ledger.ledgertransportswitchmodal.usbConnectionIsBlocked',
    defaultMessage: '!!! USB connection is blocked by iOS devices',
  },
  bluetoothExplanation: {
    id: 'components.ledger.ledgertransportswitchmodal.bluetoothExplanation',
    defaultMessage: '!!!Choose this option if you want to connect to a Ledger Nano model X through Bluetooth:',
  },
  bluetoothButton: {
    id: 'components.ledger.ledgertransportswitchmodal.bluetoothButton',
    defaultMessage: '!!!Connect with Bluetooth',
  },
  bluetoothError: {
    id: 'global.ledgerMessages.bluetoothDisabledError',
    defaultMessage: '!!!Connect with Bluetooth',
  },
  serviceUnavailable: {
    id: 'global.error.serviceUnavailable',
    defaultMessage: '!!!Service unavailable',
  },
  serviceUnavailableInfo: {
    id: 'global.error.serviceUnavailableInfo',
    defaultMessage: '!!!The server is temporarily busy due to maintenance downtime or capacity problems',
  },
  goToTransactions: {
    id: 'components.send.sendscreen.submittedTxButton',
    defaultMessage: '!!!GO TO transactions',
  },
  // TODO check this and change if necessary

  youHave: {
    id: 'components.send.assetselectorscreen.youHave',
    defaultMessage: '!!!You have',
  },
  noAssets: {
    id: 'components.send.assetselectorscreen.noAssets',
    defaultMessage: '!!!No assets found',
  },
  found: {
    id: 'components.send.assetselectorscreen.found',
    defaultMessage: '!!!found',
  },
  searchTokens: {
    id: 'components.send.sendscreen.searchTokens',
    defaultMessage: '!!!Search tokens',
  },
  selectAssetTitle: {
    id: 'components.send.selectasset.title',
    defaultMessage: '!!!Select asset',
  },
  confirm: {
    id: 'components.send.confirmscreen.confirmButton',
    defaultMessage: '!!!Confirm',
  },
  assignCollateral: {
    id: 'components.send.confirmscreen.assignCollateral',
    defaultMessage: '!!!Generate',
  },
  collateralNotFound: {
    id: 'components.send.confirmscreen.collateralNotFound',
    defaultMessage: '!!!Collateral not found',
  },
  noActiveCollateral: {
    id: 'components.send.confirmscreen.noActiveCollateral',
    defaultMessage: '!!!To continue with this action, you need to generate a collateral',
  },
  collateralTxPendingTitle: {
    id: 'components.send.confirmscreen.collateralTxPendingTitle',
    defaultMessage: '!!!Pending Collateral UTxO',
  },
  collateralTxPending: {
    id: 'components.send.confirmscreen.collateralTxPending',
    defaultMessage:
      "!!!The collateral UTxO transaction you've submitted is currently in the processing stage, and it may require a few minutes to complete. Please refresh your interface and attempt the action again shortly",
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
  notEnoughBalance: {
    id: 'swap.swapScreen.notEnoughBalance',
    defaultMessage: '!!!Not enough balance',
  },
  notEnoughSupply: {
    id: 'swap.swapScreen.notEnoughSupply',
    defaultMessage: '!!!Not enough supply in the pool',
  },
  notEnoughFeeBalance: {
    id: 'swap.swapScreen.notEnoughFeeBalance',
    defaultMessage: '!!!Not enough balance, please consider the fees',
  },
  noPool: {
    id: 'swap.swapScreen.noPool',
    defaultMessage: '!!! This pair is not available in any liquidity pool',
  },
  continueOnLedger: {
    id: 'global.ledgerMessages.continueOnLedger',
    defaultMessage: '!!!Continue on Ledger',
  },
  continue: {
    id: 'global.actions.dialogs.commonbuttons.continueButton',
    defaultMessage: '!!!Continue',
  },
  slippageWarningTitle: {
    id: 'swap.slippage.slippageWarningTitle',
    defaultMessage: '!!!Slippage Warning',
  },
  slippageWarningText: {
    id: 'swap.slippage.slippageWarningText',
    defaultMessage:
      '!!!Are you sure you want to proceed this order with the current slippage tolerance? It could result in receiving no assets.',
  },
  slippageWarningYourSlippage: {
    id: 'swap.slippage.yourSlippage',
    defaultMessage: '!!!Your slippage tolerance',
  },
  slippageWarningChangeAmount: {
    id: 'swap.slippage.changeAmount',
    defaultMessage: '!!!Increase the amount to proceed or change slippage tolerance to 0%',
  },
  emptyOpenOrders: {
    id: 'swap.listOrders.emptyOpenOrders',
    defaultMessage: '!!!No orders available yet',
  },
  emptyOpenOrdersSub: {
    id: 'swap.listOrders.emptyOpenOrdersSub',
    defaultMessage: '!!!Start doing SWAP to see your open orders here',
  },
  emptyCompletedOrders: {
    id: 'swap.listOrders.emptyCompletedOrders',
    defaultMessage: '!!!No orders completed yet',
  },
  emptySearchCompletedOrders: {
    id: 'swap.listOrders.emptySearchCompletedOrders',
    defaultMessage: '!!!No orders found for',
  },
  emptySearchOpenOrders: {
    id: 'swap.listOrders.emptySearchOpenOrders',
    defaultMessage: '!!!No orders found for',
  },
  priceImpact: {
    id: 'swap.swapScreen.priceImpact',
    defaultMessage: '!!!Price Impact',
  },
  priceImpactRiskHigh: {
    id: 'swap.swapScreen.priceImpactRiskHigh',
    defaultMessage: '!!!Price impact over {riskValue}%',
  },
  priceImpactHighDescription: {
    id: 'swap.swapScreen.priceImpactHighDescription',
    defaultMessage:
      '!!!may cause a significant loss of funds. Please bear this in mind and proceed with an extra caution.',
  },
  priceImpactModerateDescription: {
    id: 'swap.swapScreen.priceImpactModerateDescription',
    defaultMessage: '!!!may cause a difference in the amount you actually receive. Consider this at your own risk.',
  },
  priceImpactInfo: {
    id: 'swap.swapScreen.priceImpactInfo',
    defaultMessage: '!!!Price impact is a difference between the actual market price and your price due to trade size.',
  },
  warning: {
    id: 'components.txhistory.flawedwalletmodal.title',
    defaultMessage: '!!Warning',
  },
  backToSwapOrders: {
    id: 'swap.swapScreen.backToSwapOrders',
    defaultMessage: '!!!Back to swap orders',
  },
})
