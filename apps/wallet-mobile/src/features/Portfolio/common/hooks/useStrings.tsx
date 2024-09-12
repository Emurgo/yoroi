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
    value: intl.formatMessage(messages.value),
    dex: intl.formatMessage(messages.dex),
    lp: intl.formatMessage(messages.lp),
    total: intl.formatMessage(messages.total),
    assetPrice: intl.formatMessage(messages.assetPrice),
    assetAmount: intl.formatMessage(messages.assetAmount),
    txId: intl.formatMessage(messages.txId),
    performance: intl.formatMessage(messages.performance),
    overview: intl.formatMessage(messages.overview),
    transactions: intl.formatMessage(messages.transactions),
    tokenPriceChangeTooltip: (timeInterval: string) =>
      intl.formatMessage(messages.tokenPriceChangeTooltip, {timeInterval}),
    _1_week: intl.formatMessage(messages._1_week),
    _24_hours: intl.formatMessage(messages._24_hours),
    _1_month: intl.formatMessage(messages._1_month),
    _6_months: intl.formatMessage(messages._6_months),
    _1_year: intl.formatMessage(messages._1_year),
    all_time: intl.formatMessage(messages.all_time),
    netInvested: intl.formatMessage(messages.netInvested),
    bought: intl.formatMessage(messages.bought),
    received: intl.formatMessage(messages.received),
    sent: intl.formatMessage(messages.sent),
    send: intl.formatMessage(messages.send),
    sold: intl.formatMessage(messages.sold),
    failed: intl.formatMessage(messages.failed),
    stakeDelegated: intl.formatMessage(messages.stakeDelegated),
    stakingReward: intl.formatMessage(messages.stakingReward),
    unknown: intl.formatMessage(messages.unknown),
    assets: intl.formatMessage(messages.assets),
    marketData: intl.formatMessage(messages.marketData),
    tokenPriceChange: intl.formatMessage(messages.tokenPriceChange),
    tokenPrice: intl.formatMessage(messages.tokenPrice),
    marketCap: intl.formatMessage(messages.marketCap),
    _24hVolume: intl.formatMessage(messages._24hVolume),
    rank: intl.formatMessage(messages.rank),
    circulating: intl.formatMessage(messages.circulating),
    totalSupply: intl.formatMessage(messages.totalSupply),
    maxSupply: intl.formatMessage(messages.maxSupply),
    allTimeHigh: intl.formatMessage(messages.allTimeHigh),
    allTimeLow: intl.formatMessage(messages.allTimeLow),
    info: intl.formatMessage(messages.info),
    website: intl.formatMessage(messages.website),
    policyID: intl.formatMessage(messages.policyID),
    fingerprint: intl.formatMessage(messages.fingerprint),
    news: intl.formatMessage(messages.news),
    detailsOn: intl.formatMessage(messages.detailsOn),
    totalPortfolioValue: intl.formatMessage(messages.totalPortfolioValue),
    totalPortfolioValueTooltip: intl.formatMessage(messages.totalPortfolioValueTooltip),
    totalWalletValueTooltip: intl.formatMessage(messages.totalWalletValueTooltip),
    totalDAppsValueTooltip: intl.formatMessage(messages.totalDAppsValueTooltip),
    portfolioSwapTokensTitle: intl.formatMessage(messages.portfolioSwapTokensTitle),
    portfolioSwapTokensDescription: intl.formatMessage(messages.portfolioSwapTokensDescription),
    startSwapping: intl.formatMessage(messages.startSwapping),
    titleMediaDetails: intl.formatMessage(messages.titleMediaDetails),
    title: intl.formatMessage(messages.title),
    search: intl.formatMessage(messages.search),
    nftCount: intl.formatMessage(messages.nftCount),
    errorTitle: intl.formatMessage(messages.errorTitle),
    errorDescription: intl.formatMessage(messages.errorDescription),
    reloadApp: intl.formatMessage(messages.reloadApp),
    noNftsFound: intl.formatMessage(messages.noNftsFound),
    noNftsInWallet: intl.formatMessage(messages.noNftsInWallet),
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
  totalPortfolioValue: {
    id: 'portfolio.portfolioDashboardScreen.totalPortfolioValue',
    defaultMessage: '!!!Total portfolio value',
  },
  totalPortfolioValueTooltip: {
    id: 'portfolio.portfolioDashboardScreen.totalPortfolioValueTooltip',
    defaultMessage: '!!!Funds in the wallet \nand associated DApps.',
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
    id: 'portfolio.portfolioTokensListScreen.noDataFound',
    defaultMessage: '!!!No Data Found',
  },
  value: {
    id: 'portfolio.portfolioTokensListScreen.value',
    defaultMessage: '!!!Value',
  },
  dex: {
    id: 'portfolio.portfolioTokensListScreen.dex',
    defaultMessage: '!!!DEX',
  },
  lp: {
    id: 'portfolio.portfolioTokensListScreen.lp',
    defaultMessage: '!!!LP',
  },
  totalWalletValueTooltip: {
    id: 'portfolio.portfolioTokensListScreen.totalWalletValueTooltip',
    defaultMessage: '!!!% Balance performance \n+/- Balance change \nin 24 hours',
  },
  totalDAppsValueTooltip: {
    id: 'portfolio.portfolioTokensListScreen.totalDAppsValueTooltip',
    defaultMessage: '!!!% Performance \n+/- Balance change \nin 24 hours (DApps)',
  },
  total: {
    id: 'components.governance.total',
    defaultMessage: '!!!Total',
  },
  assetPrice: {
    id: 'swap.listOrders.sheet.assetPrice',
    defaultMessage: '!!!Asset price',
  },
  assetAmount: {
    id: 'swap.listOrders.sheet.assetAmount',
    defaultMessage: '!!!Asset amount',
  },
  txId: {
    id: 'swap.listOrders.txId',
    defaultMessage: '!!!Transaction ID',
  },
  performance: {
    id: 'portfolio.portfolioTokensDetailScreen.performance',
    defaultMessage: '!!!Performance',
  },
  overview: {
    id: 'portfolio.portfolioTokensDetailScreen.overview',
    defaultMessage: '!!!Overview',
  },
  transactions: {
    id: 'portfolio.portfolioTokensDetailScreen.transactions',
    defaultMessage: '!!!Transactions',
  },
  tokenPriceChangeTooltip: {
    id: 'portfolio.portfolioTokensDetailScreen.tokenPriceChangeTooltip',
    defaultMessage: '!!!Token price change \nin {timeInterval}',
  },
  _24_hours: {
    id: 'portfolio.portfolioTokensDetailScreen.24_hours',
    defaultMessage: '!!!24 hours',
  },
  _1_week: {
    id: 'portfolio.portfolioTokensDetailScreen.1_week',
    defaultMessage: '!!!1 week',
  },
  _1_month: {
    id: 'portfolio.portfolioTokensDetailScreen.1_month',
    defaultMessage: '!!!1 month',
  },
  _6_months: {
    id: 'portfolio.portfolioTokensDetailScreen.6_months',
    defaultMessage: '!!!6 months',
  },
  _1_year: {
    id: 'portfolio.portfolioTokensDetailScreen.1_year',
    defaultMessage: '!!!1 year',
  },
  all_time: {
    id: 'portfolio.portfolioTokensDetailScreen.all_time',
    defaultMessage: '!!!all time',
  },
  netInvested: {
    id: 'portfolio.portfolioTokensDetailScreen.netInvested',
    defaultMessage: '!!!Net Invested',
  },
  bought: {
    id: 'portfolio.portfolioTokensDetailScreen.bought',
    defaultMessage: '!!!Bought',
  },
  received: {
    id: 'portfolio.portfolioTokensDetailScreen.received',
    defaultMessage: '!!!Received',
  },
  sent: {
    id: 'portfolio.portfolioTokensDetailScreen.sent',
    defaultMessage: '!!!Sent',
  },
  send: {
    id: 'portfolio.portfolioTokensDetailScreen.send',
    defaultMessage: '!!!Send',
  },
  sold: {
    id: 'portfolio.portfolioTokensDetailScreen.sold',
    defaultMessage: '!!!Sold',
  },
  failed: {
    id: 'portfolio.portfolioTokensDetailScreen.failed',
    defaultMessage: '!!!Failed',
  },
  stakeDelegated: {
    id: 'portfolio.portfolioTokensDetailScreen.stakeDelegated',
    defaultMessage: '!!!Stake Delegated',
  },
  stakingReward: {
    id: 'portfolio.portfolioTokensDetailScreen.stakingReward',
    defaultMessage: '!!!Staking Reward',
  },
  unknown: {
    id: 'portfolio.portfolioTokensDetailScreen.unknown',
    defaultMessage: '!!!Unknown',
  },
  assets: {
    id: 'portfolio.portfolioTokensDetailScreen.assets',
    defaultMessage: '!!!assets',
  },
  marketData: {
    id: 'portfolio.portfolioTokensDetailScreen.marketData',
    defaultMessage: '!!!Market data',
  },
  tokenPriceChange: {
    id: 'portfolio.portfolioTokensDetailScreen.tokenPriceChange',
    defaultMessage: '!!!Token price change',
  },
  tokenPrice: {
    id: 'portfolio.portfolioTokensDetailScreen.tokenPrice',
    defaultMessage: '!!!Token price ',
  },
  marketCap: {
    id: 'portfolio.portfolioTokensDetailScreen.marketCap',
    defaultMessage: '!!!Market cap ',
  },
  _24hVolume: {
    id: 'portfolio.portfolioTokensDetailScreen._24hVolume',
    defaultMessage: '!!!24h volume',
  },
  rank: {
    id: 'portfolio.portfolioTokensDetailScreen.rank',
    defaultMessage: '!!!Rank',
  },
  circulating: {
    id: 'portfolio.portfolioTokensDetailScreen.circulating',
    defaultMessage: '!!!Circulating',
  },
  totalSupply: {
    id: 'portfolio.portfolioTokensDetailScreen.totalSupply',
    defaultMessage: '!!!Total supply',
  },
  maxSupply: {
    id: 'portfolio.portfolioTokensDetailScreen.maxSupply',
    defaultMessage: '!!!Max supply',
  },
  allTimeHigh: {
    id: 'portfolio.portfolioTokensDetailScreen.allTimeHigh',
    defaultMessage: '!!!All time high',
  },
  allTimeLow: {
    id: 'portfolio.portfolioTokensDetailScreen.allTimeLow',
    defaultMessage: '!!!All time low',
  },
  info: {
    id: 'portfolio.portfolioTokensDetailScreen.info',
    defaultMessage: '!!!Info',
  },
  website: {
    id: 'portfolio.portfolioTokensDetailScreen.website',
    defaultMessage: '!!!Website',
  },
  policyID: {
    id: 'portfolio.portfolioTokensDetailScreen.policyID',
    defaultMessage: '!!!Policy ID',
  },
  fingerprint: {
    id: 'portfolio.portfolioTokensDetailScreen.fingerprint',
    defaultMessage: '!!!Fingerprint',
  },
  news: {
    id: 'portfolio.portfolioTokensDetailScreen.news',
    defaultMessage: '!!!News',
  },
  detailsOn: {
    id: 'portfolio.portfolioTokensDetailScreen.detailsOn',
    defaultMessage: '!!!Details on',
  },
  portfolioSwapTokensTitle: {
    id: 'portfolio.portfolioDashboardScreen.portfolioSwapTokensTitle',
    defaultMessage: '!!!Trade Tokens. Explore Possibilities',
  },
  portfolioSwapTokensDescription: {
    id: 'portfolio.portfolioDashboardScreen.portfolioSwapTokensDescription',
    defaultMessage: '!!!Swap tokens seamlessly within Yoroi. Access new investment opportunities and explore DeFi',
  },
  startSwapping: {
    id: 'portfolio.portfolioDashboardScreen.startSwapping',
    defaultMessage: '!!!Start Swapping',
  },
  titleMediaDetails: {
    id: 'nft.detail.title',
    defaultMessage: '!!!NFT Details',
  },
  nftCount: {
    id: 'nft.gallery.nftCount',
    defaultMessage: '!!!NFT count',
  },
  errorTitle: {
    id: 'nft.gallery.errorTitle',
    defaultMessage: '!!!Oops!',
  },
  errorDescription: {
    id: 'nft.gallery.errorDescription',
    defaultMessage: '!!!Something went wrong.',
  },
  reloadApp: {
    id: 'nft.gallery.reloadApp',
    defaultMessage: '!!!Try to restart the app.',
  },
  noNftsFound: {
    id: 'nft.gallery.noNftsFound',
    defaultMessage: '!!!No NFTs found',
  },
  noNftsInWallet: {
    id: 'nft.gallery.noNftsInWallet',
    defaultMessage: '!!!No NFTs added to your wallet yet',
  },
  title: {
    id: 'nft.navigation.title',
    defaultMessage: '!!!NFT Gallery',
  },
  search: {
    id: 'nft.navigation.search',
    defaultMessage: '!!!Search NFT',
  },
})
