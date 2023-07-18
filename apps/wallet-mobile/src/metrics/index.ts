import AsyncStorage from '@react-native-async-storage/async-storage'
import React from 'react'
import Config from 'react-native-config'

import {features} from '../features'
import {parseBoolean} from '../yoroi-wallets/utils'
import {ampli} from './ampli'

const featureFlag = features.analytics

const environment = __DEV__
  ? 'development'
  : ({NIGHTLY: 'production', PROD: 'production', STAGING: 'staging', DEV: 'development'} as const)[
      Config.BUILD_VARIANT ?? 'DEV'
    ] ?? 'development'

export const metrics = new Proxy(ampli, {
  get(target, prop) {
    const original = target[prop]
    if (typeof original !== 'function' || prop === 'track' || prop === 'isInitializedAndEnabled') return original
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (this: any, ...args: any[]) {
      if (__DEV__ || !featureFlag) console.debug('[metrics-react-native] ', prop, ...args)
      if (featureFlag) original.call(this, ...args)
    }
  },
})

const initMetrics = async () => {
  if (metrics.isLoaded) return
  const enabled = await isMetricsEnabled()
  metrics.load({environment, client: {configuration: {optOut: !enabled, flushIntervalMillis: 5000}}})
}

const metricsStorageEnabledKey = 'metrics-enabled'
export const isMetricsEnabled = async () => {
  try {
    return parseBoolean(await AsyncStorage.getItem(metricsStorageEnabledKey)) ?? __DEV__
  } catch (e) {
    return __DEV__
  }
}

export const setMetricsEnabled = async (enabled: boolean) => {
  try {
    await AsyncStorage.setItem(metricsStorageEnabledKey, JSON.stringify(enabled))
    metrics.client.setOptOut(!enabled)
  } catch (e) {
    metrics.client.setOptOut(true)
  }
}

export const useInitMetrics = () => {
  const [done, setDone] = React.useState(false)
  React.useLayoutEffect(() => {
    const run = async () => {
      await initMetrics()
      setDone(true)
    }
    run()
  }, [])

  return done
}
