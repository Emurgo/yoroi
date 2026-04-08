import {
  convertDrepHashToCIP105Format,
  convertDrepHashToCIP129Format,
} from '@yoroi/staking'
import {Chain} from '@yoroi/types'

export const CEXPLORER_DREP_URLS: Record<Chain.SupportedNetworks, string> = {
  [Chain.Network.Mainnet]: 'https://cexplorer.io/drep',
  [Chain.Network.Preprod]: 'https://preprod.cexplorer.io/drep',
}

export const formatDrepHashToCIP129Format = (
  hash: string,
  kind: 'script' | 'key',
): string => {
  try {
    return convertDrepHashToCIP129Format(hash, kind)
  } catch {
    return hash
  }
}
export const formatDrepHashToCIP105Format = (hash: string): string => {
  try {
    return convertDrepHashToCIP105Format(hash)
  } catch {
    return hash
  }
}
