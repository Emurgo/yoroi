import {getLogger} from '@yoroi/common'
import {Links} from '@yoroi/types'

import {castDraft, freeze, produce} from 'immer'

import {PendingAction} from '../types/PendingAction'

export type LinksState = Readonly<{
  // walletId -> authorization (handle 1 per wallet at time)
  authorizations: ReadonlyMap<string, string>

  // Pending action from either Yoroi or Cardano links
  pendingAction: PendingAction | null
}>

export type LinksActions = Readonly<{
  actionStarted: (action: Links.YoroiAction) => void
  actionFinished: () => void
  authorizationsChanged: (walletId: string, authorization: string) => void
  setPendingAction: (action: PendingAction | null) => void
  clearPendingAction: () => void
  markActionProcessed: () => void
}>

export enum LinksActionType {
  ActionStarted = 'actionStarted',
  ActionFinished = 'actionFinished',
  AthorizationsChanged = 'authorizationsChanged',
  SetPendingAction = 'setPendingAction',
  ClearPendingAction = 'clearPendingAction',
  MarkActionProcessed = 'markActionProcessed',
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
  | {
      type: LinksActionType.SetPendingAction
      action: PendingAction | null
    }
  | {
      type: LinksActionType.ClearPendingAction
    }
  | {
      type: LinksActionType.MarkActionProcessed
    }

export const defaultLinksState: LinksState = freeze(
  {
    pendingAction: null,
    authorizations: new Map(),
  },
  true,
)

export const defaultLinksActions: LinksActions = freeze(
  {
    actionFinished: missingInit,
    actionStarted: missingInit,
    authorizationsChanged: missingInit,
    setPendingAction: missingInit,
    clearPendingAction: missingInit,
    markActionProcessed: missingInit,
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
        // Legacy: convert YoroiAction to PendingAction
        draft.pendingAction = {
          source: 'yoroi',
          action: castDraft(action.action),
        }
        break
      case LinksActionType.ActionFinished:
        draft.pendingAction = null
        break
      case LinksActionType.AthorizationsChanged:
        draft.authorizations.set(action.walletId, action.authorization)
        break
      case LinksActionType.SetPendingAction:
        draft.pendingAction = action.action ? castDraft(action.action) : null
        break
      case LinksActionType.ClearPendingAction:
        draft.pendingAction = null
        break
      case LinksActionType.MarkActionProcessed:
        draft.pendingAction = null
        break
    }
  })
}

/* istanbul ignore next */
function missingInit() {
  getLogger().error('[@yoroi/links] missing initialization', {
    origin: 'links',
  })
}
