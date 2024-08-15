import {Links} from '@yoroi/types'
import {freeze} from 'immer'

import {linksYoroiBuilder} from './links-builder'
import {
  configYoroiBrowserLaunchDappUrl,
  configYoroiExchangeOrderShowCreateResult,
  configYoroiTransferRequestAda,
  configYoroiTransferRequestAdaWithLink,
} from './constants'
import {
  encodeBrowserLaunchDappUrl,
  encodeExchangeShowCreateResult,
  encodeTransferRequestAda,
  encodeTransferRequestAdaWithLink,
} from './transformers'

export const linksYoroiModuleMaker = (
  scheme: Links.YoroiUriConfig['scheme'],
): Links.YoroiModule => {
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

  const browser = {
    launch: {
      dappUrl: linksYoroiBuilder(encodeBrowserLaunchDappUrl, {
        ...configYoroiBrowserLaunchDappUrl,
        scheme,
      }).create,
    },
  }

  return freeze({exchange, transfer, browser}, true)
}
