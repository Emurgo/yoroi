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
  name: string
  imageUrl: string
  objectives: string
  motivations: string
  qualifications: string
  socialMedia: string
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

    const response = await request<unknown>({url})

    if (isLeft(response)) {
      return response
    }

    const {data, status} = response.value
    const sanitized = sanitizeActiveDreps(data)

    return {
      tag: 'right',
      value: {status, data: sanitized},
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

const sanitizeActiveDrep = (raw: unknown): ActiveDRepEntry | null => {
  if (raw === null || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>

  const id = typeof r['id'] === 'string' ? r['id'] : ''
  const from =
    r['from'] === 'verificationKey' || r['from'] === 'scriptHash'
      ? r['from']
      : 'verificationKey'
  const stake = typeof r['stake'] === 'number' ? r['stake'] : 0
  const mandateEpoch =
    typeof r['mandateEpoch'] === 'number' ? r['mandateEpoch'] : 0
  const deposit = typeof r['deposit'] === 'number' ? r['deposit'] : 0
  const delegatorCount =
    typeof r['delegatorCount'] === 'number' ? r['delegatorCount'] : 0
  const registeredDate =
    typeof r['registeredDate'] === 'string' ? r['registeredDate'] : ''
  const metadataHash =
    typeof r['metadataHash'] === 'string' ? r['metadataHash'] : ''
  const metadataVerification =
    typeof r['metadataVerification'] === 'string'
      ? r['metadataVerification']
      : ''
  const type = typeof r['type'] === 'string' ? r['type'] : ''

  const metadata =
    r['metadata'] !== null && typeof r['metadata'] === 'object'
      ? (r['metadata'] as Record<string, unknown>)
      : {}

  const givenNameRaw = metadata['givenName']
  const name =
    typeof givenNameRaw === 'string'
      ? givenNameRaw
      : givenNameRaw !== null &&
          typeof givenNameRaw === 'object' &&
          typeof (givenNameRaw as Record<string, unknown>)['@value'] === 'string'
        ? ((givenNameRaw as Record<string, unknown>)['@value'] as string)
        : ''

  const imageRaw =
    metadata['image'] !== null && typeof metadata['image'] === 'object'
      ? (metadata['image'] as Record<string, unknown>)
      : {}
  const imageUrl =
    typeof imageRaw['contentUrl'] === 'string' ? imageRaw['contentUrl'] : ''

  // CIP-119 body fields may be nested under 'body' or flat in metadata
  const body =
    metadata['body'] !== null && typeof metadata['body'] === 'object'
      ? (metadata['body'] as Record<string, unknown>)
      : metadata
  const objectives =
    typeof body['objectives'] === 'string' ? body['objectives'] : ''
  const motivations =
    typeof body['motivations'] === 'string' ? body['motivations'] : ''
  const qualifications =
    typeof body['qualifications'] === 'string' ? body['qualifications'] : ''

  // Social media: first Link URI from references array
  const referencesRaw = body['references'] ?? metadata['references']
  const socialMedia = extractFirstLinkUri(referencesRaw)

  if (!id) return null

  return {
    id,
    from,
    stake,
    mandateEpoch,
    deposit,
    delegatorCount,
    registeredDate,
    metadataHash,
    metadataVerification,
    type,
    name,
    imageUrl,
    objectives,
    motivations,
    qualifications,
    socialMedia,
  }
}

const extractFirstLinkUri = (raw: unknown): string => {
  if (!Array.isArray(raw)) return ''
  for (const item of raw) {
    if (item === null || typeof item !== 'object') continue
    const entry = item as Record<string, unknown>
    if (typeof entry['uri'] === 'string' && entry['uri']) return entry['uri']
  }
  return ''
}

const sanitizeActiveDreps = (raw: unknown): ActiveDRepEntry[] => {
  if (!Array.isArray(raw)) return []
  return raw.reduce<ActiveDRepEntry[]>((acc, item) => {
    const entry = sanitizeActiveDrep(item)
    if (entry !== null) acc.push(entry)
    return acc
  }, [])
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
