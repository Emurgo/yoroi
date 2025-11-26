import {getLogger} from '@yoroi/common'
import {Links} from '@yoroi/types'

import * as React from 'react'

import {
  LinksActionType,
  LinksActions,
  LinksState,
  defaultLinksActions,
  defaultLinksState,
  linksReducer,
} from '../state/state'
import {PendingAction} from '../types/PendingAction'

type LinksProviderContext = React.PropsWithChildren<LinksState & LinksActions>

const initialLinksProvider: LinksProviderContext = {
  ...defaultLinksState,
  ...defaultLinksActions,
}

export const LinksContext =
  React.createContext<LinksProviderContext>(initialLinksProvider)

export const LinksProvider = ({
  children,
  initialState,
}: React.PropsWithChildren<{
  initialState?: LinksState
}>) => {
  const logger = getLogger()
  const [state, dispatch] = React.useReducer(linksReducer, {
    ...defaultLinksState,
    ...initialState,
  })

  const setPendingActionWithLogging = React.useCallback(
    (action: PendingAction | null) => {
      logger.debug('LinksProvider: setting pending action', {
        source: action?.source,
        actionType:
          action?.source === 'yoroi'
            ? action.action.info.useCase
            : action?.action.action,
        hasAction: !!action,
      })
      dispatch({
        type: LinksActionType.SetPendingAction,
        action,
      })
    },
    [logger],
  )

  const clearPendingAction = React.useCallback(() => {
    logger.debug('LinksProvider: clearing pending action')
    dispatch({type: LinksActionType.ClearPendingAction})
  }, [logger])

  const markActionProcessed = React.useCallback(() => {
    logger.debug('LinksProvider: marking action as processed')
    dispatch({type: LinksActionType.MarkActionProcessed})
  }, [logger])

  const actions = React.useRef<LinksActions>({
    authorizationsChanged: (walletId: string, authorization: string) => {
      dispatch({
        type: LinksActionType.AthorizationsChanged,
        walletId,
        authorization,
      })
    },
    actionFinished: () => {
      dispatch({type: LinksActionType.ActionFinished})
    },
    actionStarted: (action: Links.YoroiAction) => {
      dispatch({type: LinksActionType.ActionStarted, action})
    },
    setPendingAction: setPendingActionWithLogging,
    clearPendingAction,
    markActionProcessed,
  }).current

  const context = React.useMemo(
    () => ({...state, ...actions}),
    [state, actions],
  )

  React.useEffect(() => {
    logger.debug('LinksProvider: context value changed', {
      hasPendingAction: !!context.pendingAction,
      source: context.pendingAction?.source,
      actionType:
        context.pendingAction?.source === 'yoroi'
          ? context.pendingAction.action.info.useCase
          : context.pendingAction?.action.action,
    })
  }, [context.pendingAction, logger])

  return (
    <LinksContext.Provider value={context}>{children}</LinksContext.Provider>
  )
}
