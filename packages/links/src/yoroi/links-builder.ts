import {Links} from '@yoroi/types'
import {ZodTypeAny} from 'zod'

import {SchemaInfer} from './types'
import {convertObjectToSearchParams} from './helpers'

export const linksYoroiBuilder = <T extends ZodTypeAny>(
  schema: T,
  config: Links.YoroiUriConfig,
) => {
  const create = (params: Readonly<SchemaInfer<T>>) => {
    const result = schema.safeParse(params)

    if (!result.success) {
      throw new Links.Errors.ParamsValidationFailed(
        `Validation failed: ${result.error}`,
      )
    }

    const queryParams = convertObjectToSearchParams(result.data)
    const linkValue = queryParams.get('link')
    let queryString = ''

    // link is added always at the end
    if (linkValue != null) {
      queryParams.delete('link')
      queryString = queryParams.toString()
      // check if we need to add '&' to separate parameters
      if (queryString.length > 0) queryString += '&'
      queryString += `link=${encodeURIComponent(linkValue)}`
    } else {
      queryString = queryParams.toString()
    }

    const {scheme, authority, path, version} = config
    const url = new URL(
      `${scheme}://${authority}/${version}/${path}?${queryString}`,
    )
    return url.toString()
  }

  return {create}
}
