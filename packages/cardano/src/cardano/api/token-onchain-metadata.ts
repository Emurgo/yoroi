import {Fetcher, fetcher, isArray, isRecord} from '@yoroi/common'

import {CIP25_KEY_NFT, CIP25_V2, CIP26_KEY_FT} from './constants'
import {parseFtMetadataRecord, parseNftMetadataRecord} from './parsers'
import {
  ApiFtMetadataRecord,
  ApiMetadataRecord,
  ApiNftMetadataRecord,
  ApiOnChainFtMetadataResult,
  ApiOnChainMetadataRecord,
  ApiOnChainMetadataRequest,
  ApiOnChainMetadataResponse,
  ApiOnChainNftMetadataResult,
  ApiTokenIdentity,
} from './types'
import {getTokenIdentity} from '../translators/formatters/cardano-token-id'

export const getOnChainMetadatas = (
  baseUrl: string,
  request: Fetcher = fetcher,
) => {
  return (
    tokenIds: ApiOnChainMetadataRequest,
  ): Promise<ApiOnChainMetadataResponse> => {
    if (tokenIds.length === 0) {
      return Promise.resolve({})
    }

    const assets = tokenIds.map((id) => {
      const [policy, nameHex] = id.split('.')
      return {policy, nameHex}
    })

    const payload = {assets}

    return request<ApiOnChainMetadataResponse>({
      url: `${baseUrl}/multiAsset/metadata`,
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      data: payload,
    }).then((response) => {
      if (!isRecord(response))
        return Promise.reject(new Error('Invalid asset metadatas'))
      const responseRecords = response as Record<string, unknown>
      const result: ApiOnChainMetadataResponse = {}

      for (const id of tokenIds) {
        const {policyId, name, assetName} = getTokenIdentity(id)

        // API returns with utf8 name, the request sends with hex name
        const tokenId = `${policyId}.${name}`

        const records = responseRecords[tokenId]
        if (!isArray(records)) {
          result[id] = emptyOnChainMetadataRecord
          continue
        }

        const tokenIdentity: ApiTokenIdentity = {
          policyId,
          name,
          nameHex: assetName,
        } as const
        result[id] = getMetadataResult(records, tokenIdentity)
      }

      return Promise.resolve(result)
    })
  }
}

export function getMetadataResult(
  records: Readonly<Array<unknown>>,
  tokenIdentity: Readonly<ApiTokenIdentity>,
): ApiOnChainMetadataRecord {
  let ftMetadataResult: ApiOnChainFtMetadataResult = {
    mintFtMetadata: undefined,
    mintFtRecordSelected: undefined,
  }
  let nftMetadataResult: ApiOnChainNftMetadataResult = {
    mintNftMetadata: undefined,
    mintNftRecordSelected: undefined,
  }

  for (const record of records) {
    if (!isRecord(record)) continue
    const possibleMetadatas = record as Readonly<Record<string, unknown>> // avoid casting in every usage

    if (
      possibleMetadatas?.key === CIP26_KEY_FT &&
      !ftMetadataResult.mintFtRecordSelected
    ) {
      ftMetadataResult = getFtRecord(possibleMetadatas, tokenIdentity)
      continue
    }

    if (
      possibleMetadatas?.key === CIP25_KEY_NFT &&
      !nftMetadataResult.mintNftRecordSelected
    ) {
      nftMetadataResult = getNftRecord(possibleMetadatas, tokenIdentity)
    }
  }

  return {
    ...ftMetadataResult,
    ...nftMetadataResult,
  }
}

function getFtRecord(
  record: Readonly<Record<string, unknown>> | ApiFtMetadataRecord,
  tokenIdentity: Readonly<ApiTokenIdentity>,
): ApiOnChainFtMetadataResult {
  const possibleFtMetadataRecord = findMetadataRecord(record, tokenIdentity)

  if (
    possibleFtMetadataRecord !== undefined &&
    isRecord(possibleFtMetadataRecord)
  ) {
    const parsedFtMetadataRecord = parseFtMetadataRecord(
      possibleFtMetadataRecord,
    )
    if (parsedFtMetadataRecord !== undefined) {
      return {
        // record holds original tx mint metadata is safe to cast here
        mintFtMetadata: record as ApiFtMetadataRecord,
        mintFtRecordSelected: parsedFtMetadataRecord,
      }
    }
  }
  return {
    mintFtMetadata: record,
    mintFtRecordSelected: undefined,
  }
}

function getNftRecord(
  record: Readonly<Record<string, unknown>> | ApiNftMetadataRecord,
  tokenIdentity: Readonly<ApiTokenIdentity>,
): ApiOnChainNftMetadataResult {
  const possibleNftMetadataRecord = findMetadataRecord(record, tokenIdentity)

  if (
    possibleNftMetadataRecord !== undefined &&
    isRecord(possibleNftMetadataRecord)
  ) {
    const parsedNftMetadataRecord = parseNftMetadataRecord(
      possibleNftMetadataRecord,
    )
    if (parsedNftMetadataRecord !== undefined) {
      return {
        // record holds original tx mint metadata is safe to cast here
        mintNftMetadata: record as ApiNftMetadataRecord,
        mintNftRecordSelected: parsedNftMetadataRecord,
      }
    }
  }
  return {
    mintNftMetadata: record,
    mintNftRecordSelected: undefined,
  }
}

export function findMetadataRecord(
  possibleMetadataRecord: Readonly<Record<string, unknown>>,
  tokenIdentity: Readonly<ApiTokenIdentity>,
) {
  const {policyId, name, nameHex} = tokenIdentity
  const metadataRecord = possibleMetadataRecord as Partial<ApiMetadataRecord>
  const {metadata} = metadataRecord

  if (!isRecord(metadata)) return undefined

  const {version, ...policyRecords} = metadata
  const isV2 = version === CIP25_V2

  const assetRecords = policyRecords[policyId]
  if (!isRecord(assetRecords)) return undefined

  return isV2 ? assetRecords[nameHex] : assetRecords[name]
}

export const emptyOnChainMetadataRecord: Readonly<ApiOnChainMetadataRecord> = {
  mintFtMetadata: undefined,
  mintFtRecordSelected: undefined,
  mintNftMetadata: undefined,
  mintNftRecordSelected: undefined,
} as const
