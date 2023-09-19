import {PortfolioQuantity} from './amount'
import {PortfolioToken} from './token'
import {PortfolioTokenInfo} from './token-info'

export type PortfolioTokenBalanceRecords<
  T extends PortfolioToken,
  B = PortfolioTokenBalance<T>,
> = Readonly<{
  [tokenId: PortfolioTokenInfo['id']]: B
}>

export type PortfolioTokenBalance<T extends PortfolioToken> = T &
  Readonly<{
    balance: PortfolioQuantity
    isPrimary: boolean
  }>
