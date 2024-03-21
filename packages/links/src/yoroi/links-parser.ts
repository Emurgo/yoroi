import {freeze} from 'immer'

import {
  LinksYoroiExchangeShowCreateResultSchema,
  LinksYoroiTransferRequestAdaSchema,
  LinksYoroiTransferRequestAdaWithLinkSchema,
} from './validators'
import {convertSearchParamsToObject} from './helpers'
import {LinksYoroiActionInfo} from './types'

export const linksYoroiParser = (
  link: string,
): Readonly<LinksYoroiActionInfo> | null => {
  try {
    const url = new URL(link)

    switch (url.pathname) {
      case `/w1/transfer/request/ada`: {
        const objectFromParams = convertSearchParamsToObject(url.searchParams)
        const params =
          LinksYoroiTransferRequestAdaSchema.parse(objectFromParams)
        return freeze(
          {
            version: 1,
            feature: 'transfer',
            useCase: 'request/ada',
            params,
          },
          true,
        )
      }
      case `/w1/transfer/request/ada-with-link`: {
        const objectFromParams = convertSearchParamsToObject(url.searchParams)
        const params =
          LinksYoroiTransferRequestAdaWithLinkSchema.parse(objectFromParams)
        return freeze(
          {
            version: 1,
            feature: 'transfer',
            useCase: 'request/ada-with-link',
            params,
          },
          true,
        )
      }
      case `/w1/exchange/order/show-create-result`: {
        const objectFromParams = convertSearchParamsToObject(url.searchParams)
        const params =
          LinksYoroiExchangeShowCreateResultSchema.parse(objectFromParams)
        return freeze(
          {
            version: 1,
            feature: 'exchange',
            useCase: 'order/show-create-result',
            params,
          },
          true,
        )
      }
    }
    // NOTE: for now Yoroi just ignores invalid links
  } catch (error) {}

  return null
}
