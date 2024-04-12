import {invalid, useAsyncStorage} from '@yoroi/common'
import {produce} from 'immer'
import * as React from 'react'

import {useSelectedWallet} from '../../../features/WalletManager/Context'

export const defaultActions: BrowserActions = {
  addTab: () => invalid('missing init'),
  setTabActive: () => invalid('missing init'),
  updateTab: () => invalid('missing init'),
  removeTab: () => invalid('missing init'),
  openTabs: () => invalid('missing init'),
} as const

const defaultState: BrowserState = {
  tabs: [],
  tabActiveIndex: -1,
  status: 'waiting',
  tabsOpen: false,
} as const

export type TabItem = {
  id: string
  url: string
}

type BrowserStatus = 'waiting' | 'active'

type BrowserState = {
  tabs: TabItem[]
  tabActiveIndex: number
  status: BrowserStatus
  tabsOpen: boolean
}

const BrowserContext = React.createContext<BrowserState & BrowserActions>({
  ...defaultState,
  ...defaultActions,
})

const storageRootBrowser = 'browser'
const storageBrowserState = 'browser-state'

export const BrowserProvider = ({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: Partial<BrowserState>
}) => {
  const storage = useAsyncStorage()
  const wallet = useSelectedWallet()
  const browserStorage = storage.join(`wallet/${wallet.id}/${storageRootBrowser}/`)

  const [browserState, dispatch] = React.useReducer(browserReducer, {...defaultState, ...initialState})

  React.useEffect(() => {
    if (browserState.status === 'waiting') return
    browserStorage.setItem(storageBrowserState, JSON.stringify(browserState))
  }, [browserState, browserStorage])

  React.useEffect(() => {
    if (browserState.status === 'active') return
    browserStorage.getItem(storageBrowserState).then((browserStorage) => {
      if (Boolean(browserStorage) && typeof browserStorage === 'string') {
        dispatch({type: BrowserActionType.SetState, state: JSON.parse(browserStorage)})
        dispatch({type: BrowserActionType.SetStatus, status: 'active'})
      }
    })
  }, [browserState.status, browserStorage])

  const actions = React.useRef<BrowserActions>({
    addTab: (url, id) => {
      dispatch({type: BrowserActionType.AddTab, payload: {url, id}})
    },
    setTabActive: (index) => {
      dispatch({type: BrowserActionType.SetTabActive, index})
    },
    updateTab: (tabIndex, tabInfo) => {
      dispatch({type: BrowserActionType.UpdateTab, payload: {tabInfo, tabIndex}})
    },
    removeTab: (index) => {
      dispatch({type: BrowserActionType.RemoveTab, index})
    },
    switchTab: (isOpen) => {
      dispatch({type: BrowserActionType.OpenTabs, isOpen})
    },
  }).current

  const context = React.useMemo<BrowserState & BrowserActions>(
    () => ({...browserState, ...actions}),
    [actions, browserState],
  )

  return <BrowserContext.Provider value={context}>{children}</BrowserContext.Provider>
}

export const useBrowser = () =>
  React.useContext(BrowserContext) ?? invalid('useBrowser: needs to be wrapped in a BrowserProvider')

enum BrowserActionType {
  AddTab = 'addTab',
  SetState = 'setState',
  SetTabActive = 'setTabActive',
  UpdateTab = 'updateTab',
  RemoveTab = 'removeTab',
  SetStatus = 'setStatus',
  OpenTabs = 'openTabs',
}

type BrowserContextAction =
  | {
      type: BrowserActionType.AddTab
      payload: {url: string; id: string}
    }
  | {
      type: BrowserActionType.SetState
      state: BrowserState
    }
  | {
      type: BrowserActionType.SetTabActive
      index: number
    }
  | {
      type: BrowserActionType.UpdateTab
      payload: {
        tabInfo: Partial<Omit<TabItem, 'id'>>
        tabIndex: number
      }
    }
  | {
      type: BrowserActionType.RemoveTab
      index: number
    }
  | {
      type: BrowserActionType.SetStatus
      status: BrowserStatus
    }
  | {
      type: BrowserActionType.OpenTabs
      isOpen: boolean
    }

type BrowserActions = Readonly<{
  addTab: (url: string, id: string) => void
  setTabActive: (index: number) => void
  updateTab: (tabIndex: number, tabInfo: Partial<Omit<TabItem, 'id'>>) => void
  removeTab: (index: number) => void
  openTabs: (isOpen: boolean) => void
}>

export const browserReducer = (state: BrowserState, action: BrowserContextAction): BrowserState => {
  return produce(state, (draft) => {
    switch (action.type) {
      case BrowserActionType.AddTab:
        draft.tabs.push({url: action.payload.url, id: action.payload.id})
        break

      case BrowserActionType.SetState:
        draft.tabs = action.state.tabs
        break

      case BrowserActionType.SetTabActive:
        draft.tabActiveIndex = action.index
        break

      case BrowserActionType.UpdateTab:
        draft.tabs[action.payload.tabIndex] = {
          ...draft.tabs[action.payload.tabIndex],
          ...action.payload.tabInfo,
        }
        break

      case BrowserActionType.RemoveTab:
        draft.tabs.splice(action.index, 1)
        break

      case BrowserActionType.SetStatus:
        draft.status = action.status
        break

      case BrowserActionType.OpenTabs:
        draft.tabsOpen = action.isOpen
        break
    }
  })
}
