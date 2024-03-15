import {Exchange} from '@yoroi/types'
import {urlReferralQueryStringParamsSchema} from './zod-schema'
import {handleZodErrors} from './zod-errors'

export const createReferralUrl = (
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
    handleZodErrors(error)
    /* istanbul ignore next */
    throw new Exchange.Errors.Unknown(JSON.stringify(error)) // TS doesn't know that zodErrorTranslator will throw
  }
}
