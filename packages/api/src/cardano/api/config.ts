import {Chain} from '@yoroi/types'

export const API_ENDPOINTS: Readonly<
  Record<Chain.SupportedNetworks, {root: string}>
> = {
  mainnet: {
    root: 'https://zero.yoroiwallet.com',
  },
  preprod: {
    root: 'https://yoroi-backend-zero-preprod.emurgornd.com',
  },
  sancho: {
    root: 'https://yoroi-backend-zero-sanchonet.emurgornd.com',
  },
} as const
