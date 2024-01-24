export const GOVERNANCE_ENDPOINTS = {
  mainnet: {
    getStakeKeyState:
      'https://yoroi-backend-zero-mainnet.emurgornd.com/stakekeys/{{STAKE_KEY_HASH}}/state',
    getDRepById:
      'https://yoroi-backend-zero-mainnet.emurgornd.com/dreps/{{DREP_ID}}/state',
  },
  preprod: {
    getStakeKeyState:
      'https://yoroi-backend-zero-preprod.emurgornd.com/stakekeys/{{STAKE_KEY_HASH}}/state',

    getDRepById:
      'https://yoroi-backend-zero-preprod.emurgornd.com/dreps/{{DREP_ID}}/state',
  },
  sanchonet: {
    getStakeKeyState:
      'https://yoroi-backend-zero-sanchonet.emurgornd.com/stakekeys/{{STAKE_KEY_HASH}}/state',
    getDRepById:
      'https://yoroi-backend-zero-sanchonet.emurgornd.com/dreps/{{DREP_ID}}/state',
  },
} as const
