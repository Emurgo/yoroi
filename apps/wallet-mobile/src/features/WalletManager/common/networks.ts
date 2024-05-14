import {createPrimaryTokenInfo} from '@yoroi/portfolio'
import {Chain} from '@yoroi/types'
import {freeze} from 'immer'

import {NetworkConfig, NetworkEraConfig} from './types'

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

export const shelleyEraConfig: NetworkEraConfig = freeze(
  {
    name: 'shelley',
    start: new Date(Date.UTC(2020, 6, 29, 21, 44, 51)), // July 29, 2020 21:44:51 UTC
    end: undefined,
    slotInSeconds: 1, // slotLength (shelley)
    slotsPerEpoch: 432000, // epochLength 5 days * 24 hours * 60 minutes * 60 seconds = 5 * 86_400 = 432_000 / 1
  },
  true,
)

export const byronEraConfig: NetworkEraConfig = freeze(
  {
    name: 'byron',
    start: new Date(Date.UTC(2017, 8, 23, 21, 44, 51)), // September 23, 2017 21:44:51 UTC
    end: new Date(Date.UTC(2020, 6, 29, 21, 44, 50)), // July 29, 2020 21:44:50 UTC
    slotInSeconds: 20, // slotDuration (byron)
    slotsPerEpoch: 21600, // 5 days * 24 hours * 60 minutes * 60 seconds = 5 * 86_400 = 432_000 / 20 = 21_600
  },
  true,
)

export const networksConfig: Readonly<Record<Chain.SupportedNetworks, NetworkConfig>> = freeze({
  [Chain.Network.Mainnet]: {
    primaryTokenInfo: primaryTokenInfoMainnet,
    chainId: 1,
    eras: [byronEraConfig, shelleyEraConfig],
  },
  [Chain.Network.Preprod]: {
    primaryTokenInfo: primaryTokenInfoAnyTestnet,
    chainId: 0,
    eras: [shelleyEraConfig],
  },
  [Chain.Network.Sancho]: {
    primaryTokenInfo: primaryTokenInfoAnyTestnet,
    chainId: 0,
    eras: [shelleyEraConfig],
  },
})
