/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from 'lodash'

import assert from '../../../legacy/assert'
import fetchDefault, {checkedFetch} from '../../../legacy/fetch'
import {Logger} from '../../../legacy/logging'
import type {
  AccountStateRequest,
  AccountStateResponse,
  BackendConfig,
  CurrencySymbol,
  FundInfoResponse,
  PoolInfoRequest,
  PriceResponse,
  RawTransaction,
  StakePoolInfosAndHistories,
  TipStatusResponse,
  TxHistoryRequest,
  TxStatusRequest,
  TxStatusResponse,
} from '../../types'
import {NFTAsset, RemoteAsset, YoroiNft, YoroiNftModerationStatus} from '../../types'
import {filterArray, hasProperties, isArray, isObject, isRecord} from '../../utils/parsing'
import {ServerStatus} from '..'
import {ApiError} from '../errors'
import {convertNft} from '../nfts'
import {fallbackTokenInfo, tokenInfo, toTokenSubject} from './utils'

type Addresses = Array<string>

export const checkServerStatus = (config: BackendConfig): Promise<ServerStatus> =>
  fetchDefault('status', null, config, 'GET') as any

export const getTipStatus = (config: BackendConfig): Promise<TipStatusResponse> =>
  fetchDefault('v2/tipStatus', null, config, 'GET') as unknown as Promise<TipStatusResponse>

export const fetchNewTxHistory = async (
  request: TxHistoryRequest,
  config: BackendConfig,
): Promise<{isLast: boolean; transactions: Array<RawTransaction>}> => {
  assert.preconditionCheck(
    request.addresses.length <= config.TX_HISTORY_MAX_ADDRESSES,
    'fetchNewTxHistory: too many addresses',
  )
  const transactions = (await fetchDefault('v2/txs/history', request, config)) as Array<RawTransaction>

  return {
    transactions,
    isLast: transactions.length < config.TX_HISTORY_RESPONSE_LIMIT,
  }
}

export const filterUsedAddresses = async (addresses: Addresses, config: BackendConfig): Promise<Addresses> => {
  assert.preconditionCheck(
    addresses.length <= config.FILTER_USED_MAX_ADDRESSES,
    'filterUsedAddresses: too many addresses',
  )
  // Take a copy in case underlying data mutates during await
  const copy = [...addresses]
  const used: any = await fetchDefault('v2/addresses/filterUsed', {addresses: copy}, config)
  // We need to do this so that we keep original order of addresses
  return copy.filter((addr) => used.includes(addr))
}

export const submitTransaction = (signedTx: string, config: BackendConfig) => {
  return fetchDefault('txs/signed', {signedTx}, config)
}

export const getTransactions = async (
  txids: Array<string>,
  config: BackendConfig,
): Promise<Record<string, RawTransaction>> => {
  const txs = await fetchDefault('v2/txs/get', {txHashes: txids}, config)
  const entries: Array<[string, RawTransaction]> = Object.entries(txs)

  return Object.fromEntries(entries)
}

export const getAccountState = (request: AccountStateRequest, config: BackendConfig): Promise<AccountStateResponse> => {
  assert.preconditionCheck(
    request.addresses.length <= config.FETCH_UTXOS_MAX_ADDRESSES,
    'getAccountState: too many addresses',
  )
  return fetchDefault('account/state', request, config)
}

export const bulkGetAccountState = async (
  addresses: Addresses,
  config: BackendConfig,
): Promise<AccountStateResponse> => {
  const chunks = _.chunk(addresses, config.FETCH_UTXOS_MAX_ADDRESSES)
  const responses = await Promise.all(chunks.map((addrs) => getAccountState({addresses: addrs}, config)))
  return Object.assign({}, ...responses)
}

export const getPoolInfo = (request: PoolInfoRequest, config: BackendConfig): Promise<StakePoolInfosAndHistories> => {
  return fetchDefault('pool/info', request, config)
}

export const getNFTs = async (assets: RemoteAsset[], config: BackendConfig): Promise<YoroiNft[]> => {
  const request = {assets: assets.map((asset) => ({nameHex: asset.name, policy: asset.policyId}))}
  const response = await fetchDefault('multiAsset/metadata', request, config)
  return parseNFTs(response, config.NFT_STORAGE_URL)
}

