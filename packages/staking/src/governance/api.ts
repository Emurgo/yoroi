import {AxiosInstance} from 'axios'
import {GOVERNANCE_ENDPOINTS} from './config'

type BackendConfig = {
  networkId: number
  client: AxiosInstance
}

type GetDrepByIdResponse = {
  registration: {
    tx: string
    epoch: number
    slot: number
    deposit: string
    anchor?: {
      url?: string
      contentHash?: string
    }
  }
}

export const getDrepById = async (config: BackendConfig, drepId: string): Promise<GetDrepByIdResponse> => {
  const backend = config.networkId === 1 ? GOVERNANCE_ENDPOINTS.mainnet : GOVERNANCE_ENDPOINTS.preprod
  return await config.client.get(backend.getDrepById.replace('{{DREP_ID}}', drepId)).then((response) => response.data)
}

export const isRegisteredDrep = async (config: BackendConfig, drepId: string): Promise<boolean> => {
  try {
    await getDrepById(config, drepId)
    return true
  } catch {
    return false
  }
}
