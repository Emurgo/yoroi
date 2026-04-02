import {FetchData, fetchData, isLeft} from '@yoroi/common'
import {Api, Chain} from '@yoroi/types'

import {GOVERNANCE_ENDPOINTS} from './config'
import {DRepId} from './types'

export type ActiveDRepEntry = {
  type: string
  from: 'verificationKey' | 'scriptHash'
  id: string
  stake: number
  mandateEpoch: number
  deposit: number
  delegatorCount: number
  registeredDate: string
  metadataHash: string
  metadataVerification: string
}

export type GovernanceApi = {
  getDRepById: (
    drepId: DRepId,
  ) => Promise<Api.Response<{txId: string; epoch: number} | null>>
  getStakingKeyState: (
    stakeKeyHash: string,
  ) => Promise<Api.Response<GetStakingKeyStateResponse>>
  getActiveDreps: (
    page: number,
    pageSize: number,
  ) => Promise<Api.Response<ActiveDRepEntry[]>>
}

export const governanceApiMaker = ({
  network,
  request = fetchData,
}: {
  network: Chain.SupportedNetworks
  request?: FetchData
}) => {
  return new GovernanceApiImpl({network, request})
}

class GovernanceApiImpl implements GovernanceApi {
  constructor(private config: Config) {}

  async getDRepById(
    drepId: DRepId,
  ): Promise<Api.Response<{txId: string; epoch: number} | null>> {
    const {network, request} = this.config
    const backend = getApiConfig(network)
    const url = backend.getDRepById.replace('{{DREP_ID}}', drepId)

    const response = await request<GetDRepByIdResponse>({url})

    if (isLeft(response)) {
      return response
    }

    const {data, status} = response.value
    const txId = data?.registration?.tx
    const epoch = data?.registration?.epoch

    return {
      tag: 'right',
      value: {
        status,
        data: txId && epoch ? {txId, epoch} : null,
      },
    } as const
  }

  async getActiveDreps(
    page: number,
    pageSize: number,
  ): Promise<Api.Response<ActiveDRepEntry[]>> {
    const {network, request} = this.config
    const backend = getApiConfig(network)
    const url = `${backend.getActiveDreps}?pageSize=${pageSize}&page=${page}`

    const response = await request<ActiveDRepEntry[]>({url})

    if (isLeft(response)) {
      return response
    }

    const {data, status} = response.value

    return {
      tag: 'right',
      value: {status, data: data ?? []},
    } as const
  }

  async getStakingKeyState(
    stakeKeyHash: string,
  ): Promise<Api.Response<GetStakingKeyStateResponse>> {
    const {network, request} = this.config
    const backend = getApiConfig(network)
    const url = backend.getStakeKeyState.replace(
      '{{STAKE_KEY_HASH}}',
      stakeKeyHash,
    )

    const response = await request<GetStakingKeyStateResponse>({url})

    if (isLeft(response)) {
      return response
    }

    const {data, status} = response.value

    if (data == null) {
      return {
        tag: 'right',
        value: {status, data: {}},
      } as const
    }

    return {
      tag: 'right',
      value: {status, data},
    } as const
  }
}

const getApiConfig = (network: Chain.SupportedNetworks) => {
  return GOVERNANCE_ENDPOINTS[network]
}

type Config = {
  network: Chain.SupportedNetworks
  request: FetchData
}

type GetStakingKeyStateResponse = {
  drepDelegation?: {
    tx: string
    epoch: number
    slot: number
    drep: 'no_confidence' | 'abstain' | string // string refers to DRepId
    drepKind?: 'scripthash' | 'keyhash'
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
