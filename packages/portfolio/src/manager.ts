// import {App, Chain, Portfolio} from '@yoroi/types'
// import {PortfolioApi, PortfolioManager} from './types'

// export const portfolioManagerMaker = ({
//   network,
//   api,
//   balanceStorage,
// }: {
//   network: Chain.Network
//   api: PortfolioApi
//   balanceStorage: App.ObservableMultiStorage<Portfolio.Token.Balance, false>
// }): PortfolioManager => {
//   const balances = new Map<Portfolio.Token.Id, Portfolio.Quantity>()

//   return Object.freeze({
//     async hydrate() {
//       balances.clear()
//       balanceStorage.readAll()
//       // .forEach(([tokenId, quantity]) => balances.set(tokenId, quantity))

//       console.log('load - balances', network, api)
//     },
//   })
// }

export const x = 1
