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
export const GOVERNANCE_YOROI_DREP_ID_HEX_MAINNET =
  '0655f3a1c76788d839212adc459b188b84e680f30ae944c593fa18ae'

// NOTE: bech32 'drep1y23nc498g205wtvp9esysyxam0n7msusm5d734xqlzhvkgq3pn5r7'
// HASH: a33c54a7429f472d812e604810dddbe7edc390dd1be8d4c0f8aecb20
// CIP-129 HEX: 22a33c54a7429f472d812e604810dddbe7edc390dd1be8d4c0f8aecb20
export const GOVERNANCE_YOROI_DREP_ID_HEX_PREPROD =
  'a33c54a7429f472d812e604810dddbe7edc390dd1be8d4c0f8aecb20'

// NOTE: Preview network uses the same DRep ID as Preprod
export const GOVERNANCE_YOROI_DREP_ID_HEX_PREVIEW =
  'a33c54a7429f472d812e604810dddbe7edc390dd1be8d4c0f8aecb20'

/**
 * Network-specific Yoroi DRep ID hex hashes
 * Use this object for direct property access: governanceYoroiDrepIdHex[network]
 */
export const governanceYoroiDrepIdHex: Readonly<
  Record<Chain.SupportedNetworks, string>
> = {
  [Chain.Network.Mainnet]: GOVERNANCE_YOROI_DREP_ID_HEX_MAINNET,
  [Chain.Network.Preprod]: GOVERNANCE_YOROI_DREP_ID_HEX_PREPROD,
  [Chain.Network.Preview]: GOVERNANCE_YOROI_DREP_ID_HEX_PREVIEW,
} as const

/**
 * Get the Yoroi DRep ID hex hash based on network
 * @param network - The network (Mainnet, Preprod, or Preview)
 * @returns The hex hash of the Yoroi DRep ID for the given network
 */
export const getYoroiDrepIdHex = (network: Chain.SupportedNetworks): string => {
  return governanceYoroiDrepIdHex[network]
}

// Legacy export for backward compatibility
export const GOVERNANCE_YOROI_DREP_ID_HEX = GOVERNANCE_YOROI_DREP_ID_HEX_MAINNET

// NOTE: Top Yoroi stake pool ID for mainnet
// This should be configured based on the current top-performing Yoroi pool
export const YOROI_TOP_STAKE_POOL_ID =
  'pool1pux7lyzvx89q5dz4dv2kkjdpjdzysf30plmk0vc60x4w0hq8j5p' // TODO: Update with actual Yoroi pool ID
