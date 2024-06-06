import {mountMMKVStorage, observableStorageMaker} from '@yoroi/common'
import {createPrimaryTokenInfo} from '@yoroi/portfolio'
import {Chain, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

import {NetworkConfig, NetworkEraConfig, NetworkManager, NetworkTokenManagers} from '../common/types'

export const primaryTokenInfoMainnet = createPrimaryTokenInfo({
  decimals: 6,
  name: 'ADA',
  ticker: 'ADA',
  symbol: '₳',
  reference: '',
  tag: '',
  website: 'https://www.cardano.org/',
  originalImage: '',
  description: 'Cardano',
  icon: '',
  mediaType: '',
})

export const primaryTokenInfoAnyTestnet = createPrimaryTokenInfo({
  decimals: 6,
  name: 'TADA',
  ticker: 'TADA',
  symbol: '₳',
  reference: '',
  tag: '',
  website: 'https://www.cardano.org/',
  originalImage: '',
  description: 'Cardano',
  icon: '',
  mediaType: '',
})

export const shelleyEraConfig: Readonly<NetworkEraConfig> = freeze(
  {
    name: 'shelley',
    start: new Date('2020-07-29T21:44:51.000Z'),
    end: undefined,
    slotInSeconds: 1,
    slotsPerEpoch: 432000,
  },
  true,
)

export const byronEraConfig: Readonly<NetworkEraConfig> = freeze(
  {
    name: 'byron',
    start: new Date('2017-09-23T21:44:51.000Z'),
    end: new Date('2020-07-29T21:44:51.000Z'),
    slotInSeconds: 20,
    slotsPerEpoch: 21600,
  },
  true,
)

export const shelleyPreprodEraConfig: Readonly<NetworkEraConfig> = freeze(
  {
    name: 'shelley',
    start: new Date('2022-06-01T01:00:00.000Z'),
    end: undefined,
    slotInSeconds: 1,
    slotsPerEpoch: 432000,
  },
  true,
)

const networkConfigs: Readonly<Record<Chain.SupportedNetworks, Readonly<NetworkConfig>>> = freeze({
  [Chain.Network.Mainnet]: {
    network: Chain.Network.Mainnet,
    primaryTokenInfo: primaryTokenInfoMainnet,
    chainId: 1,
    eras: [byronEraConfig, shelleyEraConfig],
    name: 'Mainnet',
    isMainnet: true,
  },
  [Chain.Network.Preprod]: {
    network: Chain.Network.Preprod,
    primaryTokenInfo: primaryTokenInfoAnyTestnet,
    chainId: 0,
    eras: [shelleyPreprodEraConfig],
    name: 'Preprod',
    isMainnet: false,
  },
  [Chain.Network.Sancho]: {
    network: Chain.Network.Sancho,
    primaryTokenInfo: primaryTokenInfoAnyTestnet,
    chainId: 0,
    eras: [shelleyEraConfig],
    name: 'Sancho (Conway)',
    isMainnet: false,
  },
})

export function buildNetworkManagers({
  tokenManagers,
}: {
  tokenManagers: NetworkTokenManagers
}): Readonly<Record<Chain.SupportedNetworks, NetworkManager>> {
  // TODO: receive and attach the explorers here as well
  return freeze(
    Object.entries(networkConfigs).reduce<Record<Chain.SupportedNetworks, NetworkManager>>(
      (networkManagers, [network, config]) => {
        const tokenManager = tokenManagers[network as Chain.SupportedNetworks]
        const networkRootStorage = mountMMKVStorage<Portfolio.Token.Id>({path: `/`, id: `${network}.manager`})
        const rootStorage = observableStorageMaker(networkRootStorage)
        const networkManager: NetworkManager = {
          ...config,
          tokenManager,
          rootStorage,
        }
        networkManagers[network as Chain.SupportedNetworks] = networkManager

        return networkManagers
      },
      {} as Record<Chain.SupportedNetworks, NetworkManager>,
    ),
    true,
  )
}
