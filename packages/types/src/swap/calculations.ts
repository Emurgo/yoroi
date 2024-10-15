import {App, Portfolio, Swap} from '..'

export type SwapMakeOrderCalculation = Readonly<{
  orderType: Swap.OrderType
  amounts: {
    sell?: Portfolio.Token.Amount
    buy?: Portfolio.Token.Amount
  }
  limitPrice?: string
  pools: ReadonlyArray<Swap.Pool>
  lpTokenHeld?: Portfolio.Token.Amount
  slippage: number
  side?: 'buy' | 'sell'
  frontendFeeTiers: ReadonlyArray<App.FrontendFeeTier>
  tokens: {
    ptInfo?: Portfolio.Token.Info
    priceDenomination: number
  }
  priceDecimals?: number
}>

export type SwapOrderCalculation = Readonly<{
  order: {
    side?: 'buy' | 'sell'
    slippage: number
    orderType: Swap.OrderType
    limitPrice?: string
    amounts: {
      sell: Portfolio.Token.Amount
      buy: Portfolio.Token.Amount
    }
    lpTokenHeld?: Portfolio.Token.Amount
  }
  sides: {
    sell: Portfolio.Token.Amount
    buy: Portfolio.Token.Amount
  }
  pool: Swap.Pool
  prices: {
    base: string
    market: string
    actualPrice: string
    withSlippage: string
    withFees: string
    withFeesAndSlippage: string
    difference: string
    priceImpact: string
  }
  hasSupply: boolean
  buyAmountWithSlippage: Portfolio.Token.Amount
  ptTotalValueSpent?: Portfolio.Token.Amount
  cost: {
    liquidityFee: Portfolio.Token.Amount
    deposit: Portfolio.Token.Amount
    batcherFee: Portfolio.Token.Amount
    frontendFeeInfo: {
      discountTier?: App.FrontendFeeTier
      fee: Portfolio.Token.Amount
    }
    ptTotalRequired: Portfolio.Token.Amount
  }
}>
