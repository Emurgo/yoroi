import {invalid} from '@yoroi/common'
import {useWalletManager} from '@yoroi/wallet-manager'

import {produce} from 'immer'
import * as React from 'react'
import WebView from 'react-native-webview'

import {WalletNameOverrideProvider} from './WalletNameOverrideContext'

const defaultActions: BrowserActions = {
  addTab: () => invalid('missing init'),
  addTabAndSetActive: () => invalid('missing init'),
  setTabActive: () => invalid('missing init'),
  updateTab: () => invalid('missing init'),
  removeTab: () => invalid('missing init'),
  openTabs: () => invalid('missing init'),
  registerWebView: () => invalid('missing init'),
  unregisterWebView: () => invalid('missing init'),
  sendDisconnectToOrigins: () => invalid('missing init'),
} as const

const defaultState: BrowserState = {
  tabs: [],
  tabActiveIndex: -1,
  tabsOpen: false,
} as const

type WebViewRegistry = Map<
  string,
  {
    webViewRef: React.RefObject<WebView | null>
    sendDisconnectMessage: () => void
  }
>

export type TabItem = {
  id: string
  url: string
}

type BrowserState = {
  tabs: TabItem[]
  tabActiveIndex: number
  tabsOpen: boolean
}

const BrowserContext = React.createContext<BrowserState & BrowserActions>({
  ...defaultState,
  ...defaultActions,
})

const memoryStorage = new Map<string, BrowserState>()

export const BrowserProvider = ({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: Partial<BrowserState>
}) => {
  const {
    selected: {wallet, network},
  } = useWalletManager()

  const storageId = wallet?.id != null ? `${wallet.id}-${network}` : null

  const [browserState, dispatch] = React.useReducer(browserReducer, {
    ...defaultState,
    ...initialState,
  })

  const webViewRegistryRef = React.useRef<WebViewRegistry>(new Map())

  React.useEffect(() => {
    if (storageId === null) return
    memoryStorage.set(storageId, browserState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browserState])

  React.useEffect(() => {
    if (storageId === null) return
    const state = memoryStorage.get(storageId)
    if (state) {
      dispatch({type: BrowserActionType.SetState, state})
    } else {
      dispatch({
        type: BrowserActionType.SetState,
        state: {...defaultState, ...initialState},
      })
    }
  }, [storageId, initialState])

  const actions = React.useRef<BrowserActions>({
    addTab: (url, id) => {
      dispatch({type: BrowserActionType.AddTab, payload: {url, id}})
    },
    addTabAndSetActive: (url, id) => {
      dispatch({type: BrowserActionType.AddTabAndSetActive, payload: {url, id}})
    },
    setTabActive: (index) => {
      dispatch({type: BrowserActionType.SetTabActive, index})
    },
    updateTab: (tabIndex, tabInfo) => {
      dispatch({
        type: BrowserActionType.UpdateTab,
        payload: {tabInfo, tabIndex},
      })
    },
    removeTab: (index) => {
      dispatch({type: BrowserActionType.RemoveTab, index})
    },
    openTabs: (isOpen) => {
      dispatch({type: BrowserActionType.OpenTabs, isOpen})
    },
    registerWebView: (
      tabId: string,
      webViewRef: React.RefObject<WebView | null>,
      sendDisconnectMessage: () => void,
    ) => {
      webViewRegistryRef.current.set(tabId, {webViewRef, sendDisconnectMessage})
    },
    unregisterWebView: (tabId: string) => {
      webViewRegistryRef.current.delete(tabId)
    },
    sendDisconnectToOrigins: (origins: string[]) => {
      // Get current tabs directly from the state via the ref to avoid stale closure
      const getCurrentTabs = () => {
        if (storageId === null) return []
        const currentState = memoryStorage.get(storageId)
        return currentState?.tabs || []
      }

      const currentTabs = getCurrentTabs()
      currentTabs.forEach((tab) => {
        try {
          const tabOrigin = new URL(tab.url).origin
          if (origins.includes(tabOrigin)) {
            const registration = webViewRegistryRef.current.get(tab.id)
            if (registration) {
              registration.sendDisconnectMessage()
            }
          }
        } catch {
          // Invalid URL, skip
        }
      })
    },
  }).current

  const context = React.useMemo<BrowserState & BrowserActions>(
    () => ({...browserState, ...actions}),
    [actions, browserState],
  )

  return (
    <WalletNameOverrideProvider>
      <BrowserContext.Provider value={context}>
        {children}
      </BrowserContext.Provider>
    </WalletNameOverrideProvider>
  )
}

export const useBrowser = () =>
  React.useContext(BrowserContext) ??
  invalid('useBrowser: needs to be wrapped in a BrowserProvider')

enum BrowserActionType {
  AddTab = 'addTab',
  AddTabAndSetActive = 'addTabAndSetActive',
  SetState = 'setState',
  SetTabActive = 'setTabActive',
  UpdateTab = 'updateTab',
  RemoveTab = 'removeTab',
  OpenTabs = 'openTabs',
}

type BrowserContextAction =
  | {
      type: BrowserActionType.AddTab
      payload: {url: string; id: string}
    }
  | {
      type: BrowserActionType.AddTabAndSetActive
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
      type: BrowserActionType.OpenTabs
      isOpen: boolean
    }

type BrowserActions = Readonly<{
  addTab: (url: string, id: string) => void
  addTabAndSetActive: (url: string, id: string) => void
  setTabActive: (index: number) => void
  updateTab: (tabIndex: number, tabInfo: Partial<Omit<TabItem, 'id'>>) => void
  removeTab: (index: number) => void
  openTabs: (isOpen: boolean) => void
  registerWebView: (
    tabId: string,
    webViewRef: React.RefObject<WebView | null>,
    sendDisconnectMessage: () => void,
  ) => void
  unregisterWebView: (tabId: string) => void
  sendDisconnectToOrigins: (origins: string[]) => void
}>

const browserReducer = (
  state: BrowserState,
  action: BrowserContextAction,
): BrowserState => {
  return produce(state, (draft) => {
    switch (action.type) {
      case BrowserActionType.AddTab:
        draft.tabs.push({url: action.payload.url, id: action.payload.id})
        break

      case BrowserActionType.AddTabAndSetActive:
        draft.tabs.push({url: action.payload.url, id: action.payload.id})
        draft.tabActiveIndex = draft.tabs.length - 1
        break

      case BrowserActionType.SetState:
        draft.tabs = action.state.tabs
        break

      case BrowserActionType.SetTabActive:
        draft.tabActiveIndex = action.index
        break

      case BrowserActionType.UpdateTab:
        const tab = draft.tabs[action.payload.tabIndex]
        if (tab) {
          draft.tabs[action.payload.tabIndex] = {
            ...tab,
            ...action.payload.tabInfo,
            id: tab.id,
          }
        }
        break

      case BrowserActionType.RemoveTab:
        draft.tabs.splice(action.index, 1)
        break

      case BrowserActionType.OpenTabs:
        draft.tabsOpen = action.isOpen
        break
    }
  })
}
