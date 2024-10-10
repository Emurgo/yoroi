import {Chain} from '@yoroi/types'
import {freeze} from 'immer'

export const API_ENDPOINTS: Readonly<
  Record<Chain.SupportedNetworks, {root: string}>
> = freeze({
  [Chain.Network.Mainnet]: {
    root: 'https://zero.yoroiwallet.com',
  },
  [Chain.Network.Preprod]: {
    root: 'https://yoroi-backend-zero-preprod.emurgornd.com',
  },
  [Chain.Network.Sancho]: {
    root: 'https://yoroi-backend-zero-sanchonet.emurgornd.com',
  },
  [Chain.Network.Preview]: {
    root: 'https://yoroi-backend-zero-preview.emurgornd.com',
  },
} as const)
