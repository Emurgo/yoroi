import {Links} from '@yoroi/types'
import {freeze} from 'immer'

import {
  ExchangeShowCreateResultSchema,
  TransferRequestAdaSchema,
  TransferRequestAdaWithLinkSchema,
} from './validators'
import {convertSearchParamsToObject} from './helpers'

export const linksYoroiParser = (
  link: string,
): Readonly<Links.YoroiActionInfo> | null => {
  try {
    const url = new URL(link)

    switch (url.pathname) {
      case `/w1/transfer/request/ada`: {
        const objectFromParams = convertSearchParamsToObject(url.searchParams)
        const params = TransferRequestAdaSchema.parse(objectFromParams)
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
        const params = TransferRequestAdaWithLinkSchema.parse(objectFromParams)
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
        const params = ExchangeShowCreateResultSchema.parse(objectFromParams)
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
