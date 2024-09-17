import {Chain} from '@yoroi/types'

export function toChainSupportedNetwork(legacyNetworkId: number): Chain.SupportedNetworks {
  switch (legacyNetworkId) {
    case 0:
    case 1:
      return Chain.Network.Mainnet
    case 450:
      return Chain.Network.Sancho
    default:
      return Chain.Network.Preprod
  }
}
