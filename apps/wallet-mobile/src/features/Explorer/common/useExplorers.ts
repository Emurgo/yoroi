import {Chain} from '@yoroi/types'

import {explorersConfig} from './constants'

export function useExplorers(network: Chain.SupportedNetworks) {
  return explorersConfig[network]
}
