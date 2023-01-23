import assert from '../../../legacy/assert'
import fetchDefault from '../fetch'
import {BackendConfig, RawTransaction, TxStatusRequest, TxStatusResponse} from '../types'

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

export const submitTransaction = (signedTx: string, config: BackendConfig) => {
  return fetchDefault('txs/signed', {signedTx}, config)
}

export const getTransactions = (
  txids: Array<string>,
  config: BackendConfig,
): Promise<Record<string, RawTransaction>> => {
  return fetchDefault('v2/txs/get', {txHashes: txids}, config)
}

export const fetchTxStatus = (request: TxStatusRequest, config: BackendConfig): Promise<TxStatusResponse> => {
  return fetchDefault('tx/status', request, config)
}

export type TxHistoryRequest = {
  addresses: Array<string>
  untilBlock: string
  after?: {
    block: string
    tx: string
  }
}
