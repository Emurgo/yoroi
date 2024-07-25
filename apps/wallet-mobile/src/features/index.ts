export const features = {
  txHistory: {
    export: __DEV__,
    search: __DEV__,
    nfts: __DEV__,
  },
  useTestnet: false,
  prefillWalletInfo: false,
  showProdPoolsInDev: __DEV__,
  moderatingNftsEnabled: false,
  walletListFeedback: __DEV__,
  poolTransition: true,
  portfolioPerformance: false,
  portfolioGraph: false,
  portfolioNews: false,
  portfolioExport: false,
}

export const debugWalletInfo = {
  WALLET_NAME: features.useTestnet ? 'Auto Testnet' : 'Auto Nightly',
  PASSWORD: '1234567890',
  MNEMONIC1: ['dry balcony arctic what garbage sort', 'cart shine egg lamp manual bottom', 'slide assault bus'].join(
    ' ',
  ),
  MNEMONIC2: [
    'able grunt edge report orange wide',
    'amount decrease congress flee smile impulse',
    'parade perfect normal',
  ].join(' '),
  MNEMONIC3: [
    'make exercise taxi asset',
    'reject seek brain volcano roof',
    'boss already cement scrub',
    'nut priority',
  ].join(' '),
  SEND_ADDRESS: features.useTestnet
    ? 'addr_test1qpaufs29emf7r62prt8r0l072nuvs4vezrgve2ty5csvvjwr3y3kdut55a40jff00qmg74686vz44v6k363md06qkq0qj8n0y9'
    : 'addr1q8dewyn53xdjyzu20xjj6wg7kkxyqq63upxqevt24jga8fgcdwap96xuy84apchhj8u6r7uvl974sy9qz0sedc7ayjks3sxz7a',
  SEND_AMOUNT: features.useTestnet ? '3.3333' : '1',
}
