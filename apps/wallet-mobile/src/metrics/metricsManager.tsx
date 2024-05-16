import {EnrichmentPlugin, Event, PluginType} from '@amplitude/analytics-types'
import {isKeyOf, parseBoolean} from '@yoroi/common'
import {App} from '@yoroi/types'
import * as React from 'react'
import Config from 'react-native-config'

import {Logger} from '../yoroi-wallets/logging'
import {rootStorage} from '../yoroi-wallets/storage/rootStorage'
import {Ampli, ampli} from './ampli'
import {mockMetricsManager} from './mocks'

const buildVariants = {
  NIGHTLY: 'production',
  PROD: 'production',
  STAGING: 'development',
  DEV: 'development',
} as const
type MetricsEnv = (typeof buildVariants)[keyof typeof buildVariants]
type BUILD_VARIANT_KEY = keyof typeof buildVariants

const isBuildVariant = (variant?: string): variant is BUILD_VARIANT_KEY =>
  typeof variant === 'string' && isKeyOf(variant, buildVariants)

const currentBuildVariant = isBuildVariant(Config?.BUILD_VARIANT) ? Config.BUILD_VARIANT : 'DEV'
const environment: MetricsEnv = Object.keys(buildVariants).includes(currentBuildVariant)
  ? buildVariants[currentBuildVariant]
  : buildVariants.DEV

const infoPlugin: EnrichmentPlugin = {
  name: 'info-plugin',
  type: PluginType.ENRICHMENT,
  setup: async () => Promise.resolve(),
  execute: async (event: Event) => {
    return Promise.resolve(event)
  },
}

export const makeMetricsStorage = (yoroiStorage: App.Storage = rootStorage) => {
  const enabledKey = 'metrics-enabled'
  const consentRequestedKey = 'metrics-consentRequested'
  const settingsStorage = yoroiStorage.join('appSettings/')

  const enabled = {
    read: () => settingsStorage.getItem(enabledKey).then((value) => parseBoolean(value) ?? __DEV__),
    write: (enable: boolean) => settingsStorage.setItem(enabledKey, JSON.stringify(enable)),
  } as const

  const consentRequested = {
    read: () => settingsStorage.getItem(consentRequestedKey).then((value) => parseBoolean(value) ?? false),
    write: (req: boolean) => settingsStorage.setItem(consentRequestedKey, JSON.stringify(req)),
  } as const

  return {
    enabled,
    consentRequested,
  } as const
}
export type MetricsStorage = ReturnType<typeof makeMetricsStorage>

export const makeMetricsManager = (
  metricsStorage: MetricsStorage = makeMetricsStorage(rootStorage),
  metricsModule: Ampli = ampli,
) => {
  const disable = () =>
    metricsStorage.enabled
      .write(false)
      .then(() => metricsModule.flush().promise)
      .then(() => metricsModule.client.setOptOut(true))
  const enable = () => metricsStorage.enabled.write(true).then(() => metricsModule.client.setOptOut(false))
  const enabled = () => metricsStorage.enabled.read()

  const consentRequested = () => metricsStorage.consentRequested.read()
  const requestConsent = () => metricsStorage.consentRequested.write(true)
  const resetConsent = () => metricsStorage.consentRequested.write(false)

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
    allWalletsPageViewed: metricsModule.allWalletsPageViewed.bind(metricsModule),
    assetsPageViewed: metricsModule.assetsPageViewed.bind(metricsModule),
    menuPageViewed: metricsModule.menuPageViewed.bind(metricsModule),
    settingsPageViewed: metricsModule.settingsPageViewed.bind(metricsModule),
    stakingCenterPageViewed: metricsModule.stakingCenterPageViewed.bind(metricsModule),
    transactionsPageViewed: metricsModule.transactionsPageViewed.bind(metricsModule),
    votingPageViewed: metricsModule.votingPageViewed.bind(metricsModule),
    walletPageViewed: metricsModule.walletPageViewed.bind(metricsModule),

    nftGalleryDetailsTab: metricsModule.nftGalleryDetailsTab.bind(metricsModule),
    nftGalleryPageViewed: metricsModule.nftGalleryPageViewed.bind(metricsModule),
    nftGallerySearchActivated: metricsModule.nftGallerySearchActivated.bind(metricsModule),
    nftGalleryDetailsPageViewed: metricsModule.nftGalleryDetailsPageViewed.bind(metricsModule),
    nftGalleryDetailsImageViewed: metricsModule.nftGalleryDetailsImageViewed.bind(metricsModule),

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

    walletPageExchangeClicked: metricsModule.walletPageExchangeClicked.bind(metricsModule),
    walletPageBuyBannerClicked: metricsModule.walletPageBuyBannerClicked.bind(metricsModule),

    exchangePageViewed: metricsModule.exchangePageViewed.bind(metricsModule),
    exchangeSubmitted: metricsModule.exchangeSubmitted.bind(metricsModule),

    governanceChooseDrepPageViewed: metricsModule.governanceChooseDrepPageViewed.bind(metricsModule),
    governanceConfirmTransactionPageViewed: metricsModule.governanceConfirmTransactionPageViewed.bind(metricsModule),
    governanceDashboardPageViewed: metricsModule.governanceDashboardPageViewed.bind(metricsModule),
    governanceTransactionSuccessPageViewed: metricsModule.governanceTransactionSuccessPageViewed.bind(metricsModule),

    createWalletDetailsSettled: metricsModule.createWalletDetailsSettled.bind(metricsModule),
    restoreWalletDetailsSettled: metricsModule.restoreWalletDetailsSettled.bind(metricsModule),

    receiveAmountGeneratedPageViewed: metricsModule.receiveAmountGeneratedPageViewed.bind(metricsModule),
    receiveAmountPageViewed: metricsModule.receiveAmountPageViewed.bind(metricsModule),
    receiveCopyAddressClicked: metricsModule.receiveCopyAddressClicked.bind(metricsModule),
    receiveGenerateNewAddressClicked: metricsModule.receiveGenerateNewAddressClicked.bind(metricsModule),
    receivePageListViewed: metricsModule.receivePageListViewed.bind(metricsModule),
    receiveShareAddressClicked: metricsModule.receiveShareAddressClicked.bind(metricsModule),
    receivePageViewed: metricsModule.receivePageViewed.bind(metricsModule),
  } as const

  return {
    init,
    track,
    enable,
    disable,
    enabled,
    consentRequested,
    requestConsent,
    resetConsent,
  } as const
}

