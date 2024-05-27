import {defineMessages, useIntl} from 'react-intl'

export const useStrings = () => {
  const intl = useIntl()

  return {
    portfolio: intl.formatMessage(messages.portfolio),
    totalWalletValue: intl.formatMessage(messages.totalWalletValue),
    tokens: (qty: number) => intl.formatMessage(messages.tokens, {countTokens: qty}),
    buyADATitle: intl.formatMessage(messages.buyADATitle),
    buyADADescription: intl.formatMessage(messages.buyADADescription),
    buyCrypto: intl.formatMessage(messages.buyCrypto),
    tradeTokens: intl.formatMessage(messages.tradeTokens),
    swap: intl.formatMessage(messages.swap),
    nfts: (qty: number) => intl.formatMessage(messages.nfts, {countNfts: qty}),
    tokenList: intl.formatMessage(messages.tokenList),
    walletToken: intl.formatMessage(messages.walletToken),
    dappsToken: intl.formatMessage(messages.dappsToken),
    tokensAvailable: (qty: number) => intl.formatMessage(messages.tokensAvailable, {countTokens: qty}),
    searchTokens: intl.formatMessage(messages.searchTokens),
    noTokensFound: intl.formatMessage(messages.noTokensFound),
    totalDAppValue: intl.formatMessage(messages.totalDAppValue),
    liquidityPool: intl.formatMessage(messages.liquidityPool),
    openOrders: intl.formatMessage(messages.openOrders),
    lendAndBorrow: intl.formatMessage(messages.lendAndBorrow),
    tokenDetail: intl.formatMessage(messages.tokenDetail),
    availableSoon: intl.formatMessage(messages.availableSoon),
    countLiquidityPoolsAvailable: (qty: number) =>
      intl.formatMessage(messages.countLiquidityPoolsAvailable, {countLiquidityPools: qty}),
    countOpenOrders: (qty: number) => intl.formatMessage(messages.countOpenOrders, {countOpenOrders: qty}),
    noDataFound: intl.formatMessage(messages.noDataFound),
  }
}

export const messages = defineMessages({
  portfolio: {
    id: 'global.portfolio',
    defaultMessage: '!!!Portfolio',
  },
  totalWalletValue: {
    id: 'portfolio.portfolioDashboardScreen.totalWalletValue',
    defaultMessage: '!!!Total wallet value',
  },
  tokens: {
    id: 'portfolio.portfolioDashboardScreen.tokens',
    defaultMessage: '!!!Tokens ({countTokens})',
  },
  buyADATitle: {
    id: 'portfolio.portfolioDashboardScreen.buyADATitle',
    defaultMessage: '!!!Start your crypto journey',
  },
  buyADADescription: {
    id: 'portfolio.portfolioDashboardScreen.buyADADescription',
    defaultMessage:
      "!!!Get started with Cardano's native currency, ADA. It's your key to unlocking a world of possibilities",
  },
  buyCrypto: {
    id: 'rampOnOff.createRampOnOff.buyCrypto',
    defaultMessage: '!!!Buy ADA',
  },
  tradeTokens: {
    id: 'portfolio.portfolioDashboardScreen.tradeTokens',
    defaultMessage: '!!!Trade Tokens',
  },
  swap: {
    id: 'global.swap',
    defaultMessage: '!!!Swap',
  },
  nfts: {
    id: 'portfolio.portfolioDashboardScreen.nfts',
    defaultMessage: '!!!NFTs ({countNfts})',
  },
  tokenList: {
    id: 'portfolio.portfolioTokensListScreen.tokenList',
    defaultMessage: '!!!Token list',
  },
  walletToken: {
    id: 'portfolio.portfolioTokensListScreen.walletToken',
    defaultMessage: '!!!Wallet token',
  },
  dappsToken: {
    id: 'portfolio.portfolioTokensListScreen.dappsToken',
    defaultMessage: '!!!DApps token',
  },
  tokensAvailable: {
    id: 'portfolio.portfolioTokensListScreen.tokensAvailable',
    defaultMessage: '!!!{countTokens} token(s) available',
  },
  searchTokens: {
    id: 'portfolio.portfolioTokensListScreen.searchTokens',
    defaultMessage: '!!!Search tokens',
  },
  noTokensFound: {
    id: 'portfolio.portfolioTokensListScreen.noTokensFound',
    defaultMessage: '!!!No tokens found',
  },
  totalDAppValue: {
    id: 'portfolio.portfolioTokensListScreen.totalDAppsValue',
    defaultMessage: '!!!Total dapps value',
  },
  liquidityPool: {
    id: 'portfolio.portfolioTokensListScreen.liquidityPool',
    defaultMessage: '!!!Liquidity pool',
  },
  openOrders: {
    id: 'portfolio.portfolioTokensListScreen.openOrders',
    defaultMessage: '!!!Open orders',
  },
  lendAndBorrow: {
    id: 'portfolio.portfolioTokensListScreen.lendAndBorrow',
    defaultMessage: '!!!Lend & borrow',
  },
  tokenDetail: {
    id: 'portfolio.portfolioTokensDetailScreen.tokenDetail',
    defaultMessage: '!!!Token details',
  },
  availableSoon: {
    id: 'portfolio.portfolioTokensDetailScreen.availableSoon',
    defaultMessage: '!!!Available soon',
  },
  countLiquidityPoolsAvailable: {
    id: 'portfolio.portfolioTokensDetailScreen.countLiquidityPoolsAvailable',
    defaultMessage: '!!!{countLiquidityPools} liquidity pool(s) available',
  },
  countOpenOrders: {
    id: 'portfolio.portfolioTokensDetailScreen.countOpenOrders',
    defaultMessage: '!!!{countOpenOrders} open order(s)',
  },
  noDataFound: {
    id: 'portfolio.portfolioTokensDetailScreen.noDataFound',
    defaultMessage: '!!!No Data Found',
  },
})
