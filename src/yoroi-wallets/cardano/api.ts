/* eslint-disable @typescript-eslint/no-explicit-any */
import _ from 'lodash'

import assert from '../../legacy/assert'
import {ApiError} from '../../legacy/errors'
import fetchDefault, {checkedFetch} from '../../legacy/fetch'
import {getAssetFingerprint} from '../../legacy/format'
import {ServerStatus} from '..'
import {
  CardanoAssetMetadata,
  MultiAssetRequest,
  NFTMetadata,
  StakePoolInfosAndHistories,
  YoroiNFT,
  YoroiNFTModerationStatus,
} from '../types'
import type {
  AccountStateRequest,
  AccountStateResponse,
  BackendConfig,
  CurrencySymbol,
  FundInfoResponse,
  PoolInfoRequest,
  PriceResponse,
  RawTransaction,
  RawUtxo,
  TipStatusResponse,
  TokenInfoRequest,
  TokenInfoResponse,
  TxHistoryRequest,
  TxStatusRequest,
  TxStatusResponse,
} from '../types/other'
import {asciiToHex, parseModerationStatus} from '../utils/parsing'

type Addresses = Array<string>

export const checkServerStatus = (config: BackendConfig): Promise<ServerStatus> =>
  fetchDefault('status', null, config, 'GET') as any

export const getTipStatus = async (config: BackendConfig): Promise<TipStatusResponse> =>
  fetchDefault('v2/tipStatus', null, config, 'GET') as unknown as TipStatusResponse

export const fetchNewTxHistory = async (
  request: TxHistoryRequest,
  config: BackendConfig,
): Promise<{isLast: boolean; transactions: Array<RawTransaction>}> => {
  assert.preconditionCheck(
    request.addresses.length <= config.TX_HISTORY_MAX_ADDRESSES,
    'fetchNewTxHistory: too many addresses',
  )
  const response = (await fetchDefault('v2/txs/history', request, config)) as Array<RawTransaction>
  return {
    transactions: response,
    isLast: response.length < config.TX_HISTORY_RESPONSE_LIMIT,
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

export const fetchUTXOsForAddresses = (addresses: Addresses, config: BackendConfig) => {
  assert.preconditionCheck(
    addresses.length <= config.FETCH_UTXOS_MAX_ADDRESSES,
    'fetchUTXOsForAddresses: too many addresses',
  )
  return fetchDefault('txs/utxoForAddresses', {addresses}, config)
}

export const bulkFetchUTXOsForAddresses = async (
  addresses: Addresses,
  config: BackendConfig,
): Promise<Array<RawUtxo>> => {
  const chunks = _.chunk(addresses, config.FETCH_UTXOS_MAX_ADDRESSES)

  const responses = await Promise.all(chunks.map((addrs) => fetchUTXOsForAddresses(addrs, config)))
  return _.flatten(responses) as any
}

export const submitTransaction = (signedTx: string, config: BackendConfig) => {
  return fetchDefault('txs/signed', {signedTx}, config)
}

export const getTransactions = (
  txids: Array<string>,
  config: BackendConfig,
): Promise<Record<string, RawTransaction>> => {
  return fetchDefault('v2/txs/get', {txHashes: txids}, config)
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

export const getNFTs = async (request: MultiAssetRequest, config: BackendConfig): Promise<YoroiNFT[]> => {
  const response = await fetchDefault('multiAsset/metadata', request, config)

  const filteredResponse = Object.keys(response)
    .filter((k) => response[k][0]?.key === '721')
    .map((nftKeys) => response[nftKeys][0].metadata as CardanoAssetMetadata)

  const nfts = filteredResponse.map<YoroiNFT>((backendMetadata: CardanoAssetMetadata) => {
    const policyId = Object.keys(backendMetadata)[0]
    const assetNameKey = Object.keys(backendMetadata[policyId])[0]
    const metadata: NFTMetadata = backendMetadata[policyId][assetNameKey]
    const assetNameHex = asciiToHex(assetNameKey)
    const fingerprint = getAssetFingerprint(policyId, assetNameHex)
    const description = Array.isArray(metadata.description) ? metadata.description.join(' ') : metadata.description

    return {
      id: `${policyId}.${assetNameHex}`,
      name: metadata.name,
      description: description ?? '',
      thumbnail: `${config.NFT_STORAGE_URL}/p_${fingerprint}.jpeg`,
      image: `${config.NFT_STORAGE_URL}/${fingerprint}.jpeg`,
      metadata: {
        policyId,
        assetNameHex: assetNameHex,
        originalMetadata: metadata,
      },
    }
  })

  return nfts
}

export const getNFTModerationStatus = async (
  fingerprint: string,
  config: BackendConfig,
): Promise<YoroiNFTModerationStatus> => {
  return fetchDefault('multiAsset/validateNFT/' + fingerprint, {envName: 'prod'}, config, 'POST', {
    checkResponse: async (response): Promise<YoroiNFTModerationStatus> => {
      if (response.status === 202) {
        return YoroiNFTModerationStatus.PENDING
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

export const getTokenInfo = async (request: TokenInfoRequest, config: BackendConfig): Promise<TokenInfoResponse> => {
  const {tokenIds} = request
  if (config.TOKEN_INFO_SERVICE == null) {
    throw new Error('Cardano wallets should have a Token metadata provider')
  }
  const endpointRoot = `${config.TOKEN_INFO_SERVICE}/metadata`
  const responses: Array<any> = await Promise.all(
    tokenIds.map(async (tokenId) => {
      try {
        return await checkedFetch({
          endpoint: `${endpointRoot}/${tokenId}`,
          method: 'GET',
          payload: undefined,
        })
      } catch (_e) {
        return {}
      }
    }),
  )
  return responses.reduce((res, resp) => {
    if (resp && resp.subject) {
      const v: {
        policyId: string
        assetName: string
      } & {
        name?: string
        decimals?: string
        longName?: string
        ticker?: string
      } = {
        policyId: resp.subject.slice(0, 56),
        assetName: resp.subject.slice(56),
      }

      if (resp.name?.value) {
        v.name = resp.name.value
      }

      if (resp.decimals?.value) {
        v.decimals = resp.decimals.value
      }

      if (resp.description?.value) {
        v.longName = resp.name.value
      }

      if (resp.ticker?.value) {
        v.ticker = resp.ticker.value
      }

      if (v.name || v.decimals) {
        res[resp.subject] = v
      }
    }

    return res
  }, {})
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
