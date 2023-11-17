import axios from 'axios'

export const GOVERNANCE_ENDPOINTS = {
  mainnet: {
    getDrepById: 'https://dev-yoroi-backend-zero-sanchonet.emurgornd.com/dreps/{{DREP_ID}}/state',
  },
  preprod: {
    getDrepById: 'https://dev-yoroi-backend-zero-sanchonet.emurgornd.com/dreps/{{DREP_ID}}/state',
  },
} as const

export const axiosClient = axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})
