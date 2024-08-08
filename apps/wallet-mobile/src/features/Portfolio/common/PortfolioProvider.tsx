import {invalid} from '@yoroi/common'
import {produce} from 'immer'
import * as React from 'react'

export const defaultActions: PortfolioActions = {
  setIsPrimaryTokenActive: () => invalid('missing init'),
} as const

const defaultState: PortfolioState = {
  isPrimaryTokenActive: false,
} as const

type PortfolioState = {
  isPrimaryTokenActive: boolean
}

const PortfolioContext = React.createContext<PortfolioState & PortfolioActions>({
  ...defaultState,
  ...defaultActions,
})

export const PortfolioProvider = ({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: Partial<PortfolioState>
}) => {
  const [portfolioState, dispatch] = React.useReducer(portfolioReducer, {...defaultState, ...initialState})

  const actions = React.useRef<PortfolioActions>({
    setIsPrimaryTokenActive: (isActive) => {
      dispatch({type: PortfolioActionType.SetIsPrimaryTokenActive, payload: {isActive}})
    },
  }).current

  const context = React.useMemo<PortfolioState & PortfolioActions>(
    () => ({...portfolioState, ...actions}),
    [actions, portfolioState],
  )

  return <PortfolioContext.Provider value={context}>{children}</PortfolioContext.Provider>
}

export const usePortfolio = () =>
  React.useContext(PortfolioContext) ?? {isPrimaryTokenActive: false, setIsPrimaryTokenActive: () => null}

enum PortfolioActionType {
  SetIsPrimaryTokenActive = 'setIsPrimaryTokenActive',
}

type PortfolioContextAction = {
  type: PortfolioActionType.SetIsPrimaryTokenActive
  payload: {isActive: boolean}
}

type PortfolioActions = Readonly<{
  setIsPrimaryTokenActive: (isActive: boolean) => void
}>

export const portfolioReducer = (state: PortfolioState, action: PortfolioContextAction): PortfolioState => {
  return produce(state, (draft) => {
    switch (action.type) {
      case PortfolioActionType.SetIsPrimaryTokenActive:
        draft.isPrimaryTokenActive = action.payload.isActive
        break
    }
  })
}
