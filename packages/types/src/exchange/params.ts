import {ExchangeBlockchainCode} from './blockchain'
import {ExchangeCoin} from './coin'
import {ExchangeFiat} from './fiat'

export type ExchangeReferralUrlQueryStringParams = {
  /** Can be used to indicate whether the customer wants to sell by passing through a value of sell. The customer will be shown the Sell Order Form when they are redirected to teh Exchange. If this parameter is not passed, then the order will default to buy */
  orderType?: 'sell' | 'buy'

  /** Fiat currency code that the customer wants to exchange e.g USD */
  fiatType: ExchangeFiat

  /** Fiat amount that the customer wants to exchange, takes precedence over coinAmount. */
  fiatAmount?: number

  /** Coin currency code that the customer wants to exchange, e.g., ETH. */
  coinType: ExchangeCoin

  /** Coin amount that the customer wants to exchange. */
  coinAmount?: number

  /** It defaults to the blockchain configured for the coinType selected, e.g., ADA -> Cardano. */
  blockchain?: ExchangeBlockchainCode

  /** Customer’s wallet address. */
  walletAddress: string

  /** This is the url that users will be redirected to when they have completed or cancel the order process. e.g. https://{returnUrl}.com) */
  returnUrl?: string
}
