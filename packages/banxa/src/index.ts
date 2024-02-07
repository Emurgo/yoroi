export {
  banxaDomainProduction,
  banxaDomainSandbox,
  banxaSupportUrl,
} from './translators/domains'
export {banxaModuleMaker} from './translators/module'
export {BanxaErrorMessages} from './adapters/errors'

import type {BanxaFiatType} from './helpers/fiat-types'
import type {BanxaCoinType} from './helpers/coin-types'

import type {
  BanxaModule,
  BanxaReferralUrlBuilderOptions,
  BanxaReferralUrlQueryStringParams,
} from './translators/module'
import {BanxaUnknownError, BanxaValidationError} from './adapters/errors'

export namespace Banxa {
  export type CoinType = BanxaCoinType
  export type FiatType = BanxaFiatType

  export type ReferralUrlBuilderOptions = BanxaReferralUrlBuilderOptions
  export type ReferralUrlQueryStringParams = BanxaReferralUrlQueryStringParams

  export type Module = BanxaModule

  export interface UnknownError extends BanxaUnknownError {}
  export interface ValidationError extends BanxaValidationError {}
}
