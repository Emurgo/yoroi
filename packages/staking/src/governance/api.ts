import {Chain} from '@yoroi/types'
import {GOVERNANCE_ENDPOINTS} from './config'
import {DRepId} from './types'
import {Fetcher, fetcher} from '@yoroi/common'

export type GovernanceApi = {
  getDRepById: (drepId: DRepId) => Promise<{txId: string; epoch: number} | null>
  getStakingKeyState: (
    stakeKeyHash: string,
  ) => Promise<GetStakingKeyStateResponse>
}

export const governanceApiMaker = ({
  network,
  client = fetcher,
}: {
  network: Chain.SupportedNetworks
  client?: Config['client']
}) => {
  return new Api({network, client})
}

class Api implements GovernanceApi {
  constructor(private config: Config) {}

  async getDRepById(drepId: DRepId) {
    const {network, client} = this.config
    const backend = getApiConfig(network)

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

  async getStakingKeyState(stakeKeyHash: string) {
    const {network, client} = this.config
    const backend = getApiConfig(network)
    const url = backend.getStakeKeyState.replace(
      '{{STAKE_KEY_HASH}}',
      stakeKeyHash,
    )
    try {
      const {drepDelegation} = await client<GetStakingKeyStateResponse>({
        url,
      })
      return {drepDelegation}
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return {}
      }

      throw error
    }
  }
}

const getApiConfig = (network: Chain.SupportedNetworks) => {
  return GOVERNANCE_ENDPOINTS[network]
}

type Config = {
  network: Chain.SupportedNetworks
  client: Fetcher
}

type GetStakingKeyStateResponse = {
  drepDelegation?: {
    tx: string
    epoch: number
    slot: number
    drep: 'no_confidence' | 'abstain' | string // string refers to DRepId
  }
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
