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

  const config: Swap.ManagerConfig = { adapter: 'auto' }

  return {
    api: apiManagerMaker({
      [Swap.Aggregator.Dexhunter]: dexhunterApi,      [Swap.Aggregator.Muesliswap]: muesliswapApi,

    }, config),
    assignConfig: (v: Swap.ManagerConfig): Swap.ManagerConfig => Object.assign(config, v),
    config,
    clearStorage: storage.clear,
    slippage: storage.slippage,
  }
}

const apiManagerMaker = (adapters: Record<Swap.Aggregator, Swap.Api>, config: Swap.ManagerConfig): Swap.Api => {
  const autoApi = autoApiMaker(adapters)
  return new Proxy(
    {},
    {
      get({}, prop: keyof Swap.Api) {
        return (...args: any[]) => {
          if (config.adapter !== 'auto') return (adapters[config.adapter][prop] as Function)(...args)
          return (autoApi[prop] as Function)(...args)
        }
      },
    },
  ) as Swap.Api
}
  
const autoApiMaker = (adapters: Record<Swap.Aggregator, Swap.Api>): Swap.Api => {
  // TODO
  return adapters[Swap.Aggregator.Muesliswap]
}
