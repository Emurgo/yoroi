import {StakePoolInfoRequest, StakePoolInfosAndHistories} from '@yoroi/staking'

import {freeze} from 'immer'
import _ from 'lodash'

import {
  AccountStateRequest,
  AccountStateResponse,
  RawTransaction,
  TipStatusResponse,
  TxHistoryRequest,
  TxStatusRequest,
  TxStatusResponse,
} from '../../api-types'
import {handleError} from '../../errors'
import {Addresses, CardanoApiAdapter} from '../../types'
import {fetchDefault} from '../../utils/fetch'

const limitApiRecords = 50

export const legacyApiMaker = ({
  baseApiUrl,
}: {
  baseApiUrl: string
}): CardanoApiAdapter => {
  return freeze({
    async getTipStatus(): Promise<TipStatusResponse> {
      return fetchDefault('v2/tipStatus', null, baseApiUrl, 'GET')
    },

    async fetchNewTxHistory(
      request: TxHistoryRequest,
    ): Promise<{isLast: boolean; transactions: Array<RawTransaction>}> {
      const transactions = await fetchDefault<Array<RawTransaction>>(
        'v2/txs/history',
        request,
        baseApiUrl,
      )

      return {
        transactions,
        isLast: transactions.length < limitApiRecords,
      }
    },

    async filterUsedAddresses(addresses: Addresses): Promise<Addresses> {
      const copy = [...addresses]
      const used = await fetchDefault<Addresses>(
        'v2/addresses/filterUsed',
        {addresses: copy},
        baseApiUrl,
      )
      return copy.filter((addr) => used.includes(addr))
    },

    async submitTransaction(signedTx: string): Promise<void> {
      try {
        await fetchDefault('txs/signed', {signedTx}, baseApiUrl)
      } catch (e) {
        throw e instanceof Error ? handleError(e) : e
      }
    },

    async getAccountState(
      request: AccountStateRequest,
    ): Promise<AccountStateResponse> {
      return fetchDefault('account/state', request, baseApiUrl)
    },

    async bulkGetAccountState(
      addresses: Addresses,
    ): Promise<AccountStateResponse> {
      const chunks = _.chunk(addresses, limitApiRecords)
      const responses = await Promise.all(
        chunks.map((addrs) => this.getAccountState({addresses: addrs})),
      )
      return Object.assign({}, ...responses)
    },

    async getPoolInfo(
      request: StakePoolInfoRequest,
    ): Promise<StakePoolInfosAndHistories> {
      return fetchDefault('pool/info', request, baseApiUrl)
    },

    async fetchTxStatus(request: TxStatusRequest): Promise<TxStatusResponse> {
      return fetchDefault('tx/status', request, baseApiUrl)
    },

    async checkServerStatus(): Promise<{
      isServerOk: boolean
      serverTime: number
    }> {
      return fetchDefault('status', null, baseApiUrl, 'GET')
    },

    async getFundInfo(): Promise<{
      currentFund: {
        id: number
        registrationStart: string
        registrationEnd: string
        votingStart?: string
        votingEnd?: string
        votingPowerThreshold: string
      } | null
      nextFund: {
        id: number
        registrationStart: string
        registrationEnd: string
        votingStart?: string
        votingEnd?: string
        votingPowerThreshold: string
      } | null
    }> {
      // Note: isMainnet needs to be passed, but we'll determine from baseApiUrl
      const isMainnet =
        !baseApiUrl.includes('testnet') &&
        !baseApiUrl.includes('preprod') &&
        !baseApiUrl.includes('preview')
      const prefix = isMainnet ? '' : 'api/'
      return fetchDefault(
        `${prefix}v0/catalyst/fundInfo/`,
        null,
        baseApiUrl,
        'GET',
      )
    },
  } as CardanoApiAdapter)
}
