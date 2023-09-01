import {Balance} from '@yoroi/types'
import {chunk} from 'lodash'

import {checkedFetch} from '../../cardano/api/fetch'
import {BalanceTokenApi} from '../types'
import {getOffChainMetadata as apiGetOffChainMetadata} from './api/token-offchain-metadata'
import {getOnChainMetadatas as apiGetOnChainMetadatas} from './api/token-onchain-metadata'
import {getTokenSupply as apiGetTokenSupply} from './api/token-supply'
import {
  ApiFutureTokenRecords,
  ApiOffChainMetadataRequest,
  ApiOnChainMetadataRequest,
  ApiTokeSupplyRequest,
} from './api/types'

// It's limiting due to off chain metadata every id is a request
const MAX_TOKENS_PER_REQUEST = 50

export const tokenManagerApiMaker = (
  {baseUrlApi, baseUrlTokenRegistry}: {baseUrlApi: string; baseUrlTokenRegistry: string},
  {
    fetch = checkedFetch,
    getTokenSupply = apiGetTokenSupply,
    getOnChainMetadatas = apiGetOnChainMetadatas,
    getOffChainMetadata = apiGetOffChainMetadata,
  }: ApiDeps = {},
): Readonly<BalanceTokenApi> => {
  const api = {
    tokenSupply: getTokenSupply(baseUrlApi, fetch),
    metadataOnChain: getOnChainMetadatas(baseUrlApi, fetch),
    metadataOffChain: getOffChainMetadata(baseUrlTokenRegistry, fetch),
  }

  // TODO: ids from rawUtxo check if `.` is always included, primary token should not be included in ids
  const tokens = async (ids: Readonly<Array<Balance.Token['info']['id']>>): Promise<ReadonlyArray<Balance.Token>> => {
    const idChunks = chunk(ids, MAX_TOKENS_PER_REQUEST)
    const result: ApiFutureTokenRecords = {}

    for (const ids of idChunks) {
      const [supplies, offChainMetadata, onChainMetadata] = await Promise.all([
        api.tokenSupply(ids as ApiTokeSupplyRequest),
        api.metadataOffChain(ids as ApiOffChainMetadataRequest),
        api.metadataOnChain(ids as ApiOnChainMetadataRequest),
      ])

      ids.forEach((id) => {
        result[id] = {
          supply: supplies[id],
          offChain: offChainMetadata[id],
          onChain: onChainMetadata[id],
        }
      })
    }

    console.log(JSON.stringify(result, null, 2))
    return [] as const
  }

  return {
    tokens,
  } as const
}

type ApiDeps = {
  fetch?: typeof checkedFetch
  getTokenSupply?: typeof apiGetTokenSupply
  getOnChainMetadatas?: typeof apiGetOnChainMetadatas
  getOffChainMetadata?: typeof apiGetOffChainMetadata
}
