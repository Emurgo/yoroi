import {Links} from '@yoroi/types'
import {ZodTypeAny} from 'zod'

import {SchemaInfer} from './types'
import {convertObjectToSearchParams} from './helpers'

export const linksYoroiBuilder = <T extends ZodTypeAny>(
  encoder: T,
  config: Links.YoroiUriConfig,
) => {
  const create = (params: Readonly<SchemaInfer<T>>) => {
    const result = encoder.safeParse(params)

    if (!result.success) {
      throw new Links.Errors.ParamsValidationFailed(
        `Validation failed: ${result.error}`,
      )
    }

    const query = convertObjectToSearchParams(result.data)

    const {scheme, authority, path, version} = config
    const url = new URL(
      `${scheme}://${authority}/${version}/${path}?${query.toString()}`,
    )
    return url.toString()
  }

  return {create}
}
