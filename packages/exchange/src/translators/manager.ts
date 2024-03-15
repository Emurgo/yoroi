import {Exchange} from '@yoroi/types'
import {handleZodErrors} from '../adapters/zod-errors'
import {urlReferralQueryStringParamsSchema} from '../adapters/zod-schema'

export const exchangeManagerMaker = ({
  zodErrorTranslator = handleZodErrors,
} = {}): Exchange.Manager => {
  const createReferralUrl = (
    baseUrl: string,
    queries: Exchange.ReferralUrlQueryStringParams,
  ) => {
    try {
      const validatedQueries = urlReferralQueryStringParamsSchema.parse(queries)
      const url = new URL(baseUrl)
      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(validatedQueries)) {
        params.append(key, value.toString())
      }
      url.search = params.toString()
      return url
    } catch (error) {
      zodErrorTranslator(error)
      throw new Exchange.Errors.Unknown(JSON.stringify(error)) // TS doesn't know that zodErrorTranslator will throw
    }
  }

  return {
    createReferralUrl,
  } as const
}
