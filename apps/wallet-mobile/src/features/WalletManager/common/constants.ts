import {createPrimaryTokenInfo} from '@yoroi/portfolio'
import {Chain} from '@yoroi/types'
import {freeze} from 'immer'

import {NetworkConfig} from './types'

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

export const networksConfig: Readonly<Record<Chain.SupportedNetworks, NetworkConfig>> = freeze({
  [Chain.Network.Mainnet]: {
    primaryTokenInfo: primaryTokenInfoMainnet,
  },
  [Chain.Network.Preprod]: {
    primaryTokenInfo: primaryTokenInfoAnyTestnet,
  },
  [Chain.Network.Sancho]: {
    primaryTokenInfo: primaryTokenInfoAnyTestnet,
  },
})
