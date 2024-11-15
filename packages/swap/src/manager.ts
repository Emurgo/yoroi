import {Portfolio, Swap} from '@yoroi/types'
import {dexhunterApiMaker} from './adapters/api/dexhunter/api-maker'
import {
  muesliswapApiMaker,
  milkTokenId,
  oldMilkTokenId,
} from './adapters/api/muesliswap/api-maker'

export const swapManagerMaker: Swap.ManagerMaker = ({
  address,
  addressHex,
  aggregatedFrontendFeeTiers,
  network,
  primaryTokenInfo,
  stakingKey,
  storage,
}) => {
  const aggregatorTokensHeld: {
    muesliswap: number
    dexhunter: number
  } = {muesliswap: 0, dexhunter: 0}

  const updateAggregatorTokensHeld = (
    values: ReadonlyArray<Portfolio.Token.Amount>,
  ) => {
    aggregatorTokensHeld.muesliswap = values.reduce(
      (acc, curr) =>
        acc +
        (curr.info.id === milkTokenId || curr.info.id === oldMilkTokenId
          ? Number(curr.quantity)
          : 0),
      0,
    )
  }

  const dexhunterApi = dexhunterApiMaker({address, network, primaryTokenInfo})
  const muesliswapApi = muesliswapApiMaker({
    address,
    addressHex,
    frontendFeeTiers: aggregatedFrontendFeeTiers.muesliswap,
    network,
    primaryTokenInfo,
    stakingKey,
    getLpTokensHeld: () => aggregatorTokensHeld.muesliswap,
  })

  return {
    api: apiMaker([dexhunterApi, muesliswapApi]),
    clearStorage: storage.clear,
    slippage: storage.slippage,
    updateAggregatorTokensHeld,
    aggregatorTokenIds: [milkTokenId, oldMilkTokenId],
  }
}

const apiMaker = (adapters: Array<Swap.Api>): Swap.Api => {
  return adapters[0]!
}
