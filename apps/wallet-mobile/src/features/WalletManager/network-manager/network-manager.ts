import {CardanoApi} from '@yoroi/api'
import {mountAsyncStorage, mountMMKVStorage, observableStorageMaker} from '@yoroi/common'
import {createPrimaryTokenInfo} from '@yoroi/portfolio'
import {Chain, Network} from '@yoroi/types'
import {freeze} from 'immer'

import {logger} from '../../../kernel/logger/logger'
import {NetworkTokenManagers} from '../common/types'

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

export const shelleyEraConfig: Readonly<Network.EraConfig> = freeze(
  {
    name: 'shelley',
    start: new Date('2020-07-29T21:44:51.000Z'),
    end: undefined,
    slotInSeconds: 1,
    slotsPerEpoch: 432000,
  },
  true,
)

export const byronEraConfig: Readonly<Network.EraConfig> = freeze(
  {
    name: 'byron',
    start: new Date('2017-09-23T21:44:51.000Z'),
    end: new Date('2020-07-29T21:44:51.000Z'),
    slotInSeconds: 20,
    slotsPerEpoch: 21600,
  },
  true,
)

export const shelleyPreprodEraConfig: Readonly<Network.EraConfig> = freeze(
  {
    name: 'shelley',
    start: new Date('2022-06-01T01:00:00.000Z'),
    end: undefined,
    slotInSeconds: 1,
    slotsPerEpoch: 432000,
  },
  true,
)

export const protocolParamsPlaceholder = freeze({
  linearFee: {
    constant: '155381',
    coefficient: '44',
  },
  coinsPerUtxoByte: '4310',
  poolDeposit: '500000000',
  keyDeposit: '2000000',
})

const networkConfigs: Readonly<Record<Chain.SupportedNetworks, Readonly<Network.Config>>> = freeze({
  [Chain.Network.Mainnet]: {
    network: Chain.Network.Mainnet,
    primaryTokenInfo: primaryTokenInfoMainnet,
    chainId: 1,
    protocolMagic: 764_824_073,
    eras: [byronEraConfig, shelleyEraConfig],
    name: 'Mainnet',
    isMainnet: true,

    legacyApiBaseUrl: 'https://api.yoroiwallet.com/api',
  },
  [Chain.Network.Preprod]: {
    network: Chain.Network.Preprod,
    primaryTokenInfo: primaryTokenInfoAnyTestnet,
    chainId: 0,
    protocolMagic: 1,
    eras: [shelleyPreprodEraConfig],
    name: 'Preprod',
    isMainnet: false,

    legacyApiBaseUrl: 'https://preprod-backend.yoroiwallet.com/api',
  },
  [Chain.Network.Sancho]: {
    network: Chain.Network.Sancho,
    primaryTokenInfo: primaryTokenInfoAnyTestnet,
    chainId: 0,
    protocolMagic: 4,
    eras: [shelleyEraConfig],
    name: 'Sancho (Conway)',
    isMainnet: false,

    legacyApiBaseUrl: 'https://sanchonet-backend.yoroiwallet.com/api',
  },
  // NOTE: not supported yet on mobile
  // [Chain.Network.Preview]: {
  //   network: Chain.Network.Preview,
  //   primaryTokenInfo: primaryTokenInfoAnyTestnet,
  //   chainId: 0,
  //   protocolMagic: 2,
  //   eras: [shelleyEraConfig],
  //   name: 'Preview',
  //   isMainnet: false,
  // },
})

export function buildNetworkManagers({
  tokenManagers,
}: {
  tokenManagers: NetworkTokenManagers
}): Readonly<Record<Chain.SupportedNetworks, Network.Manager>> {
  // TODO: receive and attach the explorers here as well
  const managers = Object.entries(networkConfigs).reduce<Record<Chain.SupportedNetworks, Network.Manager>>(
    (networkManagers, [network, config]) => {
      const tokenManager = tokenManagers[network as Chain.SupportedNetworks]
      const networkRootStorage = mountMMKVStorage({path: `/`, id: `${network}.manager.v1`})
      const rootStorage = observableStorageMaker(networkRootStorage)
      const legacyRootStorage = observableStorageMaker(mountAsyncStorage({path: `/legacy/${network}/v1/`}))
      const {getProtocolParams} = CardanoApi.cardanoApiMaker({network: config.network})
      const api = {
        protocolParams: () =>
          getProtocolParams().catch((error) => {
            logger.error(`networkManager: ${network} protocolParams has failed`, {error})
            return protocolParamsPlaceholder
          }),
      }

      const networkManager: Network.Manager = {
        ...config,
        tokenManager,
        rootStorage,
        // NOTE: we can't use the new rootStorage cuz all modules are async now 🥹
        legacyRootStorage,
        api,
      }
      networkManagers[network as Chain.SupportedNetworks] = networkManager

      return networkManagers
    },
    {} as Record<Chain.SupportedNetworks, Network.Manager>,
  )

  return freeze(managers, true)
}
