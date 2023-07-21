import React from 'react'
import Config from 'react-native-config'
import {useQuery} from 'react-query'

import {features} from '../features'
import {useMutationWithInvalidations} from '../yoroi-wallets/hooks'
import {Logger} from '../yoroi-wallets/logging'
import {useStorage} from '../yoroi-wallets/storage'
import {parseBoolean} from '../yoroi-wallets/utils'
import {ampli as originalAmpli} from './ampli'

const featureFlag = features.analytics

const environmentMap = {
  DEV: 'development',
  PROD: 'production',
  STAGING: 'staging',
  NIGHTLY: 'production',
} as const

const environment = __DEV__ ? 'development' : environmentMap[Config.BUILD_VARIANT ?? 'DEV'] ?? 'development'

export const ampli = new Proxy(originalAmpli, {
  get(target, prop) {
    const original = target[prop]
    if (typeof original !== 'function' || prop === 'track' || prop === 'isInitializedAndEnabled') return original
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (this: any, ...args: any[]) {
      if (__DEV__) Logger.info('[metrics-react-native] ', prop, ...args)
      if (featureFlag) original.call(this, ...args)
    }
  },
})

const initMetrics = (enabled: boolean) => {
  if (ampli.isLoaded) return
  ampli.load({environment, client: {configuration: {optOut: !enabled, flushIntervalMillis: 5000}}})
}

const metricsEnabledKey = 'metrics-enabled'
export const useMetricsEnabled = () => {
  const storage = useStorage()

  const mutation = useMutationWithInvalidations<void, Error, boolean>({
    mutationFn: async (enabled) => {
      ampli.client.setOptOut(!enabled)
      return storage.join('appSettings/').setItem(metricsEnabledKey, enabled)
    },
    invalidateQueries: [metricsEnabledKey],
  })

  const query = useQuery<boolean, Error>({
    queryKey: [metricsEnabledKey],
    queryFn: async () => (await storage.join('appSettings/').getItem(metricsEnabledKey, parseBoolean)) ?? false,
    suspense: true,
  })

  return {enabled: query.data, setEnabled: mutation.mutate}
}

export const useInitMetrics = () => {
  const [done, setDone] = React.useState(false)
  const {enabled} = useMetricsEnabled()
  React.useLayoutEffect(() => {
    if (enabled !== undefined) {
      initMetrics(enabled)
      setDone(true)
    }
  }, [enabled])

  return done
}
