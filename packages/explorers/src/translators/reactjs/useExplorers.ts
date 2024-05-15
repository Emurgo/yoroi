import {Chain} from '@yoroi/types'

import {explorerManager} from '../../explorer-manager'

export function useExplorers(network: Chain.SupportedNetworks) {
  return explorerManager[network]
}
