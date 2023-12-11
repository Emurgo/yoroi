export const GOVERNANCE_ENDPOINTS = {
  mainnet: {
    getDRepById:
      'https://yoroi-backend-zero-mainnet.emurgornd.com/dreps/{{DREP_ID}}/state',
  },
  preprod: {
    getDRepById:
      'https://yoroi-backend-zero-preprod.emurgornd.com/dreps/{{DREP_ID}}/state',
  },
  sanchonet: {
    getDRepById:
      'https://dev-yoroi-backend-zero-sanchonet.emurgornd.com/dreps/{{DREP_ID}}/state',
  },
} as const
