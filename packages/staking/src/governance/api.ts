import {AxiosInstance} from 'axios'
import {axiosClient, GOVERNANCE_ENDPOINTS} from './config'

export type GovernanceApi = {
  getDRepById: (drepId: string) => Promise<{txId: string}>
  isRegisteredDRep: (drepId: string) => Promise<boolean>
}

export const initApi = ({
  networkId,
  client = axiosClient,
}: {
  networkId: number
  client?: Config['client']
}) => {
  return new Api({networkId, client})
}

class Api implements GovernanceApi {
  constructor(private config: Config) {}

  async getDRepById(drepId: string) {
    const {networkId, client} = this.config
    const backend =
      networkId === 1
        ? GOVERNANCE_ENDPOINTS.mainnet
        : GOVERNANCE_ENDPOINTS.preprod

    const response = await client.get<GetDRepByIdResponse>(
      backend.getDRepById.replace('{{DREP_ID}}', drepId),
    )

    return {txId: response.data.registration.tx}
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
