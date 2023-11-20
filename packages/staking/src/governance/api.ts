import {GOVERNANCE_ENDPOINTS} from './config'
import {DRepId} from './types'
import {Fetcher, fetcher} from '@yoroi/common/src'

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
    const backend =
      networkId !== 300
        ? GOVERNANCE_ENDPOINTS.mainnet
        : GOVERNANCE_ENDPOINTS.preprod

    const response = await client<GetDRepByIdResponse>({
      url: backend.getDRepById.replace('{{DREP_ID}}', drepId),
    })
    const txId = response.registration.tx
    const epoch = response.registration.epoch
    return {txId, epoch}
  }
}

type Config = {
  networkId: number
  client: Fetcher
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
