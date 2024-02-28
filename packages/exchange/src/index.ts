export {
  banxaDomainProduction,
  banxaDomainSandbox,
  banxaSupportUrl,
} from './translators/banxa/domains'
export {banxaModuleMaker} from './translators/banxa/module'
export {BanxaErrorMessages} from './adapters/banxa/errors'

import type {BanxaFiatType} from './helpers/banxa/fiat-types'
import type {BanxaCoinType} from './helpers/banxa/coin-types'

import type {
  BanxaModule,
  BanxaReferralUrlBuilderOptions,
  BanxaReferralUrlQueryStringParams,
} from './translators/banxa/module'
import {BanxaUnknownError, BanxaValidationError} from './adapters/banxa/errors'

export namespace Banxa {
  export type CoinType = BanxaCoinType
  export type FiatType = BanxaFiatType

  export type ReferralUrlBuilderOptions = BanxaReferralUrlBuilderOptions
  export type ReferralUrlQueryStringParams = BanxaReferralUrlQueryStringParams

  export type Module = BanxaModule

  export interface UnknownError extends BanxaUnknownError {}
  export interface ValidationError extends BanxaValidationError {}
}
