import {GOVERNANCE_ENDPOINTS} from './config'
import {DRepId} from './types'
import {Fetcher, fetcher} from '@yoroi/common'

export type GovernanceApi = {
  getDRepById: (drepId: DRepId) => Promise<{txId: string; epoch: number} | null>
}

export const governanceApiMaker = ({
  networkId,
  client = fetcher,
}: {
  networkId: number
  client?: Config['client']
}) => {
  return new Api({networkId, client})
}

class Api implements GovernanceApi {
  constructor(private config: Config) {}

  async getDRepById(drepId: DRepId) {
    const {networkId, client} = this.config
    const backend = getApiConfig(networkId)

    try {
      const url = backend.getDRepById.replace('{{DREP_ID}}', drepId)
      const response = await client<GetDRepByIdResponse>({url})
      const txId = response?.registration?.tx
      const epoch = response?.registration?.epoch
      return txId && epoch ? {txId, epoch} : null
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null
      }

      throw error
    }
  }
}

const getApiConfig = (networkId: number) => {
  if (networkId === 450) return GOVERNANCE_ENDPOINTS.sanchonet
  if (networkId === 300) return GOVERNANCE_ENDPOINTS.preprod
  return GOVERNANCE_ENDPOINTS.mainnet
}

type Config = {
  networkId: number
  client: Fetcher
}

export type GetDRepByIdResponse = {
  registration?: {
    tx: string
    epoch: number
    slot: number
    deposit: string
    anchor?: {
      url?: string
      contentHash?: string
    }
  }
  deregistration?: {
    tx: string
    epoch: number
    slot: number
  }
}
