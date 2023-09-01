import {defineMessages, useIntl} from 'react-intl'

import globalMessages from '../../../i18n/global-messages'

export const useStrings = () => {
  const intl = useIntl()

  return {
    swapTitle: intl.formatMessage(messages.swapTitle),
    tokenSwap: intl.formatMessage(messages.tokenSwap),
    orderSwap: intl.formatMessage(messages.orderSwap),
    marketButton: intl.formatMessage(messages.marketButton),
    limitButton: intl.formatMessage(messages.limitButton),
    swapFrom: intl.formatMessage(messages.swapFrom),
    swapTo: intl.formatMessage(messages.swapTo),
    currentBalance: intl.formatMessage(messages.currentBalance),
    balance: intl.formatMessage(messages.balance),
    clear: intl.formatMessage(messages.clear),
    selectToken: intl.formatMessage(messages.selectToken),
    marketPrice: intl.formatMessage(messages.marketPrice),
    limitPrice: intl.formatMessage(messages.limitPrice),
    slippageTolerance: intl.formatMessage(messages.slippageTolerance),
    slippageToleranceInfo: intl.formatMessage(messages.slippageToleranceInfo),
    swapButton: intl.formatMessage(messages.swapButton),
    verifiedBy: (pool: string) => intl.formatMessage(messages.verifiedBy, {pool}),
    assetsIn: intl.formatMessage(messages.assetsIn),
    defaultSlippage: intl.formatMessage(messages.defaultSlippage),
    slippageInfo: intl.formatMessage(messages.slippageInfo),
    swapMinAda: intl.formatMessage(messages.swapMinAda),
    swapMinAdaTitle: intl.formatMessage(messages.swapMinAdaTitle),
    swapMinReceived: intl.formatMessage(messages.swapMinReceived),
    swapMinReceivedTitle: intl.formatMessage(messages.swapMinReceivedTitle),
    swapFeesTitle: intl.formatMessage(messages.swapFeesTitle),
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
    completedOrders: intl.formatMessage(messages.completedOrders),
    signTransaction: intl.formatMessage(messages.signTransaction),
    enterSpendingPassword: intl.formatMessage(messages.enterSpendingPassword),
    spendingPassword: intl.formatMessage(messages.spendingPassword),
    sign: intl.formatMessage(messages.sign),
    searchTokens: intl.formatMessage(messages.searchTokens),
    confirm: intl.formatMessage(messages.confirm),
    selecteAssetTitle: intl.formatMessage(messages.selectAssetTitle),
    tokens: (qty: number) => intl.formatMessage(globalMessages.tokens, {qty}),
    apply: intl.formatMessage(globalMessages.apply),
    found: intl.formatMessage(messages.found),
    youHave: intl.formatMessage(messages.youHave),
    price: intl.formatMessage(messages.price),
    tvl: intl.formatMessage(messages.tvl),
    poolFee: intl.formatMessage(messages.poolFee),
    batcherFee: intl.formatMessage(messages.batcherFee),
    assets: (qty: number) => intl.formatMessage(globalMessages.assets, {qty}),
    asset: intl.formatMessage(messages.asset),
    volume: intl.formatMessage(messages.volume),
    total: intl.formatMessage(globalMessages.total),
  }
}

export const amountInputErrorMessages = defineMessages({})

export const messages = defineMessages({
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
    defaultMessage: '!!!Slippage must be a number between 0 and 100 and have up to 1 decimal',
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
  defaultSlippage: {
    id: 'swap.swapScreen.defaultSlippage',
    defaultMessage: '!!!Default Slippage Tolerance',
  },
  slippageInfo: {
    id: 'swap.swapScreen.slippageInfo',
    defaultMessage: '!!!Slippage tolerance is set as a percentage of the total swap value.',
  },
  swapMinAda: {
    id: 'swap.swapScreen.swapMinAda',
    defaultMessage:
      '!!!Min-ADA is the minimum ADA amount required to be contained when holding or sending Cardano native tokens.',
  },
  swapMinAdaTitle: {
    id: 'swap.swapScreen.swapMinAdaTitle',
    defaultMessage: '!!!Min ADA',
  },
  swapFees: {
    id: 'swap.swapScreen.swapFees',
    defaultMessage: `!!!Swap fees include the following:\n • Matchmaker Fee\n • Frontend Fee\n • Liquidity Provider Fee`,
  },
  swapFeesTitle: {
    id: 'swap.swapScreen.swapFeesTitle',
    defaultMessage: `!!!Fee`,
  },
  swapMinReceived: {
    id: 'swap.swapScreen.swapMinReceived',
    defaultMessage: '!!!Minimum amount of tokens you can get because of the slippage tolerance.',
  },
  swapMinReceivedTitle: {
    id: 'swap.swapScreen.swapMinReceivedTitle',
    defaultMessage: '!!!Min Received',
  },
  enterSlippage: {
    id: 'swap.swapScreen.enterSlippage',
    defaultMessage: '!!!Enter a value from 0% to 100%. You can also enter up to 1 decimal',
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
    defaultMessage: '!!! Pool Fee',
  },
  batcherFee: {
    id: 'swap.swapScreen.batcherFee',
    defaultMessage: '!!! Batcher Fee',
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
})
