import {enableMapSet} from 'immer'

import {
  linksReducer,
  defaultLinksState,
  LinksActionType,
  LinksAction,
} from './state'
import {mocks} from './state.mocks'

enableMapSet()

describe('linksReducer', () => {
  it('should handle ActionStarted', () => {
    const action: LinksAction = {
      type: LinksActionType.ActionStarted,
      action: {
        info: mocks.exchangeActionInfo,
        isTrusted: true,
      },
    }

    const newState = linksReducer(defaultLinksState, action)

    expect(newState.action).toEqual(action.action)
  })

  it('should handle ActionFinished', () => {
    const action: LinksAction = {
      type: LinksActionType.ActionFinished,
    }

    const newState = linksReducer(defaultLinksState, action)

    // Assert the expected changes in the state
    expect(newState.action).toBeNull()
  })

  it('should handle AthorizationsChanged', () => {
    const walletId = 'exampleWalletId'
    const authorization = 'exampleAuthorization'
    const action: LinksAction = {
      type: LinksActionType.AthorizationsChanged,
      walletId,
      authorization,
    }

    const newState = linksReducer(defaultLinksState, action)

    expect(newState.authorizations.get(walletId)).toEqual(authorization)
  })
})
