import {PortfolioQuantity} from './amount'
import {PortfolioToken} from './token'
import {PortfolioTokenInfo} from './token-info'

export type PortfolioBalanceRecords<M extends Record<string, unknown> = {}> = {
  [tokenId: PortfolioTokenInfo['id']]: PortfolioBalance<M>
}

export type PortfolioBalance<T extends Record<string, unknown> = {}> = {
  balance: PortfolioQuantity
  isPrimary: boolean
} & PortfolioToken<T>
