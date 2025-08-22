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
      'https://yoroi-backend-zero-preprod.emurgornd.com/stakekeys/{{STAKE_KEY_HASH}}/state',
    getDRepById:
      'https://yoroi-backend-zero-preprod.emurgornd.com/dreps/{{DREP_ID}}/state',
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
