import {Chain} from '@yoroi/types'

import {NetworkId} from '../../../../yoroi-wallets/types'

export function toChainSupportedNetwork(networkId: NetworkId): Chain.SupportedNetworks {
  switch (networkId) {
    case 0:
    case 1:
      return Chain.Network.Mainnet
    case 450:
      return Chain.Network.Sancho
    default:
      return Chain.Network.Preprod
  }
}
