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
    clear: intl.formatMessage(messages.clear),
    selectToken: intl.formatMessage(messages.selectToken),
    marketPrice: intl.formatMessage(messages.marketPrice),
    slippageTolerance: intl.formatMessage(messages.slippageTolerance),
    slippageToleranceInfo: intl.formatMessage(messages.slippageToleranceInfo),
    swapButton: intl.formatMessage(messages.swapButton),
    verifiedBy: intl.formatMessage(messages.verifiedBy),
    assetsIn: intl.formatMessage(messages.assetsIn),
    defaultSlippage: intl.formatMessage(messages.defaultSlippage),
    slippageInfo: intl.formatMessage(messages.slippageInfo),
    enterSlippage: intl.formatMessage(messages.enterSlippage),
    pools: (qty: number) => intl.formatMessage(globalMessages.pools, {qty}),
    openOrders: intl.formatMessage(messages.openOrders),
    completedOrders: intl.formatMessage(messages.completedOrders),

    // search
    searchTokens: intl.formatMessage(messages.searchTokens),
    selecteAssetTitle: intl.formatMessage(messages.selectAssetTitle),
    tokens: (qty: number) => intl.formatMessage(globalMessages.tokens, {qty}),
    apply: intl.formatMessage(globalMessages.apply),
    found: intl.formatMessage(messages.found),
    youHave: intl.formatMessage(messages.youHave),
    assets: (qty: number) => intl.formatMessage(globalMessages.assets, {qty}),
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
  selectToken: {
    id: 'swap.swapScreen.selectToken',
    defaultMessage: '!!!Select Token',
  },
  marketPrice: {
    id: 'swap.swapScreen.marketPrice',
    defaultMessage: '!!!Market Price',
  },
  slippageTolerance: {
    id: 'swap.swapScreen.slippageTolerance',
    defaultMessage: '!!!Slippage Tolerance',
  },
  slippageToleranceInfo: {
    id: 'swap.swapScreen.slippageToleranceInfo',
    defaultMessage: '!!!Slippage Tolerance Info',
  },
  verifiedBy: {
    id: 'swap.swapScreen.verifiedBy',
    defaultMessage: '!!!Verified by MuesliSwap',
  },
  assetsIn: {
    id: 'swap.swapScreen.assetsIn',
    defaultMessage: '!!!This assets is in my portfolio',
  },
  defaultSlippage: {
    id: 'swap.swapScreen.defaultSlippage',
    defaultMessage: '!!!Default Slippage Tolerance',
  },
  slippageInfo: {
    id: 'swap.swapScreen.slippageInfo',
    defaultMessage: '!!!Slippage tolerance is set as a percentage of the total swap value.',
  },
  enterSlippage: {
    id: 'swap.swapScreen.enterSlippage',
    defaultMessage: '!!!Enter a value from 0% to 100%. You can also enter up to 1 decimal',
  },
  openOrders: {
    id: 'swap.swapScreen.openOrders',
    defaultMessage: '!!!Open orders',
  },
  completedOrders: {
    id: 'swap.swapScreen.completedOrders',
    defaultMessage: '!!!Completed orders',
  },
  asset: {
    id: 'global.assets.assetLabel',
    defaultMessage: '!!!Asset',
  },
  clear: {
    id: 'global.clear',
    defaultMessage: '!!!Clear',
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
})
