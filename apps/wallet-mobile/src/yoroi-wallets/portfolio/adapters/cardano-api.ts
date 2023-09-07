import {Balance} from '@yoroi/types'
import {Cardano, CardanoApi, fetcher} from '@yoroi/wallets'
import {chunk} from 'lodash'

import {BalanceTokenApi} from '../types'
import {cardanoFutureTokenAsBalanceToken} from './transformers'

// It's limiting due to off chain metadata every id is a request
const MAX_TOKENS_PER_REQUEST = 50

export const portfolioManagerApiMaker = (
  {baseUrlApi, baseUrlTokenRegistry}: {baseUrlApi: string; baseUrlTokenRegistry: string},
  {
    request = fetcher,
    getTokenSupply = CardanoApi.getTokenSupply,
    getOnChainMetadatas = CardanoApi.getOnChainMetadatas,
    getOffChainMetadata = CardanoApi.getOffChainMetadata,
  }: ApiDeps = {},
): Readonly<BalanceTokenApi> => {
  const api = {
    tokenSupply: getTokenSupply(baseUrlApi, request),
    metadataOnChain: getOnChainMetadatas(baseUrlApi, request),
    metadataOffChain: getOffChainMetadata(baseUrlTokenRegistry, request),
  } as const

  // TODO: ids from rawUtxo check if `.` is always included, primary token should not be included in ids
  const tokens = async (ids: Readonly<Array<Balance.Token['info']['id']>>): Promise<Readonly<Balance.TokenRecords>> => {
    const idChunks = chunk(ids, MAX_TOKENS_PER_REQUEST)
    const result: Balance.TokenRecords = {}

    for (const ids of idChunks) {
      const [supplies, offChainMetadata, onChainMetadata] = await Promise.all([
        api.tokenSupply(ids as Cardano.Api.TokenSupplyRequest),
        api.metadataOffChain(ids as Cardano.Api.OffChainMetadataRequest),
        api.metadataOnChain(ids as Cardano.Api.OnChainMetadataRequest),
      ])

      ids.forEach((id) => {
        const futureToken: Cardano.Api.FutureToken = {
          supply: supplies[id],
          offChain: offChainMetadata[id],
          onChain: onChainMetadata[id],
        }
        const token = cardanoFutureTokenAsBalanceToken(id, futureToken)

        result[id] = token
      })
    }

    console.log(JSON.stringify(result, null, 2))
    return result
  }

  return {
    tokens,
  } as const
}

type ApiDeps = {
  request?: typeof fetcher
  getTokenSupply?: typeof CardanoApi.getTokenSupply
  getOnChainMetadatas?: typeof CardanoApi.getOnChainMetadatas
  getOffChainMetadata?: typeof CardanoApi.getOffChainMetadata
}
