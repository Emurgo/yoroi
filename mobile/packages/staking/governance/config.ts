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
export const governanceYoroiDrepIdHex: Readonly<
  Record<Chain.SupportedNetworks, string>
> = {
  [Chain.Network.Mainnet]:
    '0655f3a1c76788d839212adc459b188b84e680f30ae944c593fa18ae',
  [Chain.Network.Preprod]:
    'a33c54a7429f472d812e604810dddbe7edc390dd1be8d4c0f8aecb20',
  [Chain.Network.Preview]:
    'a33c54a7429f472d812e604810dddbe7edc390dd1be8d4c0f8aecb20',
} as const
