import {ExchangeReferralUrlQueryStringParams} from './params'
import {ExchangeProvider} from './provider'

export type ExchangeManager = {
  /**
   * Generates a Banxa referral link based on the provided query parameters.
   *
   * @param {ExchangeReferralUrlQueryStringParams} queries - The query parameters for the referral link.
   * @param {boolean} [queries.sellMode] - Indicates whether the customer wants to sell. If this parameter is not passed, then the order will default to buyMode.
   * @param {string} [queries.fiatType] - Fiat currency code that the customer wants to exchange, e.g., "USD".
   * @param {number} [queries.fiatAmount] - Fiat amount that the customer wants to exchange, takes precedence over coinAmount.
   * @param {string} [queries.coinType] - Coin currency code that the customer wants to exchange, e.g., "ADA".
   * @param {number} [queries.coinAmount] - Coin amount that the customer wants to exchange.
   * @param {string} [queries.blockchain] - It defaults to the blockchain configured for the coinType selected, e.g., "ADA" -> "Cardano".
   * @param {string} [queries.walletAddress] - Customer's wallet address.
   * @param {string} [queries.returnUrl] - This is the url that users will be redirected to when they have completed or cancel the order process. e.g. https://{returnUrl}.com.
   *
   * @throws {ExchangeValidationError | ExchangeUnknownError} Throws an error if the provided data doesn't match with the schema or if something unexpected happens.
   *
   * @returns {URL} The generated Banxa referral link as URL object.
   */
  readonly createReferralUrl: (
    provider: ExchangeProvider,
    queries: ExchangeReferralUrlQueryStringParams,
  ) => URL
}
