import {Chain, Network} from '@yoroi/types'
import {freeze} from 'immer'
import {
  byronEraConfig,
  primaryTokenInfoAnyTestnet,
  primaryTokenInfoMainnet,
  shelleyEraConfig,
  shelleyPreprodEraConfig,
} from '../cardano/constants'
import {dateToEpochInfo} from '../cardano/helpers/date-to-epoch-info'
import {epochProgress} from '../cardano/helpers/epoch-progress'

const cardanoErasMainnet = [byronEraConfig, shelleyEraConfig]
const cardanoErasPreprod = [shelleyPreprodEraConfig]
const cardanoErasPreview = [shelleyEraConfig]
const cardanoInfoMainnet = dateToEpochInfo(cardanoErasMainnet)
const cardanoInfoPreprod = dateToEpochInfo(cardanoErasPreprod)
const cardanoInfoPreview = dateToEpochInfo(cardanoErasPreview)

export const networkConfigs: Readonly<
  Record<Chain.SupportedNetworks, Readonly<Network.Config>>
> = freeze({
  [Chain.Network.Mainnet]: {
    blockchain: Network.Blockchains.Cardano,
    network: Chain.Network.Mainnet,
    isMainnet: true,
    name: 'Mainnet',
    primaryTokenInfo: primaryTokenInfoMainnet,
    chainId: 1,

    protocolMagic: 764_824_073,
    eras: cardanoErasMainnet,
    epoch: {
      info: cardanoInfoMainnet,
      progress: (date: Date) => {
        const currentInfo = cardanoInfoMainnet(date)
        return epochProgress(currentInfo)(date)
      },
    },

    legacyApiBaseUrl: 'https://api.yoroiwallet.com/api',
  },
  [Chain.Network.Preprod]: {
    blockchain: Network.Blockchains.Cardano,
    network: Chain.Network.Preprod,
    isMainnet: false,
    name: 'Preprod',
    primaryTokenInfo: primaryTokenInfoAnyTestnet,
    chainId: 0,

    protocolMagic: 1,
    eras: cardanoErasPreprod,
    epoch: {
      info: cardanoInfoPreprod,
      progress: (date: Date) => {
        const currentInfo = cardanoInfoPreprod(date)
        return epochProgress(currentInfo)(date)
      },
    },

    legacyApiBaseUrl: 'https://preprod-backend.yoroiwallet.com/api',
  },
  // NOTE: not supported yet on mobile
  [Chain.Network.Preview]: {
    blockchain: Network.Blockchains.Cardano,
    network: Chain.Network.Preview,
    isMainnet: false,
    name: 'Preview',
    primaryTokenInfo: primaryTokenInfoAnyTestnet,
    chainId: 0,

    protocolMagic: 2,
    eras: cardanoErasPreview,
    epoch: {
      info: cardanoInfoPreview,
      progress: (date: Date) => {
        const currentInfo = cardanoInfoPreview(date)
        return epochProgress(currentInfo)(date)
      },
    },

    legacyApiBaseUrl: 'https://preview-backend.emurgornd.com/api',
  },
})
