import * as React from 'react'

import type {AnalyticsProvider, MetricsEnabledStorage} from '../types/analytics'

type Props = React.PropsWithChildren<{
  initialEnabled?: boolean
  platform: 'IOS' | 'Android' | 'Web'
  client: AnalyticsProvider
  metricsEnabledStorage: MetricsEnabledStorage
}>

type AnalyticsContextValue = {
  enabled: boolean
  setEnabled: (enabled: boolean) => void
  client: AnalyticsProvider
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
  const client = clientProp

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
      if (!enabled) return
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
      if (!enabled) return
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
      capture,
      navigate,
      install,
      platform,
    }),
    [enabled, setEnabled, client, capture, navigate, install, platform],
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
