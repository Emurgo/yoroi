import {Chain, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

import {PortfolioApi, PortfolioManager, PortfolioStorage} from './types'
import {difference} from '@yoroi/common'
import {recordWithETag} from './transformers/record-with-etag'

export const portfolioManagerMaker = ({
  // network,
  api,
  // primaryTokenInfo,
  storage,
}: {
  network: Chain.Network
  api: Readonly<PortfolioApi>
  storage: Readonly<PortfolioStorage>
  primaryTokenInfo: Readonly<Portfolio.Token.Info>
}): PortfolioManager => {
  let isHydrated = false
  let balances: Readonly<Map<Portfolio.Token.Id, Portfolio.Token.Balance>>
  let balanceIds: Readonly<Set<Portfolio.Token.Id>>
  // let tokenInfoIds: Readonly<Set<Portfolio.Token.Id>>
  // let tokenDiscoveryKeys: ReadonlyArray<Portfolio.Token.Id>

  const hydrate = () => {
    balances = freeze(new Map(storage.balances.all()), true)
    balanceIds = freeze(new Set(balances.keys()), true)

    isHydrated = true
  }

  const sync = async ({
    balances,
    lockedInTxs,
  }: {
    balances: {
      secondaryAmounts: Readonly<Map<Portfolio.Token.Id, BigInt>>
      primaryBalance: Readonly<
        Map<Portfolio.Token.Id, Portfolio.BalancePrimaryBreakdown>
      >
    }
  }) => {
    if (!isHydrated) hydrate()
    const unknownIds = difference([...balanceIds], [...secondaryAmounts.keys()])
    const idsToFetch = unknownIds.map((id) => recordWithETag(id))

    const tokenInfos = await api.tokenInfos(idsToFetch)

    console.log(tokenInfos)
  }

  return freeze(
    {
      hydrate,
      sync,
    },
    true,
  )
}
