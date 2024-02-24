import {Chain, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

import {PortfolioApi, PortfolioManager, PortfolioStorage} from './types'

export const portfolioManagerMaker = ({
  network,
  api,
  storage,
}: {
  network: Chain.Network
  api: PortfolioApi
  storage: PortfolioStorage
}): PortfolioManager => {
  const balances = new Map<Portfolio.Token.Id, Portfolio.Quantity>()
  console.log('balances', balances)
  console.log('network', network)
  console.log('api', api)
  console.log('storage', storage)

  const hydrate = async () => {
    // storage.
  }

  console.log('hydrate', hydrate)

  return freeze({
    async hydrate() {},
  })
}
