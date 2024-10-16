import {invalid} from '@yoroi/common'
import {produce} from 'immer'
import * as React from 'react'

export const PortfolioDetailsTab = {
  Performance: 'Performance',
  Overview: 'Overview',
  Transactions: 'Transactions',
} as const
export type PortfolioDetailsTab = (typeof PortfolioDetailsTab)[keyof typeof PortfolioDetailsTab]

export const PortfolioListTab = {
  Wallet: 'Wallet',
  Dapps: 'Dapps',
} as const
export type PortfolioListTab = (typeof PortfolioListTab)[keyof typeof PortfolioListTab]

export const PortfolioDappsTab = {
  LiquidityPool: 'LiquidityPool',
  OpenOrders: 'OpenOrders',
  LendAndBorrow: 'LendAndBorrow',
} as const

export type PortfolioDappsTab = (typeof PortfolioDappsTab)[keyof typeof PortfolioDappsTab]

const defaultActions: PortfolioActions = {
  setIsPrimaryTokenActive: () => invalid('missing init'),
  setDetailsTab: () => invalid('missing init'),
  setListTab: () => invalid('missing init'),
  setDappsTab: () => invalid('missing init'),
  resetTabs: () => invalid('missing init'),
} as const

const defaultState: PortfolioState = {
  isPrimaryTokenActive: false,
  detailsTab: PortfolioDetailsTab.Overview,
  listTab: PortfolioListTab.Wallet,
  dappsTab: PortfolioDappsTab.LiquidityPool,
} as const

type PortfolioState = {
  isPrimaryTokenActive: boolean
  detailsTab: PortfolioDetailsTab
  listTab: PortfolioListTab
  dappsTab: PortfolioDappsTab
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
    setDetailsTab: (tab) => {
      dispatch({type: PortfolioActionType.SetDetailsTab, payload: {tab}})
    },
    setListTab: (tab) => {
      dispatch({type: PortfolioActionType.SetListTab, payload: {tab}})
    },
    setDappsTab: (tab) => {
      dispatch({type: PortfolioActionType.SetDappsTab, payload: {tab}})
    },
    resetTabs: () => dispatch({type: PortfolioActionType.ResetTabs}),
  }).current

  const context = React.useMemo<PortfolioState & PortfolioActions>(
    () => ({...portfolioState, ...actions}),
    [actions, portfolioState],
  )

  return <PortfolioContext.Provider value={context}>{children}</PortfolioContext.Provider>
}

export const usePortfolio = () =>
  React.useContext(PortfolioContext) ?? {isPrimaryTokenActive: false, setIsPrimaryTokenActive: () => null}

const PortfolioActionType = {
  SetIsPrimaryTokenActive: 'SetIsPrimaryTokenActive',
  SetDetailsTab: 'SetDetailsTab',
  SetListTab: 'SetListTab',
  SetDappsTab: 'SetDappsTab',
  ResetTabs: 'ResetTabs',
} as const
type PortfolioActionType = (typeof PortfolioActionType)[keyof typeof PortfolioActionType]

type PortfolioContextAction =
  | SetIsPrimaryTokenActiveAction
  | SetDetailsTabAction
  | SetListTabAction
  | SetDappsTabAction
  | ResetTabsAction

type SetIsPrimaryTokenActiveAction = {
  type: typeof PortfolioActionType.SetIsPrimaryTokenActive
  payload: {isActive: boolean}
}

type SetDetailsTabAction = {
  type: typeof PortfolioActionType.SetDetailsTab
  payload: {tab: PortfolioDetailsTab}
}

type SetListTabAction = {
  type: typeof PortfolioActionType.SetListTab
  payload: {tab: PortfolioListTab}
}

type SetDappsTabAction = {
  type: typeof PortfolioActionType.SetDappsTab
  payload: {tab: PortfolioDappsTab}
}

type ResetTabsAction = {
  type: typeof PortfolioActionType.ResetTabs
}

type PortfolioActions = Readonly<{
  setIsPrimaryTokenActive: (isActive: boolean) => void
  setDetailsTab: (tab: PortfolioDetailsTab) => void
  setListTab: (tab: PortfolioListTab) => void
  setDappsTab: (tab: PortfolioDappsTab) => void
  resetTabs: () => void
}>

const portfolioReducer = (state: PortfolioState, action: PortfolioContextAction): PortfolioState => {
  return produce(state, (draft) => {
    switch (action.type) {
      case PortfolioActionType.SetIsPrimaryTokenActive:
        draft.isPrimaryTokenActive = action.payload.isActive
        break
      case PortfolioActionType.SetDetailsTab:
        draft.detailsTab = action.payload.tab
        break
      case PortfolioActionType.SetListTab:
        draft.listTab = action.payload.tab
        break
      case PortfolioActionType.SetDappsTab:
        draft.dappsTab = action.payload.tab
        break
      case PortfolioActionType.ResetTabs:
        draft.detailsTab = defaultState.detailsTab
        draft.listTab = defaultState.listTab
        draft.dappsTab = defaultState.dappsTab
        break
    }
  })
}
