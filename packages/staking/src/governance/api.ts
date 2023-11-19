import {AxiosInstance} from 'axios'
import {GOVERNANCE_ENDPOINTS} from './config'

type BackendConfig = {
  networkId: number
  client: AxiosInstance
}

type GetDRepByIdResponse = {
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

export const getDRepById = async (
  config: BackendConfig,
  drepId: string,
): Promise<GetDRepByIdResponse> => {
  const backend =
    config.networkId === 1
      ? GOVERNANCE_ENDPOINTS.mainnet
      : GOVERNANCE_ENDPOINTS.preprod
  return await config.client
    .get(backend.getDRepById.replace('{{DREP_ID}}', drepId))
    .then((response) => response.data)
}

// TODO: Add these as an API class, so that we can mock it in tests
export const isRegisteredDRep = async (
  config: BackendConfig,
  drepId: string,
): Promise<boolean> => {
  try {
    await getDRepById(config, drepId)
    return true
  } catch {
    return false
  }
}
