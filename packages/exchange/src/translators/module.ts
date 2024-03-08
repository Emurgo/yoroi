import {Exchange} from '@yoroi/types'
import {handleZodErrors} from '../adapters/zod-errors'
import {urlReferralQueryStringParamsSchema} from '../adapters/zod-schema'
import {generateBanxaBaseUrl} from '../adapters/banxa/base-url'

export const exchangeManagerMaker = (
  {partner, isProduction}: Exchange.ManagerOptions,
  {zodErrorTranslator = handleZodErrors} = {},
): Exchange.Manager => {
  const createReferralUrl = (
    provider: Exchange.Provider,
    queries: Exchange.ReferralUrlQueryStringParams,
  ) => {
    const baseUrlGenerators = {
      [Exchange.Provider.Banxa]: generateBanxaBaseUrl,
    }

    try {
      const generateBaseUrl = baseUrlGenerators[provider]
      const baseUrl = generateBaseUrl(isProduction, partner)

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
