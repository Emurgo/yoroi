import {EnrichmentPlugin, Event, PluginType} from '@amplitude/analytics-types'
import * as React from 'react'
import Config from 'react-native-config'

import {Logger} from '../yoroi-wallets/logging'
import {storage, YoroiStorage} from '../yoroi-wallets/storage'
import {parseBoolean} from '../yoroi-wallets/utils'
import {Ampli, ampli} from './ampli'
import {mockMetricsManager} from './mocks'

const buildVariants = {
  NIGHTLY: 'production',
  PROD: 'production',
  STAGING: 'staging',
  DEV: 'development',
} as const
type MetricsEnv = (typeof buildVariants)[keyof typeof buildVariants]
const currentBuildVariant = Config.BUILD_VARIANT ?? 'DEV'
const environment: MetricsEnv = Object.keys(buildVariants).includes(currentBuildVariant)
  ? buildVariants[currentBuildVariant]
  : buildVariants.DEV

const infoPlugin: EnrichmentPlugin = {
  name: 'info-plugin',
  type: PluginType.ENRICHMENT,
  setup: async () => Promise.resolve(),
  execute: async (event: Event) => {
    Logger.info('[metrics-react-native]', event.event_type, event.event_properties)
    return Promise.resolve(event)
  },
}

export const makeMetricsStorage = (yoroiStorage: YoroiStorage = storage) => {
  const enabledKey = 'metrics-enabled'
  const settingsStorage = yoroiStorage.join('appSettings/')

  const enabled = {
    read: () => settingsStorage.getItem(enabledKey).then((value) => parseBoolean(value) ?? __DEV__),
    write: (enable: boolean) => settingsStorage.setItem(enabledKey, JSON.stringify(enable)),
  } as const

  return {
    enabled,
  } as const
}
export type MetricsStorage = ReturnType<typeof makeMetricsStorage>

export const makeMetricsManager = (
  metricsStorage: MetricsStorage = makeMetricsStorage(storage),
  metricsModule: Ampli = ampli,
) => {
  const disable = () =>
    metricsStorage.enabled
      .write(false)
      .then(() => metricsModule.flush().promise)
      .then(() => metricsModule.client.setOptOut(true))
  const enable = () => metricsStorage.enabled.write(true).then(() => metricsModule.client.setOptOut(false))
  const enabled = () => metricsStorage.enabled.read()

  const init = () =>
    enabled()
      .then((isEnabled) =>
        !metricsModule.isLoaded
          ? metricsModule.load({
              environment,
              client: {
                configuration: {
                  optOut: !isEnabled,
                  flushIntervalMillis: flushIntervalMs,
                  trackingOptions: {
                    ipAddress: false,
                  },
                },
              },
            }).promise
          : Promise.resolve(null),
      )
      .then(() => {
        if (environment === buildVariants.STAGING) {
          metricsModule.client.add(infoPlugin)
        }
      })
      .catch((e) => {
        Logger.error(`[metrics-react-native] metrics.load failed:`, e)
      })

  const track = {
    nftGalleryDetailsTab: metricsModule.nftGalleryDetailsTab.bind(metricsModule),
    nftGalleryPageViewed: metricsModule.nftGalleryPageViewed.bind(metricsModule),
    nftGallerySearchActivated: metricsModule.nftGallerySearchActivated.bind(metricsModule),
    nftGalleryDetailsPageViewed: metricsModule.nftGalleryDetailsPageViewed.bind(metricsModule),

    sendInitiated: metricsModule.sendInitiated.bind(metricsModule),
    sendSelectAssetPageViewed: metricsModule.sendSelectAssetPageViewed.bind(metricsModule),
    sendSelectAssetSelected: metricsModule.sendSelectAssetSelected.bind(metricsModule),
    sendSelectAssetUpdated: metricsModule.sendSelectAssetUpdated.bind(metricsModule),
    sendSummaryPageViewed: metricsModule.sendSummaryPageViewed.bind(metricsModule),
    sendSummarySubmitted: metricsModule.sendSummarySubmitted.bind(metricsModule),

    swapInitiated: metricsModule.swapInitiated.bind(metricsModule),
    swapPoolChanged: metricsModule.swapPoolChanged.bind(metricsModule),
    swapOrderSelected: metricsModule.swapOrderSelected.bind(metricsModule),
    swapAssetToChanged: metricsModule.swapAssetToChanged.bind(metricsModule),
    swapOrderSubmitted: metricsModule.swapOrderSubmitted.bind(metricsModule),
    swapSlippageChanged: metricsModule.swapSlippageChanged.bind(metricsModule),
    swapAssetFromChanged: metricsModule.swapAssetFromChanged.bind(metricsModule),
    swapConfirmedPageViewed: metricsModule.swapConfirmedPageViewed.bind(metricsModule),
    swapCancelationSubmitted: metricsModule.swapCancelationSubmitted.bind(metricsModule),
  } as const

  return {
    init,
    track,
    enable,
    disable,
    enabled,
  } as const
}