export const getNFTModerationStatus = async (
  fingerprint: string,
  config: BackendConfig,
): Promise<YoroiNftModerationStatus> => {
  return fetchDefault('multiAsset/validateNFT/' + fingerprint, {envName: 'prod'}, config, 'POST', {
    checkResponse: async (response): Promise<YoroiNftModerationStatus> => {
      if (response.status === 202) {
        return 'pending'
      }
      const json = await response.json()
      const status = json?.status
      const parsedStatus = parseModerationStatus(status)
      if (parsedStatus) {
        return parsedStatus
      }
      throw new Error(`Invalid server response "${status}"`)
    },
  })
}

export const getTokenInfo = async (tokenId: string, apiUrl: string) => {
  const response = await checkedFetch({
    endpoint: `${apiUrl}/${toTokenSubject(tokenId)}`,
    method: 'GET',
    payload: undefined,
  }).catch((error) => {
    Logger.error(error)

    return undefined
  })

  const entry = parseTokenRegistryEntry(response)

  return entry ? tokenInfo(entry) : fallbackTokenInfo(tokenId)
}

export const getFundInfo = (config: BackendConfig, isMainnet: boolean): Promise<FundInfoResponse> => {
  const prefix = isMainnet ? '' : 'api/'
  return fetchDefault(`${prefix}v0/catalyst/fundInfo/`, null, config, 'GET') as any
}

export const fetchTxStatus = (request: TxStatusRequest, config: BackendConfig): Promise<TxStatusResponse> => {
  return fetchDefault('tx/status', request, config)
}

export const fetchCurrentPrice = async (currency: CurrencySymbol, config: BackendConfig): Promise<number> => {
  const response = (await fetchDefault('price/ADA/current', null, config, 'GET')) as unknown as PriceResponse

  if (response.error) throw new ApiError(response.error)

  return response.ticker.prices[currency]
}

// Token Registry
// 721: https://github.com/cardano-foundation/cardano-token-registry#semantic-content-of-registry-entries
export type TokenRegistryEntry = {
  subject: string
  name: Property<string>

  description?: Property<string>
  policy?: string
  logo?: Property<string>
  ticker?: Property<string>
  url?: Property<string>
  decimals?: Property<number>
}

type Signature = {
  publicKey: string
  signature: string
}

type Property<T> = {
  signatures: Array<Signature>
  sequenceNumber: number
  value: T | undefined
}

const parseTokenRegistryEntry = (data: unknown) => {
  return isTokenRegistryEntry(data) ? data : undefined
}

const isTokenRegistryEntry = (data: unknown): data is TokenRegistryEntry => {
  const candidate = data as TokenRegistryEntry

  return (
    !!candidate &&
    typeof candidate === 'object' &&
    'subject' in candidate &&
    typeof candidate.subject === 'string' &&
    'name' in candidate &&
    !!candidate.name &&
    typeof candidate.name === 'object' &&
    'value' in candidate.name &&
    candidate.name.value === 'string'
  )
}

export const parseModerationStatus = (status: unknown): YoroiNftModerationStatus | undefined => {
  const statusString = String(status)
  const map = {
    RED: 'blocked',
    YELLOW: 'consent',
    GREEN: 'approved',
    PENDING: 'pending',
    MANUAL_REVIEW: 'manual_review',
  } as const
  return map[statusString.toUpperCase() as keyof typeof map]
}

function parseNFTs(value: unknown, storageUrl: string): YoroiNft[] {
  if (!isRecord(value)) {
    throw new Error('Invalid response. Expected to receive object when parsing NFTs')
  }

  const values = Object.values(value)

  const assets = values.map((arrayWithAtLeastOneAsset) => {
    if (!isArray(arrayWithAtLeastOneAsset)) {
      throw new Error('Invalid response. Expected object value to be an array when parsing NFTs')
    }

    if (arrayWithAtLeastOneAsset.length === 0) {
      throw new Error(
        'Invalid response. Expected object value to be an array with at least one element when parsing NFTs',
      )
    }

    return arrayWithAtLeastOneAsset[0]
  })
  const nftAssets = filterArray(assets, isAssetNFT)
  return nftAssets.map((nft) => convertNft(nft.metadata, storageUrl))
}

function isAssetNFT(asset: unknown): asset is NFTAsset {
  return isObject(asset) && hasProperties(asset, ['key']) && asset.key === NFT_METADATA_KEY
}

const NFT_METADATA_KEY = '721'
