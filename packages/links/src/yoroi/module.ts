import {Links} from '@yoroi/types'
import {freeze} from 'immer'

import {
  LinksYoroiExchangeShowCreateResulSchema,
  LinksYoroiTransferRequestAdaSchema,
  LinksYoroiTransferRequestAdaWithUrlSchema,
  linksYoroiBuilder,
} from './links-builder'
import {
  configYoroiOrderShowCreateResult,
  configYoroiTransferRequestAda,
  configYoroiTransferRequestAdaWithLink,
} from './constants'

export const linksYoroiModuleMaker = (
  scheme: Links.YoroiUriConfig['scheme'],
) => {
  const exchange = {
    order: {
      showCreateResult: linksYoroiBuilder(
        LinksYoroiExchangeShowCreateResulSchema,
        {...configYoroiOrderShowCreateResult, scheme},
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
        LinksYoroiTransferRequestAdaWithUrlSchema,
        {
          ...configYoroiTransferRequestAdaWithLink,
          scheme,
        },
      ).create,
    },
  }

  return freeze({exchange, transfer}, true)
}
