import {Chain} from '@yoroi/types'

export const GOVERNANCE_ENDPOINTS: Readonly<
  Record<
    Chain.SupportedNetworks,
    {
      getStakeKeyState: string
      getDRepById: string
      getActiveDreps: string
    }
  >
> = {
  [Chain.Network.Mainnet]: {
    getStakeKeyState:
      'https://zero.yoroiwallet.com/stakekeys/{{STAKE_KEY_HASH}}/state',
    getDRepById: 'https://zero.yoroiwallet.com/dreps/{{DREP_ID}}/state',
    getActiveDreps: 'https://zero.yoroiwallet.com/dreps/active',
  },
  [Chain.Network.Preprod]: {
    getStakeKeyState:
      'https://yoroi-backend-zero-preprod-prod.emurgornd.com/stakekeys/{{STAKE_KEY_HASH}}/state',
    getDRepById:
      'https://yoroi-backend-zero-preprod-prod.emurgornd.com/dreps/{{DREP_ID}}/state',
    getActiveDreps:
      'https://yoroi-backend-zero-preprod.emurgornd.com/dreps/active',
  },
} as const

// Mainnet Yoroi DRep ID
// bech32: drep1ygr9tuapcanc3kpeyy4dc3vmrz9cfe5q7v9wj3x9j0ap3tswtre9j
export const GOVERNANCE_YOROI_DREP_ID_HEX_MAINNET =
  '0655f3a1c76788d839212adc459b188b84e680f30ae944c593fa18ae'

// Preprod Yoroi DRep ID
// bech32: drep1y23nc498g205wtvp9esysyxam0n7msusm5d734xqlzhvkgq3pn5r7
export const GOVERNANCE_YOROI_DREP_ID_HEX_PREPROD =
  'a33c54a7429f472d812e604810dddbe7edc390dd1be8d4c0f8aecb20'

/**
 * Get the Yoroi DRep ID hex hash based on network
 * @param network - The network (Mainnet or Preprod)
 * @returns The hex hash of the Yoroi DRep ID for the given network
 */
export const getYoroiDrepIdHex = (network: Chain.SupportedNetworks): string => {
  switch (network) {
    case Chain.Network.Mainnet:
      return GOVERNANCE_YOROI_DREP_ID_HEX_MAINNET
    case Chain.Network.Preprod:
      return GOVERNANCE_YOROI_DREP_ID_HEX_PREPROD
    default:
      return GOVERNANCE_YOROI_DREP_ID_HEX_PREPROD
  }
}

// Legacy export for backward compatibility
export const GOVERNANCE_YOROI_DREP_ID_HEX = GOVERNANCE_YOROI_DREP_ID_HEX_MAINNET
