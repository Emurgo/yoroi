import {Links} from '@yoroi/types'
import {freeze} from 'immer'

import {linksYoroiBuilder} from './links-builder'
import {
  configYoroiExchangeOrderShowCreateResult,
  configYoroiTransferRequestAda,
  configYoroiTransferRequestAdaWithLink,
} from './constants'
import {
  encodeExchangeShowCreateResult,
  encodeTransferRequestAda,
  encodeTransferRequestAdaWithLink,
} from './transformers'

export const linksYoroiModuleMaker = (
  scheme: Links.YoroiUriConfig['scheme'],
) => {
  const exchange = {
    order: {
      showCreateResult: linksYoroiBuilder(encodeExchangeShowCreateResult, {
        ...configYoroiExchangeOrderShowCreateResult,
        scheme,
      }).create,
    },
  }

  const transfer = {
    request: {
      ada: linksYoroiBuilder(encodeTransferRequestAda, {
        ...configYoroiTransferRequestAda,
        scheme,
      }).create,

      adaWithLink: linksYoroiBuilder(encodeTransferRequestAdaWithLink, {
        ...configYoroiTransferRequestAdaWithLink,
        scheme,
      }).create,
    },
  }

  return freeze({exchange, transfer}, true)
}
