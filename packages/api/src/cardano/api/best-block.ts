import {z} from 'zod'
import {createTypeGuardFromSchema, fetcher, Fetcher} from '@yoroi/common'
import {Api} from '@yoroi/types'

export const getBestBlock =
  (baseUrl: string, request: Fetcher = fetcher) =>
  async (): Promise<Api.Cardano.BestBlock> => {
    return request<Api.Cardano.BestBlock>({
      url: `${baseUrl}/bestblock`,
      data: undefined,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Response-Type': 'application/json',
      },
    }).then((response: Api.Cardano.BestBlock) => {
      const parsedResponse = parseBestBlock(response)

      if (!parsedResponse)
        return Promise.reject(new Error('Invalid best block response'))
      return Promise.resolve(parsedResponse)
    })
  }

export const parseBestBlock = (
  data: Api.Cardano.BestBlock,
): Api.Cardano.BestBlock | undefined => {
  return isBestBlock(data) ? data : undefined
}

const BestBlockSchema = z.object({
  epoch: z.number(),
  slot: z.number(),
  globalSlot: z.number(),
  hash: z.string(),
  height: z.number(),
})

export const isBestBlock = createTypeGuardFromSchema(BestBlockSchema)
