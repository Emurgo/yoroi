import {Balance} from '@yoroi/types'
import {Draft, produce} from 'immer'

import {Quantities} from '../../utils'

export type PortfolioState = Readonly<{
  // all primary tokens need to be initialized with 0
  // locked = utxo cost to hold data (min-ada) cardano
  // committed = certificates costs cardano (2 delegation / proposal)
  primary: {
    tokens: Balance.TokenRecords
    amounts: Balance.Amounts
    committed: Balance.Amounts
    locked: Balance.Amounts
  }
  secondary: {
    tokens: Balance.TokenRecords
    fts: Balance.Amounts
    nfts: Balance.Amounts
  }
  all: {
    tokens: Balance.TokenRecords
    fts: Balance.Amounts
    nfts: Balance.Amounts
  }
}>

export const defaultPortfolioState: Readonly<PortfolioState> = {
  primary: {
    // primary tokens neeed to be initialized with network based coin
    tokens: {},
    // all primary token ids need to be initialized with 0
    // they can't be deleted, only in the reset (change wallet)
    amounts: {},
    committed: {},
    locked: {},
  },
  // secondary needs to be updated atomocally with amounts ft/nft
  // otherwise the UI can be momentarily in an inconsistent state
  secondary: {
    tokens: {},
    fts: {},
    nfts: {},
  },
  // don'use use all tokens in the update blank id will throw on cardano-api
  all: {
    tokens: {},
    fts: {},
    nfts: {},
  },
} as const

export type PortfolioActions = Readonly<{
  primaryTokensChanged: (primaryTokens: Readonly<PortfolioState['primary']['tokens']>) => void
  primaryAmountsChanged: (amounts: Readonly<PortfolioState['primary']['amounts']>) => void
  primaryCommittedChanged: (amounts: Readonly<PortfolioState['primary']['committed']>) => void
  primaryLockedChanged: (amounts: Readonly<PortfolioState['primary']['locked']>) => void

  secondaryChanged: (secondary: Readonly<PortfolioState['secondary']>) => void
  primaryChanged: (secondary: Readonly<PortfolioState['primary']>) => void

  resetState: (state: Readonly<PortfolioState>) => void
}>

export enum PortfolioActionType {
  PrimaryTokensChanged = 'primaryTokensChanged',
  PrimaryAmountsChanged = 'primaryAmountsChanged',
  PrimaryCommittedChanged = 'primaryCommittedChanged',
  PrimaryLockedChanged = 'primaryLockedChanged',
  SecondaryChanged = 'secondaryChanged',
  PrimaryChanged = 'primaryChanged',
  ResetState = 'resetState',
}

export type PortfolioAction =
  | Readonly<{
      type: PortfolioActionType.PrimaryTokensChanged
      primaryTokens: Readonly<PortfolioState['primary']['tokens']>
    }>
  | Readonly<{
      type: PortfolioActionType.PrimaryAmountsChanged
      amounts: Readonly<PortfolioState['primary']['amounts']>
    }>
  | Readonly<{
      type: PortfolioActionType.PrimaryCommittedChanged
      amounts: Readonly<PortfolioState['primary']['committed']>
    }>
  | Readonly<{
      type: PortfolioActionType.PrimaryLockedChanged
      amounts: Readonly<PortfolioState['primary']['locked']>
    }>
  | Readonly<{
      type: PortfolioActionType.SecondaryChanged
      secondary: Readonly<PortfolioState['secondary']>
    }>
  | Readonly<{
      type: PortfolioActionType.PrimaryChanged
      primary: Readonly<PortfolioState['primary']>
    }>
  | Readonly<{
      type: PortfolioActionType.ResetState
      state: Readonly<PortfolioState>
    }>

export const portfolioReducer = (currentState: Readonly<PortfolioState>, action: Readonly<PortfolioAction>) => {
  return produce(currentState, (draft: Draft<PortfolioState>) => {
    switch (action.type) {
      case PortfolioActionType.PrimaryTokensChanged:
        draft.primary.tokens = action.primaryTokens
        // reset amounts
        draft.primary.amounts = {}
        draft.primary.committed = {}
        draft.primary.locked = {}
        Object.keys(action.primaryTokens).forEach((tokenId) => {
          draft.primary.amounts[tokenId] = Quantities.zero
          draft.primary.committed[tokenId] = Quantities.zero
          draft.primary.locked[tokenId] = Quantities.zero
        })
        break

      case PortfolioActionType.PrimaryAmountsChanged:
        draft.primary.amounts = action.amounts
        break

      case PortfolioActionType.PrimaryCommittedChanged:
        draft.primary.committed = action.amounts
        break

      case PortfolioActionType.PrimaryLockedChanged:
        draft.primary.locked = action.amounts
        break

      case PortfolioActionType.SecondaryChanged:
        draft.secondary = action.secondary
        break

      case PortfolioActionType.PrimaryChanged:
        draft.primary = action.primary
        break

      case PortfolioActionType.ResetState:
        return action.state

      default:
        return draft
    }
  })
}

export const defaultPortfolioActions: PortfolioActions = {
  primaryAmountsChanged: /* istanbul ignore next */ () => console.error('[@yoroi/portfolio] missing initialization'),
  primaryCommittedChanged: /* istanbul ignore next */ () => console.error('[@yoroi/portfolio] missing initialization'),
  primaryLockedChanged: /* istanbul ignore next */ () => console.error('[@yoroi/portfolio] missing initialization'),
  primaryTokensChanged: /* istanbul ignore next */ () => console.error('[@yoroi/portfolio] missing initialization'),
  secondaryChanged: /* istanbul ignore next */ () => console.error('[@yoroi/portfolio] missing initialization'),
  primaryChanged: /* istanbul ignore next */ () => console.error('[@yoroi/portfolio] missing initialization'),
  resetState: /* istanbul ignore next */ () => console.error('[@yoroi/portfolio] missing initialization'),
} as const
