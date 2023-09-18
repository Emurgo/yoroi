import {Portfolio} from '@yoroi/types'

import {defaultPortfolioState, PortfolioAction, PortfolioActionType, portfolioReducer} from './portfolio-state'

const token1: Portfolio.Token = {
  info: {
    id: 'policyId.assetName1',
    name: 'secondary token 1',
    kind: 'ft',
    fingerprint: '',
    group: '',
  },
  metadatas: {},
}
const token2: Portfolio.Token = {
  info: {
    id: 'policyId.assetName2',
    name: 'secondary token 2',

    kind: 'ft',
    fingerprint: '',
    group: '',
  },
  metadatas: {},
}
const primaryToken1: Portfolio.Token = {
  info: {
    id: '',
    name: 'primary token 1',
    kind: 'ft',
    fingerprint: '',
    group: '',
  },
  metadatas: {},
}

describe('portfolioReducer', () => {
  it('should update primary amounts when PrimaryAmountsChanged action is dispatched', () => {
    const action: PortfolioAction = {
      type: PortfolioActionType.PrimaryAmountsChanged,
      amounts: {
        tokenId1: '100',
        tokenId2: '200',
      },
    } as const

    const newState = portfolioReducer(defaultPortfolioState, action)

    expect(newState.primary.amounts).toEqual({
      tokenId1: '100',
      tokenId2: '200',
    })
  })

  it('should update primary tokens when PrimaryTokenChanged action is dispatched', () => {
    const action: PortfolioAction = {
      type: PortfolioActionType.PrimaryTokensChanged,
      primaryTokens: {
        primaryToken1: primaryToken1,
      },
    } as const

    const newState = portfolioReducer(defaultPortfolioState, action)

    expect(newState.primary.tokens).toEqual({
      primaryToken1: primaryToken1,
    })
  })

  it('should update primary committed amounts when PrimaryCommittedChanged action is dispatched', () => {
    const action: PortfolioAction = {
      type: PortfolioActionType.PrimaryCommittedChanged,
      amounts: {
        tokenId1: '50',
      },
    } as const

    const newState = portfolioReducer(defaultPortfolioState, action)

    expect(newState.primary.committed).toEqual({
      tokenId1: '50',
    })
  })

  it('should update primary locked amounts when PrimaryLockedChanged action is dispatched', () => {
    const action: PortfolioAction = {
      type: PortfolioActionType.PrimaryLockedChanged,
      amounts: {
        tokenId1: '10',
        tokenId2: '20',
      },
    } as const

    const newState = portfolioReducer(defaultPortfolioState, action)

    expect(newState.primary.locked).toEqual({
      tokenId1: '10',
      tokenId2: '20',
    })
  })

  it('should update secondary state when SecondaryChanged action is dispatched', () => {
    const action: PortfolioAction = {
      type: PortfolioActionType.SecondaryChanged,
      secondary: {
        tokens: {tokenId1: token1, tokenId2: token2},
        fts: {tokenId1: '1'},
        nfts: {tokenId2: '2'},
      },
    } as const

    const newState = portfolioReducer(defaultPortfolioState, action)

    expect(newState.secondary).toEqual({
      tokens: {
        tokenId1: token1,
        tokenId2: token2,
      },
      fts: {tokenId1: '1'},
      nfts: {tokenId2: '2'},
    })
  })

  it('should update primary state when PrimaryChanged action is dispatched', () => {
    const action: PortfolioAction = {
      type: PortfolioActionType.PrimaryChanged,
      primary: {
        tokens: {tokenId1: token1, tokenId2: token2},
        amounts: {tokenId1: '1'},
        committed: {tokenId2: '2'},
        locked: {tokenId1: '1'},
      },
    } as const

    const newState = portfolioReducer(defaultPortfolioState, action)

    expect(newState.primary).toEqual({
      tokens: {
        tokenId1: token1,
        tokenId2: token2,
      },
      amounts: {tokenId1: '1'},
      committed: {tokenId2: '2'},
      locked: {tokenId1: '1'},
    })
  })

  it('should reset state when ResetState action is dispatched', () => {
    const action: PortfolioAction = {
      type: PortfolioActionType.ResetState,
      state: defaultPortfolioState,
    } as const

    const newState = portfolioReducer(defaultPortfolioState, action)

    expect(newState).toEqual(defaultPortfolioState)
  })

  it('should return the same state for an unknown action', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const action = {type: 'UNKNOWN_ACTION'} as any

    const newState = portfolioReducer(defaultPortfolioState, action)

    expect(newState).toBe(defaultPortfolioState)
  })
})
