import {Links, Nullable} from '@yoroi/types'
import {freeze, produce, castDraft} from 'immer'

export type LinksState = Readonly<{
  // walletId -> authorization (handle 1 per wallet at time)
  authorizations: ReadonlyMap<string, string>

  action: Nullable<Links.YoroiAction>
}>

export type LinksActions = Readonly<{
  actionStarted: (action: Links.YoroiAction) => void
  actionFinished: () => void
  authorizationsChanged: (walletId: string, authorizations: string) => void
}>

export enum LinksActionType {
  ActionStarted = 'actionStarted',
  ActionFinished = 'actionFinished',
  AthorizationsChanged = 'authorizationsChanged',
}

export type LinksAction =
  | {
      type: LinksActionType.ActionStarted
      action: Links.YoroiAction
    }
  | {
      type: LinksActionType.ActionFinished
    }
  | {
      type: LinksActionType.AthorizationsChanged
      walletId: string
      authorization: string
    }

export const defaultLinksState: LinksState = freeze(
  {
    action: null,
    authorizations: new Map(),
  },
  true,
)

export const defaultLinksActions: LinksActions = freeze(
  {
    actionFinished: missingInit,
    actionStarted: missingInit,
    authorizationsChanged: missingInit,
  },
  true,
)

export const linksReducer = (
  state: Readonly<LinksState>,
  action: Readonly<LinksAction>,
) => {
  return produce(state, (draft) => {
    switch (action.type) {
      case LinksActionType.ActionStarted:
        draft.action = castDraft(action.action)
        break
      case LinksActionType.ActionFinished:
        draft.action = null
        break
      case LinksActionType.AthorizationsChanged:
        draft.authorizations.set(action.walletId, action.authorization)
        break
    }
  })
}

/* istanbul ignore next */
function missingInit() {
  console.error('[@yoroi/links] missing initialization')
}
