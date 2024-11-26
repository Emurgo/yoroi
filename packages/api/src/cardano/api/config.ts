import {Chain} from '@yoroi/types'
import {freeze} from 'immer'

export const API_ENDPOINTS: Readonly<
  Record<Chain.SupportedNetworks, {root: string; legacy: string}>
> = freeze({
  [Chain.Network.Mainnet]: {
    root: 'https://zero.yoroiwallet.com',
    legacy: 'https://api.yoroiwallet.com',
  },
  [Chain.Network.Preprod]: {
    root: 'https://yoroi-backend-zero-preprod.emurgornd.com',
    legacy: 'https://preprod-backend.yoroiwallet.com',
  },
  [Chain.Network.Preview]: {
    root: 'https://yoroi-backend-zero-preview.emurgornd.com',
    legacy: 'https://preview-backend.emurgornd.com',
  },
} as const)
