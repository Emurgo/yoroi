import {Swap} from '@yoroi/types'
import {dexhunterApiMaker} from './adapters/api/dexhunter/api-maker'
import {muesliswapApiMaker} from './adapters/api/muesliswap/api-maker'

export const swapManagerMaker: Swap.ManagerMaker = ({
  address,
  addressHex,
  network,
  primaryTokenInfo,
  stakingKey,
  storage,
}) => {
  const dexhunterApi = dexhunterApiMaker({address, network, primaryTokenInfo})
  const muesliswapApi = muesliswapApiMaker({
    address,
    addressHex,
    network,
    primaryTokenInfo,
    stakingKey,
  })

  return {
    api: apiMaker([muesliswapApi, dexhunterApi]),
    clearStorage: storage.clear,
    slippage: storage.slippage,
  }
}

const apiMaker = (adapters: Array<Swap.Api>): Swap.Api => {
  return adapters[0]!
}
