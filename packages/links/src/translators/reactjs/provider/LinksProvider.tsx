import * as React from 'react'
import {Links} from '@yoroi/types'

import {
  LinksActionType,
  LinksActions,
  LinksState,
  defaultLinksActions,
  defaultLinksState,
  linksReducer,
} from '../state/state'

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
}: {
  children: React.ReactNode
  initialState?: LinksState
}) => {
  const [state, dispatch] = React.useReducer(linksReducer, {
    ...defaultLinksState,
    ...initialState,
  })
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
  }).current

  const context = React.useMemo(
    () => ({...state, ...actions}),
    [state, actions],
  )

  return (
    <LinksContext.Provider value={context}>{children}</LinksContext.Provider>
  )
}
