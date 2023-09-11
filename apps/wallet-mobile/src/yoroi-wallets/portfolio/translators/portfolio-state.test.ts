import {defaultPortfolioState, PortfolioAction, PortfolioActionType, portfolioReducer} from './portfolio-state'

describe('portfolioReducer', () => {
  it('should update amounts when AmountsChanged action is dispatched', () => {
    const action: PortfolioAction = {
      type: PortfolioActionType.AmountsChanged,
      amounts: {
        nfts: {'policyId.assetName1': '10'},
        fts: {'policyId.assetName2': '20'},
      },
    } as const

    const newState = portfolioReducer(defaultPortfolioState, action)

    expect(newState.amounts).toEqual({
      nfts: {'policyId.assetName1': '10'},
      fts: {'policyId.assetName2': '20'},
      pts: {},
      committed: {},
      locked: {},
    })
  })

  it('should update tokens when TokensChanged action is dispatched', () => {
    const action: PortfolioAction = {
      type: PortfolioActionType.TokensChanged,
      tokens: {
        primary: {
          '': {
            info: {
              id: '',
              name: 'primary token 1',
              kind: 'ft',
              fingerprint: '',
              group: '',
            },
            metadatas: {},
          },
        },
        secondary: {
          'policyId.assetName1': {
            info: {
              id: 'policyId.assetName1',
              name: 'secondary token 1',
              kind: 'ft',
              fingerprint: '',
              group: '',
            },
            metadatas: {},
          },
          'policyId.assetName2': {
            info: {
              id: 'policyId.assetName2',
              name: 'secondary token 2',

              kind: 'ft',
              fingerprint: '',
              group: '',
            },
            metadatas: {},
          },
        },
      },
    } as const

    const newState = portfolioReducer(defaultPortfolioState, action)

    expect(newState.tokens).toEqual({
      primary: {
        '': {
          info: {
            id: '',
            name: 'primary token 1',
            kind: 'ft',
            fingerprint: '',
            group: '',
          },
          metadatas: {},
        },
      },
      secondary: {
        'policyId.assetName1': {
          info: {
            id: 'policyId.assetName1',
            name: 'secondary token 1',
            kind: 'ft',
            fingerprint: '',
            group: '',
          },
          metadatas: {},
        },
        'policyId.assetName2': {
          info: {
            id: 'policyId.assetName2',
            name: 'secondary token 2',

            kind: 'ft',
            fingerprint: '',
            group: '',
          },
          metadatas: {},
        },
      },
    })
  })

  it('should return the same state for an unknown action', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const action = {type: 'UNKNOWN_ACTION'} as any

    const newState = portfolioReducer(defaultPortfolioState, action)

    expect(newState).toBe(defaultPortfolioState)
  })
})
