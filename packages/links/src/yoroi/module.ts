import {Links} from '@yoroi/types'
import {freeze} from 'immer'

import {linksYoroiBuilder} from './links-builder'
import {
  configYoroiExchangeOrderShowCreateResult,
  configYoroiTransferRequestAda,
  configYoroiTransferRequestAdaWithLink,
} from './constants'
import {
  LinksYoroiExchangeShowCreateResultSchema,
  LinksYoroiTransferRequestAdaSchema,
  LinksYoroiTransferRequestAdaWithLinkSchema,
} from './validators'

export const linksYoroiModuleMaker = (
  scheme: Links.YoroiUriConfig['scheme'],
) => {
  const exchange = {
    order: {
      showCreateResult: linksYoroiBuilder(
        LinksYoroiExchangeShowCreateResultSchema,
        {...configYoroiExchangeOrderShowCreateResult, scheme},
      ).create,
    },
  }

  const transfer = {
    request: {
      ada: linksYoroiBuilder(LinksYoroiTransferRequestAdaSchema, {
        ...configYoroiTransferRequestAda,
        scheme,
      }).create,

      adaWithLink: linksYoroiBuilder(
        LinksYoroiTransferRequestAdaWithLinkSchema,
        {
          ...configYoroiTransferRequestAdaWithLink,
          scheme,
        },
      ).create,
    },
  }

  return freeze({exchange, transfer}, true)
}
