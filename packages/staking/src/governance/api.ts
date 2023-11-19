import {AxiosInstance} from 'axios'
import {GOVERNANCE_ENDPOINTS} from './config'

export type GovernanceApi = {
  getDRepById: (drepId: string) => Promise<GetDRepByIdResponse>
  isRegisteredDRep: (drepId: string) => Promise<boolean>
}

export const initApi = (config: Config) => {
  return new Api(config)
}

class Api implements GovernanceApi {
  constructor(private config: Config) {}

  async getDRepById(drepId: string): Promise<GetDRepByIdResponse> {
    const {networkId, client} = this.config
    const backend =
      networkId === 1
        ? GOVERNANCE_ENDPOINTS.mainnet
        : GOVERNANCE_ENDPOINTS.preprod

    return await client
      .get(backend.getDRepById.replace('{{DREP_ID}}', drepId))
      .then((response) => response.data)
  }

  async isRegisteredDRep(drepId: string): Promise<boolean> {
    try {
      await this.getDRepById(drepId)
      return true
    } catch {
      return false
    }
  }
}

type Config = {
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
