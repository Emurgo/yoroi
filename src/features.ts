// Testing purposes forcing prod view
const __DEV__ = false

export default {
  walletHero: {
    fiat: __DEV__ || false,
    buy: __DEV__ || false,
  },
  txHistory: {
    export: __DEV__ || false,
    search: __DEV__ || false,
    nfts: __DEV__ || false,
  },
}
