import * as React from 'react'

import type {AnalyticsProvider} from '../types/analytics'

export type MetricsEnabledStorage = {
  save: (value: boolean) => void
}

type Props = React.PropsWithChildren<{
  initialEnabled?: boolean
  platform: 'IOS' | 'Android' | 'Web'
  client?: AnalyticsProvider | null
  metricsEnabledStorage: MetricsEnabledStorage
}>

type AnalyticsContextValue = {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  client: AnalyticsProvider | null
  setClient: (client: AnalyticsProvider | null) => void
  capture: (
    event: string,
    properties?: Record<string, string | number | boolean | null | string[]>,
  ) => void
  navigate: (to: string) => void
  install: (campaign: string, source: string) => void
  platform: 'IOS' | 'Android' | 'Web'
}

const AnalyticsContext = React.createContext<AnalyticsContextValue | undefined>(
  undefined,
)

export function AnalyticsRootProvider({
  children,
  initialEnabled,
  platform,
  client: clientProp,
  metricsEnabledStorage,
}: Props) {
  const [enabled, setEnabledState] = React.useState<boolean>(
    Boolean(initialEnabled),
  )
  const [client, setClient] = React.useState<AnalyticsProvider | null>(
    clientProp ?? null,
  )

  React.useEffect(() => {
    if (typeof clientProp !== 'undefined') setClient(clientProp)
  }, [clientProp])

  const setEnabled = React.useCallback(
    (next: boolean) => {
      setEnabledState(next)
      try {
        metricsEnabledStorage.save(next)
      } catch {}
    },
    [metricsEnabledStorage],
  )

  const capture = React.useCallback<AnalyticsContextValue['capture']>(
    (event, properties) => {
      if (!enabled || !client) return
      client.capture(event, {
        ...(properties ?? {}),
        platform,
      })
    },
    [client, enabled, platform],
  )

  const navigate = React.useCallback<AnalyticsContextValue['navigate']>(
    (to) => {
      if (!enabled) return
      capture('navigate', {to})
    },
    [capture, enabled],
  )

  const install = React.useCallback<AnalyticsContextValue['install']>(
    (campaign, source) => {
      if (!enabled || !client) return
      client.install(campaign, source)
      capture('Installed', {campaign, source})
    },
    [client, capture, enabled],
  )

  const value = React.useMemo<AnalyticsContextValue>(
    () => ({
      enabled,
      setEnabled,
      client,
      setClient,
      capture,
      navigate,
      install,
      platform,
    }),
    [
      enabled,
      setEnabled,
      client,
      setClient,
      capture,
      navigate,
      install,
      platform,
    ],
  )

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalyticsContext() {
  const ctx = React.useContext(AnalyticsContext)
  if (!ctx)
    throw new Error(
      'useAnalyticsContext must be used within AnalyticsRootProvider',
    )
  return ctx
}