export type MetricsManager = ReturnType<typeof makeMetricsManager>
export type MetricsManagerContext = Omit<MetricsManager, 'enable' | 'disable' | 'requestConsent' | 'resetConsent'> &
  Readonly<{
    enable: () => void
    disable: () => void
    requestConsent: () => void
    resetConsent: () => void
  }>
export type MetricsState = Readonly<{
  isLoaded: boolean
  isEnabled: boolean
  isConsentRequested: boolean
}>
export type MetricsActions = Readonly<{
  isLoadedChanged: (loaded: boolean) => void
  isEnabledChanged: (enabled: boolean) => void
  isConsentRequestedChanged: (enabled: boolean) => void
}>
export type MetricsAction =
  | {type: 'isLoadedChanged'; isLoaded: boolean}
  | {type: 'isEnabledChanged'; isEnabled: boolean}
  | {type: 'isConsentRequestedChanged'; isConsentRequested: boolean}
const metricsReducer = (state: MetricsState, action: MetricsAction) => {
  switch (action.type) {
    case 'isLoadedChanged':
      return {...state, isLoaded: action.isLoaded}
    case 'isEnabledChanged':
      return {...state, isEnabled: action.isEnabled}
    case 'isConsentRequestedChanged':
      return {...state, isConsentRequested: action.isConsentRequested}
    default:
      return state
  }
}
type MetricsContextType = MetricsManagerContext & MetricsState

const defaultState: MetricsState = {
  isLoaded: false,
  isEnabled: false,
  isConsentRequested: false,
} as const
const defaultActions: MetricsActions = {
  isLoadedChanged: (_loaded: boolean) => Logger.error('[metrics-react] missing initialization'),
  isEnabledChanged: (_enabled: boolean) => Logger.error('[metrics-react] missing initialization'),
  isConsentRequestedChanged: (_consentRequested: boolean) => Logger.error('[metrics-react] missing initialization'),
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
  const {
    disable: managerDisable,
    enable: managerEnable,
    requestConsent: managerRequestConsent,
    resetConsent: managerResetConsent,
  } = metricsManager

  const actions = React.useRef<MetricsActions>({
    isLoadedChanged: (isLoaded) => dispatch({type: 'isLoadedChanged', isLoaded}),
    isEnabledChanged: (isEnabled) => dispatch({type: 'isEnabledChanged', isEnabled}),
    isConsentRequestedChanged: (isConsentRequested) =>
      dispatch({type: 'isConsentRequestedChanged', isConsentRequested}),
  }).current

  const disable = React.useCallback(() => {
    actions.isEnabledChanged(false)
    managerDisable()
  }, [actions, managerDisable])
  const enable = React.useCallback(() => {
    actions.isEnabledChanged(true)
    managerEnable()
  }, [actions, managerEnable])
  const requestConsent = React.useCallback(() => {
    actions.isConsentRequestedChanged(true)
    managerRequestConsent()
  }, [actions, managerRequestConsent])
  const resetConsent = React.useCallback(() => {
    actions.isConsentRequestedChanged(false)
    managerResetConsent()
  }, [actions, managerResetConsent])

  React.useEffect(() => {
    Promise.all([metricsManager.init(), metricsManager.enabled(), metricsManager.consentRequested()]).then(
      ([_, enabled, consentRequested]) => {
        actions.isLoadedChanged(true)
        actions.isEnabledChanged(enabled)
        actions.isConsentRequestedChanged(consentRequested)
      },
    )
  }, [actions, metricsManager])

  const context = React.useMemo(
    () => ({...state, ...metricsManager, enable, disable, requestConsent, resetConsent}),
    [disable, enable, requestConsent, resetConsent, metricsManager, state],
  )

  if (!state.isLoaded) return null

  return <MetricsContext.Provider value={context}>{children}</MetricsContext.Provider>
}

export const useMetrics = () => React.useContext(MetricsContext)

const flushIntervalMs = 5000
