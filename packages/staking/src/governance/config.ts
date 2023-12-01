export const GOVERNANCE_ENDPOINTS = {
  mainnet: {
    getDRepById:
      'https://dev-yoroi-backend-zero-sanchonet.emurgornd.com/dreps/{{DREP_ID}}/state',
  },
  preprod: {
    getDRepById:
      'https://dev-yoroi-backend-zero-sanchonet.emurgornd.com/dreps/{{DREP_ID}}/state',
  },
} as const
