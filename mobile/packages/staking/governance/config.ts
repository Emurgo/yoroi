import {Chain} from '@yoroi/types'

export const GOVERNANCE_ENDPOINTS: Readonly<
  Record<
    Chain.SupportedNetworks,
    {
      getStakeKeyState: string
      getDRepById: string
    }
  >
> = {
  [Chain.Network.Mainnet]: {
    getStakeKeyState:
      'https://zero.yoroiwallet.com/stakekeys/{{STAKE_KEY_HASH}}/state',
    getDRepById: 'https://zero.yoroiwallet.com/dreps/{{DREP_ID}}/state',
  },
  [Chain.Network.Preprod]: {
    getStakeKeyState:
      'https://yoroi-backend-zero-preprod-prod.emurgornd.com/stakekeys/{{STAKE_KEY_HASH}}/state',
    getDRepById:
      'https://yoroi-backend-zero-preprod-prod.emurgornd.com/dreps/{{DREP_ID}}/state',
  },
  [Chain.Network.Preview]: {
    getStakeKeyState:
      'https://yoroi-backend-zero-preview.emurgornd.com/stakekeys/{{STAKE_KEY_HASH}}/state',
    getDRepById:
      'https://yoroi-backend-zero-preview.emurgornd.com/dreps/{{DREP_ID}}/state',
  },
} as const

// NOTE: bech32 'drep1ygr9tuapcanc3kpeyy4dc3vmrz9cfe5q7v9wj3x9j0ap3tswtre9j'
// HASH: 0655f3a1c76788d839212adc459b188b84e680f30ae944c593fa18ae
// CIP-129 HEX: 220655f3a1c76788d839212adc459b188b84e680f30ae944c593fa18ae
export const GOVERNANCE_YOROI_DREP_ID_HEX =
  '0655f3a1c76788d839212adc459b188b84e680f30ae944c593fa18ae'

// NOTE: Top Yoroi stake pool ID for mainnet
// This should be configured based on the current top-performing Yoroi pool
export const YOROI_TOP_STAKE_POOL_ID =
  'pool1pux7lyzvx89q5dz4dv2kkjdpjdzysf30plmk0vc60x4w0hq8j5p' // TODO: Update with actual Yoroi pool ID
