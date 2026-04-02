import {Chain} from '@yoroi/types'

import {
  GOVERNANCE_ENDPOINTS,
  GOVERNANCE_YOROI_DREP_ID_HEX,
  GOVERNANCE_YOROI_DREP_ID_HEX_MAINNET,
  GOVERNANCE_YOROI_DREP_ID_HEX_PREPROD,
  getYoroiDrepIdHex,
} from './config'

describe('governance config', () => {
  it('should have correct GOVERNANCE_ENDPOINTS for Mainnet', () => {
    expect(GOVERNANCE_ENDPOINTS[Chain.Network.Mainnet]).toEqual({
      getStakeKeyState:
        'https://zero.yoroiwallet.com/stakekeys/{{STAKE_KEY_HASH}}/state',
      getDRepById: 'https://zero.yoroiwallet.com/dreps/{{DREP_ID}}/state',
      getActiveDreps: 'https://zero.yoroiwallet.com/dreps/active',
    })
  })

  it('should have correct GOVERNANCE_ENDPOINTS for Preprod', () => {
    expect(GOVERNANCE_ENDPOINTS[Chain.Network.Preprod]).toEqual({
      getStakeKeyState:
        'https://yoroi-backend-zero-preprod-prod.emurgornd.com/stakekeys/{{STAKE_KEY_HASH}}/state',
      getDRepById:
        'https://yoroi-backend-zero-preprod-prod.emurgornd.com/dreps/{{DREP_ID}}/state',
      getActiveDreps:
        'https://yoroi-backend-zero-preprod-prod.emurgornd.com/dreps/active',
    })
  })

  it('should have correct GOVERNANCE_YOROI_DREP_ID_HEX (legacy)', () => {
    expect(GOVERNANCE_YOROI_DREP_ID_HEX).toBe(
      '0655f3a1c76788d839212adc459b188b84e680f30ae944c593fa18ae',
    )
  })

  it('should have correct GOVERNANCE_YOROI_DREP_ID_HEX_MAINNET', () => {
    expect(GOVERNANCE_YOROI_DREP_ID_HEX_MAINNET).toBe(
      '0655f3a1c76788d839212adc459b188b84e680f30ae944c593fa18ae',
    )
  })

  it('should have correct GOVERNANCE_YOROI_DREP_ID_HEX_PREPROD', () => {
    expect(GOVERNANCE_YOROI_DREP_ID_HEX_PREPROD).toBe(
      'a33c54a7429f472d812e604810dddbe7edc390dd1be8d4c0f8aecb20',
    )
  })

  it('should return correct DRep ID for Mainnet', () => {
    expect(getYoroiDrepIdHex(Chain.Network.Mainnet)).toBe(
      GOVERNANCE_YOROI_DREP_ID_HEX_MAINNET,
    )
  })

  it('should return correct DRep ID for Preprod', () => {
    expect(getYoroiDrepIdHex(Chain.Network.Preprod)).toBe(
      GOVERNANCE_YOROI_DREP_ID_HEX_PREPROD,
    )
  })
})
