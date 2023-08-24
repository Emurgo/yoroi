import {BanxaUnknownError} from '../adapters/errors'
import {BanxaCoinType} from '../helpers/coin-types'
import {banxaDomainProduction, banxaDomainSandbox} from './domains'
import {BanxaFiatType} from '../helpers/fiat-types'
import {handleZodErrors} from '../adapters/zod-errors'
import {BanxaUrlReferralQueryStringParamsSchema} from '../adapters/zod-schema'
import {BanxaBlockchainCode} from '../helpers/blockchain-code'

// -------
// FACTORY
/**
 * Creates an object that provides functionality to Banxa capabilities.
 *
 * @param {BanxaUrlReferralBuilderOptions} options - Configuration options for the referral link generation.
 * @param {string} [options.partner] - The partner name, e.g., "checkout".
 * @param {boolean} [options.isProduction=false] - Indicates if the function should generate production or sandbox URLs.
 *
 * @returns {BanxaModule} An object with methods to generate Banxa referral links.
 */
export const banxaModuleMaker = (
  {partner, isProduction}: BanxaReferralUrlBuilderOptions,
  {zodErrorTranslator = handleZodErrors} = {},
): BanxaModule => {
  const domain = isProduction ? banxaDomainProduction : banxaDomainSandbox
  const baseUrl = `https://${partner}.${domain}`

  /**
   * Create a Banxa referral URL based on query parameters.
   * @param queries - Query parameters for generating the Banxa referral URL.
   * @returns A URL object representing the generated Banxa referral link.
   * @throws {BanxaValidationError | BanxaUnknownError} Throws specific errors if validation fails or an unknown error occurs.
   */
  const createReferralUrl = (queries: BanxaReferralUrlQueryStringParams) => {
    try {
      const validatedQueries =
        BanxaUrlReferralQueryStringParamsSchema.parse(queries)
      const url = new URL(baseUrl)
      const params = new URLSearchParams()
      for (const [key, value] of Object.entries(validatedQueries)) {
        params.append(key, value.toString())
      }
      url.search = params.toString()
      return url
    } catch (error) {
      zodErrorTranslator(error)
      throw new BanxaUnknownError(JSON.stringify(error)) // TS doesn't know that zodErrorTranslator will throw
    }
  }

  return {
    createReferralUrl,
  } as const
}

// -----
// TYPES
export type BanxaReferralUrlBuilderOptions = {
  /** Partner name, e.g., emurgo. */
  partner: string
  /** Indicates that is running on production enviroment, otherwise will fallback to the sandbox */
  isProduction?: boolean
}

// https://docs.banxa.com/docs/referral-method
export type BanxaReferralUrlQueryStringParams = {
  /** Indicates whether the customer wants to sell. If this parameter is not passed, then the order will default to buyMode. */
  sellMode?: boolean

  /** Fiat currency code that the customer wants to exchange, e.g., USD. */
  fiatType: BanxaFiatType

  /** Fiat amount that the customer wants to exchange, takes precedence over coinAmount. */
  fiatAmount?: number

  /** Coin currency code that the customer wants to exchange, e.g., ETH. */
  coinType: BanxaCoinType

  /** Coin amount that the customer wants to exchange. */
  coinAmount?: number

  /** It defaults to the blockchain configured for the coinType selected, e.g., ADA -> Cardano. */
  blockchain?: BanxaBlockchainCode

  /** Customer’s wallet address. */
  walletAddress: string

  /** Customer's wallet tag or memo. This is required for transacting on certain blockchains such as BNB and XRP. */
  walletAddressTag?: string
}

export type BanxaModule = {
  /**
   * Generates a Banxa referral link based on the provided query parameters.
   *
   * @param {BanxaReferralUrlQueryStringParams} queries - The query parameters for the referral link.
   * @param {boolean} [queries.sellMode] - Indicates whether the customer wants to sell. If this parameter is not passed, then the order will default to buyMode.
   * @param {string} [queries.fiatType] - Fiat currency code that the customer wants to exchange, e.g., "USD".
   * @param {number} [queries.fiatAmount] - Fiat amount that the customer wants to exchange, takes precedence over coinAmount.
   * @param {string} [queries.coinType] - Coin currency code that the customer wants to exchange, e.g., "ADA".
   * @param {number} [queries.coinAmount] - Coin amount that the customer wants to exchange.
   * @param {string} [queries.blockchain] - It defaults to the blockchain configured for the coinType selected, e.g., "ADA" -> "Cardano".
   * @param {string} [queries.walletAddress] - Customer's wallet address.
   * @param {string} [queries.walletAddressTag] - Customer's wallet tag or memo. This is required for transacting on certain blockchains such as BNB and XRP.
   *
   * @throws {BanxaValidationError | BanxaUnknownError} Throws an error if the provided data doesn't match with the schema or if something unexpected happens.
   *
   * @returns {URL} The generated Banxa referral link as URL object.
   */
  readonly createReferralUrl: (
    queries: BanxaReferralUrlQueryStringParams,
  ) => URL
}
