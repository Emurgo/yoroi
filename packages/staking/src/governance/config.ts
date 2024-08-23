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
  [Chain.Network.Sancho]: {
    getStakeKeyState:
      'https://yoroi-backend-zero-sanchonet.emurgornd.com/stakekeys/{{STAKE_KEY_HASH}}/state',
    getDRepById:
      'https://yoroi-backend-zero-sanchonet.emurgornd.com/dreps/{{DREP_ID}}/state',
  },
  [Chain.Network.Preview]: {
    getStakeKeyState:
      'https://yoroi-backend-zero-preview.emurgornd.com/stakekeys/{{STAKE_KEY_HASH}}/state',
    getDRepById:
      'https://yoroi-backend-zero-preview.emurgornd.com/dreps/{{DREP_ID}}/state',
  },
} as const
