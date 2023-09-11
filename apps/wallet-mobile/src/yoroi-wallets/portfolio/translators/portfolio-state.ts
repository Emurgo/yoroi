import {Balance} from '@yoroi/types'
import {Draft, produce} from 'immer'

export type PortfolioState = Readonly<{
  amounts: {
    nfts: Balance.Amounts
    fts: Balance.Amounts
    pts: Balance.Amounts
    committed: Balance.Amounts
    locked: Balance.Amounts
  }
  tokens: {
    primary: Balance.TokenRecords
    secondary: Balance.TokenRecords
  }
}>

export const defaultPortfolioState: Readonly<PortfolioState> = {
  amounts: {
    nfts: {},
    fts: {},
    pts: {},
    committed: {},
    locked: {},
  },
  tokens: {
    primary: {},
    secondary: {},
  },
} as const

export type PortfolioActions = Readonly<{
  amountsChanged: (amounts: Readonly<Partial<PortfolioState['amounts']>>) => void
  tokensChanged: (tokens: Readonly<Partial<PortfolioState['tokens']>>) => void
}>

export enum PortfolioActionType {
  AmountsChanged = 'amountsChanged',
  TokensChanged = 'tokensChanged',
}

export type PortfolioAction =
  | Readonly<{
      type: PortfolioActionType.AmountsChanged
      amounts: Readonly<Partial<PortfolioState['amounts']>>
    }>
  | Readonly<{
      type: PortfolioActionType.TokensChanged
      tokens: Readonly<Partial<PortfolioState['tokens']>>
    }>

export const portfolioReducer = (state: Readonly<PortfolioState>, action: Readonly<PortfolioAction>) => {
  return produce(state, (draft: Draft<PortfolioState>) => {
    switch (action.type) {
      case PortfolioActionType.AmountsChanged:
        draft.amounts = {...draft.amounts, ...action.amounts}
        break
      case PortfolioActionType.TokensChanged:
        draft.tokens = {...draft.tokens, ...action.tokens}
        break
      default:
        return draft
    }
  })
}
