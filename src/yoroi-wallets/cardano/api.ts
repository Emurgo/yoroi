/* eslint-disable @typescript-eslint/no-explicit-any */
import AssetFingerprint from '@emurgo/cip14-js'
import _ from 'lodash'

import assert from '../../legacy/assert'
import {ApiError} from '../../legacy/errors'
import fetchDefault, {checkedFetch} from '../../legacy/fetch'
import {Logger} from '../../legacy/logging'
import {ServerStatus, YoroiWallet} from '..'
import type {
  AccountStateRequest,
  AccountStateResponse,
  BackendConfig,
  CurrencySymbol,
  FundInfoResponse,
  LegacyToken,
  PoolInfoRequest,
  PriceResponse,
  RawTransaction,
  RemoteAsset,
  TipStatusResponse,
  TokenInfo,
  TxHistoryRequest,
  TxStatusRequest,
  TxStatusResponse,
} from '../types'
import {StakePoolInfosAndHistories} from '../types'

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
  const migrateTokenId = (ios: Array<{assets: RemoteAsset[]}>) =>
    ios.map((io) => ({
      ...io,
      assets: io.assets.map((asset) => ({
        ...asset,
        assetId: asset.assetId.replace('.', ''),
      })), // migrate from legacy tokenId to tokenSubject
    }))

  const txs = await fetchDefault('v2/txs/get', {txHashes: txids}, config)
  const entries: Array<[string, RawTransaction]> = Object.entries(txs)
  const newEntries: Array<[string, RawTransaction]> = entries.map(([txid, tx]) => [
    txid,
    {
      ...tx,
      inputs: migrateTokenId(tx.inputs),
      outputs: migrateTokenId(tx.outputs),
    } as RawTransaction,
  ])

  return Object.fromEntries(newEntries)
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

export const getTokenInfo = async (tokenId: string, apiUrl: string) => {
  const response = await checkedFetch({
    endpoint: `${apiUrl}/${tokenId}`,
    method: 'GET',
    payload: undefined,
  }).catch((error) => {
    Logger.error(error)

    return undefined
  })

  const entry = parseTokenRegistryEntry(response)

  const result = entry ? tokenInfo(entry) : fallbackTokenInfo(tokenId)

  return result
}

const tokenInfo = (entry: TokenRegistryEntry): TokenInfo => {
  const [policyId, assetNameHex] = splitTokenSubject(entry.subject)

  return {
    id: entry.subject,
    name: hexToAscii(assetNameHex),
    group: policyId,
    description: entry.description.value ?? '',
    decimals: entry.decimals?.value ?? 0,

    ticker: entry.ticker?.value,
    url: entry.url?.value,
    logo: entry.logo?.value,
    fingerprint: toTokenFingerprint({policyId, assetNameHex}),
  }
}

const fallbackTokenInfo = (tokenId: string): TokenInfo => {
  const [policyId, assetNameHex] = splitTokenSubject(tokenId)

  return {
    id: tokenId,
    name: hexToAscii(assetNameHex),
    group: policyId,
    decimals: 0,
    description: '',
    fingerprint: toTokenFingerprint({policyId, assetNameHex}),
  }
}

export const splitTokenSubject = (tokenSubject: string) => [tokenSubject.slice(0, 56), tokenSubject.slice(56)]

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

export const hexToAscii = (hex: string) => Buffer.from(hex, 'hex').toLocaleString()

const asciiToHex = (ascii: string) => {
  const result: Array<string> = []
  for (let n = 0, l = ascii.length; n < l; n++) {
    const hex = Number(ascii.charCodeAt(n)).toString(16)
    result.push(hex)
  }

  return result.join('')
}

export const toToken = ({wallet, tokenInfo}: {wallet: YoroiWallet; tokenInfo: TokenInfo}): LegacyToken => ({
  identifier: `${tokenInfo.group}${asciiToHex(tokenInfo.name)}`, // convert name to hex
  networkId: wallet.networkId,
  isDefault: tokenInfo.id === wallet.primaryTokenInfo.id,
  metadata: {
    type: 'Cardano',
    policyId: tokenInfo.group,
    assetName: asciiToHex(tokenInfo.name),
    numberOfDecimals: tokenInfo.decimals,
    ticker: tokenInfo.ticker ?? null,
    longName: null,
    maxSupply: null,
  },
})
export const toTokenInfo = (token: LegacyToken): TokenInfo => ({
  id: token.identifier,
  group: token.metadata.policyId,
  name: hexToAscii(token.metadata.assetName),
  decimals: token.metadata.numberOfDecimals,
  description: token.metadata.longName ?? '',
  fingerprint: toTokenFingerprint({policyId: token.metadata.policyId, assetNameHex: token.metadata.assetName}),
})

export const toTokenFingerprint = ({policyId, assetNameHex}) => {
  const assetFingerprint = new AssetFingerprint(Buffer.from(policyId, 'hex'), Buffer.from(assetNameHex, 'hex'))
  return assetFingerprint.fingerprint()
}

// Token Registry
// 721: https://github.com/cardano-foundation/cardano-token-registry#semantic-content-of-registry-entries
export type TokenRegistryEntry = {
  subject: string
  name: Property<string>
  description: Property<string>

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
  value: T
}

const parseTokenRegistryEntry = (data: unknown) => {
  return isTokenRegistryEntry(data) ? data : undefined
}

const isTokenRegistryEntry = (data: unknown): data is TokenRegistryEntry => {
  return !!data && typeof data === 'object' && 'name' in data && 'assetName' in data && 'policyId' in data
}
