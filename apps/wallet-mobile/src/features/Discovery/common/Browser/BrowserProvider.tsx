import {invalid, useAsyncStorage} from '@yoroi/common'
import {produce} from 'immer'
import React, {createContext, ReactNode, useContext, useEffect} from 'react'

export const defaultBrowserActions: BrowserContextActions = {
  addBrowserTab: () => invalid('missing init'),
  setTabActive: () => invalid('missing init'),
  updateTab: () => invalid('missing init'),
  removeTab: () => invalid('missing init'),
  switchTab: () => invalid('missing init'),
} as const

const initialBrowserState: BrowserContextState = {
  tabs: [],
  tabActiveIndex: -1,
  status: 'waiting',
  searchEngine: 'Google',
  switchTabOpen: false,
}

export type TabItem = {
  id: string
  url: string
  captureImage?: string
}

type StatusBrowser = 'waiting' | 'active'

type BrowserContextState = Readonly<{
  tabs: TabItem[]
  tabActiveIndex: number
  status: StatusBrowser
  searchEngine: 'Google'
  switchTabOpen: boolean
}>

export type BrowserProviderContext = BrowserContextState & BrowserContextActions

const BrowserContext = createContext<BrowserProviderContext>({
  ...initialBrowserState,
  ...defaultBrowserActions,
})

const storageRootBrowser = 'browser'
const storageBrowserState = 'browser-state'

export const BrowserProvider = ({children}: {children: ReactNode}) => {
  const storage = useAsyncStorage()
  const browserStorage = storage.join(`${storageRootBrowser}/`)

  const [browserState, dispatch] = React.useReducer(browserReducer, {
    ...initialBrowserState,
  })

  useEffect(() => {
    if (browserState.status === 'waiting') return
    browserStorage.setItem(storageBrowserState, JSON.stringify(browserState))
  }, [browserState, browserStorage])

  useEffect(() => {
    if (browserState.status === 'active') return
    browserStorage.getItem(storageBrowserState).then((browserStorage) => {
      if (Boolean(browserStorage) && typeof browserStorage === 'string') {
        dispatch({type: BrowserAction.SetState, state: JSON.parse(browserStorage)})
        dispatch({type: BrowserAction.SetStatusStorage, status: 'active'})
      }
    })
  }, [browserState.status, browserStorage])

  const actions = React.useRef<BrowserContextActions>({
    addBrowserTab: (url, id) => {
      dispatch({type: BrowserAction.AddBrowserTab, payload: {url, id}})
    },
    setTabActive: (index) => {
      dispatch({type: BrowserAction.SetTabActive, index})
    },
    updateTab: (tabIndex, tabInfo) => {
      dispatch({type: BrowserAction.UpdateTab, payload: {tabInfo, tabIndex}})
    },
    removeTab: (index) => {
      dispatch({type: BrowserAction.RemoveTab, index})
    },
    switchTab: (isOpen) => {
      dispatch({type: BrowserAction.SwitchTab, isOpen})
    },
  }).current

  const context = React.useMemo<BrowserProviderContext>(
    () => ({
      ...browserState,
      ...actions,
    }),
    [actions, browserState],
  )

  return <BrowserContext.Provider value={context}>{children}</BrowserContext.Provider>
}

export const useBrowser = () =>
  useContext(BrowserContext) ?? invalid('useBrowser: needs to be wrapped in a BrowserProvider')

enum BrowserAction {
  AddBrowserTab = 'addBrowserTab',
  SetState = 'setState',
  SetTabActive = 'setTabActive',
  UpdateTab = 'updateTab',
  RemoveTab = 'removeTab',
  SetStatusStorage = 'setStatusStorage',
  SwitchTab = 'SwitchTab',
}

type BrowserContextAction =
  | {
      type: BrowserAction.AddBrowserTab
      payload: {url: string; id: string}
    }
  | {
      type: BrowserAction.SetState
      state: BrowserContextState
    }
  | {
      type: BrowserAction.SetTabActive
      index: number
    }
  | {
      type: BrowserAction.UpdateTab
      payload: {
        tabInfo: Partial<Omit<TabItem, 'id'>>
        tabIndex: number
      }
    }
  | {
      type: BrowserAction.RemoveTab
      index: number
    }
  | {
      type: BrowserAction.SetStatusStorage
      status: StatusBrowser
    }
  | {
      type: BrowserAction.SwitchTab
      isOpen: boolean
    }
type BrowserContextActions = Readonly<{
  addBrowserTab: (url: string, id: string) => void
  setTabActive: (index: number) => void
  updateTab: (tabIndex: number, tabInfo: Partial<Omit<TabItem, 'id'>>) => void
  removeTab: (index: number) => void
  switchTab: (isOpen: boolean) => void
}>

export const browserReducer = (state: BrowserContextState, action: BrowserContextAction): BrowserContextState => {
  return produce(state, (draft) => {
    switch (action.type) {
      case BrowserAction.AddBrowserTab:
        draft.tabs.push({
          url: action.payload.url,
          id: action.payload.id,
        })
        break

      case BrowserAction.SetState:
        draft.tabs = action.state.tabs
        break

      case BrowserAction.SetTabActive:
        draft.tabActiveIndex = action.index
        break

      case BrowserAction.UpdateTab:
        draft.tabs[action.payload.tabIndex] = {
          ...draft.tabs[action.payload.tabIndex],
          ...action.payload.tabInfo,
        }
        break

      case BrowserAction.RemoveTab:
        draft.tabs.splice(action.index, 1)
        break

      case BrowserAction.SetStatusStorage:
        draft.status = action.status
        break

      case BrowserAction.SwitchTab:
        draft.switchTabOpen = action.isOpen
        break
    }
  })
}