export type MetricsManager = ReturnType<typeof makeMetricsManager>
export type MetricsManagerContext = Omit<MetricsManager, 'enable' | 'disable'> &
  Readonly<{
    enable: () => void
    disable: () => void
  }>
export type MetricsState = Readonly<{
  isLoaded: boolean
  isEnabled: boolean
}>
export type MetricsActions = Readonly<{
  isLoadedChanged: (loaded: boolean) => void
  isEnabledChanged: (enabled: boolean) => void
}>
export type MetricsAction =
  | {type: 'isLoadedChanged'; isLoaded: boolean}
  | {type: 'isEnabledChanged'; isEnabled: boolean}
const metricsReducer = (state: MetricsState, action: MetricsAction) => {
  switch (action.type) {
    case 'isLoadedChanged':
      return {...state, isLoaded: action.isLoaded}
    case 'isEnabledChanged':
      return {...state, isEnabled: action.isEnabled}
    default:
      return state
  }
}
type MetricsContextType = MetricsManagerContext & MetricsState

const defaultState: MetricsState = {
  isLoaded: false,
  isEnabled: false,
} as const
const defaultActions: MetricsActions = {
  isLoadedChanged: (_loaded: boolean) => Logger.error('[metrics-react] missing initialization'),
  isEnabledChanged: (_enabled: boolean) => Logger.error('[metrics-react] missing initialization'),
} as const
const defaultManager: MetricsManager = mockMetricsManager()
const MetricsContext = React.createContext<MetricsContextType>({
  ...defaultState,
  ...defaultActions,
  ...defaultManager,
})
export const MetricsProvider = ({
  children,
  metricsManager,
  initialState,
}: {
  children: React.ReactNode
  metricsManager: MetricsManager
  initialState?: Partial<MetricsState>
}) => {
  const [state, dispatch] = React.useReducer(metricsReducer, {
    ...defaultState,
    ...initialState,
  })
  const {disable: managerDisable, enable: managerEnable} = metricsManager

  const actions = React.useRef<MetricsActions>({
    isLoadedChanged: (isLoaded) => dispatch({type: 'isLoadedChanged', isLoaded}),
    isEnabledChanged: (isEnabled) => dispatch({type: 'isEnabledChanged', isEnabled}),
  }).current

  const disable = React.useCallback(() => {
    actions.isEnabledChanged(false)
    managerDisable()
  }, [actions, managerDisable])
  const enable = React.useCallback(() => {
    actions.isEnabledChanged(true)
    managerEnable()
  }, [actions, managerEnable])

  React.useEffect(() => {
    Promise.all([metricsManager.init(), metricsManager.enabled()]).then(([_, enabled]) => {
      actions.isLoadedChanged(true)
      actions.isEnabledChanged(enabled)
    })
  }, [actions, metricsManager])

  const context = React.useMemo(
    () => ({...state, ...metricsManager, enable, disable}),
    [disable, enable, metricsManager, state],
  )

  if (!state.isLoaded) return null

  return <MetricsContext.Provider value={context}>{children}</MetricsContext.Provider>
}

export const useMetrics = () => React.useContext(MetricsContext)

const flushIntervalMs = 5000
