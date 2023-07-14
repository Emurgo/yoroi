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
    swapButton: intl.formatMessage(messages.swapButton),

    // search
    searchTokens: intl.formatMessage(messages.searchTokens),
    selecteAssetTitle: intl.formatMessage(messages.selectAssetTitle),
    tokens: (qty: number) => intl.formatMessage(globalMessages.tokens, {qty}),

  }
}

export const amountInputErrorMessages = defineMessages({

})

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
  clear: {
    id: 'swap.swapScreen.clear',
    defaultMessage: '!!!Clear',
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
  swapButton: {
    id: 'swap.swapScreen.swapButton',
    defaultMessage: '!!!Swap',
  },


 // TODO check this and change if necessary 
  searchTokens: {
    id: 'components.send.sendscreen.searchTokens',
    defaultMessage: '!!!Search tokens',
  },
  selectAssetTitle: {
    id: 'components.send.selectasset.title',
    defaultMessage: '!!!Select asset',
  },

})
