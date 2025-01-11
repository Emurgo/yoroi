import {convertDrepHashToCIP129Format} from '@yoroi/staking'

export const formatDrepHash = (hash: string, kind: 'script' | 'key'): string => {
  try {
    return convertDrepHashToCIP129Format(hash, kind)
  } catch (e) {
    console.log('errorr', e)
    return hash
  }
}
