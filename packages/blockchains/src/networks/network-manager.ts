import {CardanoApi} from '@yoroi/api'
import {
  mountAsyncStorage,
  mountMMKVStorage,
  observableStorageMaker,
} from '@yoroi/common'
import {explorerManager} from '@yoroi/explorers'
import {Api, App, Chain, Network} from '@yoroi/types'
import {freeze} from 'immer'

import {TokenManagerByNetwork} from '../types'
import {networkConfigs} from './network-configs'
import {protocolParamsPlaceholder} from '../cardano/constants'

export function buildNetworkManagers({
  tokenManagers,
  logger,
  apiMaker = CardanoApi.cardanoApiMaker,
}: {
  tokenManagers: TokenManagerByNetwork
  logger: App.Logger.Manager
  apiMaker?: ({network}: {network: Chain.SupportedNetworks}) => Api.Cardano.Api
}): Readonly<Record<Chain.SupportedNetworks, Network.Manager>> {
  const managers = Object.entries(networkConfigs).reduce<
    Record<Chain.SupportedNetworks, Network.Manager>
  >((networkManagers, [network, config]) => {
    const tokenManager = tokenManagers[network as Chain.SupportedNetworks]
    const networkRootStorage = mountMMKVStorage({
      path: `/`,
      id: `${network}.manager.v1`,
    })
    const rootStorage = observableStorageMaker(networkRootStorage)
    const legacyRootStorage = observableStorageMaker(
      mountAsyncStorage({path: `/legacy/${network}/v1/`}),
    )
    const {getProtocolParams, getBestBlock, getUtxoData} = apiMaker({
      network: config.network,
    })
    const api = {
      protocolParams: () =>
        getProtocolParams().catch((error) => {
          logger.error(
            `networkManager: ${network} protocolParams has failed, using hardcoded`,
            {error},
          )
          return Promise.resolve(protocolParamsPlaceholder)
        }),
      bestBlock: getBestBlock,
      utxoData: getUtxoData,
    }

    const networkManager: Network.Manager = {
      ...config,
      api,
      rootStorage,
      tokenManager,

      explorers: explorerManager[network as Chain.SupportedNetworks],

      // NOTE: it can't use the new rootStorage cuz all modules are async now 🥹
      legacyRootStorage,
    }
    networkManagers[network as Chain.SupportedNetworks] = networkManager

    return networkManagers
  }, {} as Record<Chain.SupportedNetworks, Network.Manager>)

  return freeze(managers, true)
}
