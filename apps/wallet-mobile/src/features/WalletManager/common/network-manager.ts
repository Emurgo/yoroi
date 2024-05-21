import {createPrimaryTokenInfo} from '@yoroi/portfolio'
import {Chain} from '@yoroi/types'
import {freeze} from 'immer'

import {NetworkEraConfig, NetworkManager} from './types'

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
    start: new Date('2020-07-29T21:44:51.000Z'),
    end: undefined,
    slotInSeconds: 1,
    slotsPerEpoch: 432000,
  },
  true,
)

export const byronEraConfig: NetworkEraConfig = freeze(
  {
    name: 'byron',
    start: new Date('2017-09-23T21:44:51.000Z'),
    end: new Date('2020-07-29T21:44:51.000Z'),
    slotInSeconds: 20,
    slotsPerEpoch: 21600,
  },
  true,
)

export const shelleyPreprodEraConfig: NetworkEraConfig = freeze(
  {
    name: 'shelley',
    start: new Date('2022-06-01T01:00:00.000Z'),
    end: undefined,
    slotInSeconds: 1,
    slotsPerEpoch: 432000,
  },
  true,
)

export const networkManager: Readonly<Record<Chain.SupportedNetworks, NetworkManager>> = freeze({
  [Chain.Network.Mainnet]: {
    primaryTokenInfo: primaryTokenInfoMainnet,
    chainId: 1,
    eras: [byronEraConfig, shelleyEraConfig],
  },
  [Chain.Network.Preprod]: {
    primaryTokenInfo: primaryTokenInfoAnyTestnet,
    chainId: 0,
    eras: [shelleyPreprodEraConfig],
  },
  [Chain.Network.Sancho]: {
    primaryTokenInfo: primaryTokenInfoAnyTestnet,
    chainId: 0,
    eras: [shelleyEraConfig],
  },
})
