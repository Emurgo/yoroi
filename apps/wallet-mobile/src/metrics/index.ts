import AsyncStorage from '@react-native-async-storage/async-storage'
import React from 'react'
import Config from 'react-native-config'

import {features} from '../features'
import {Logger} from '../yoroi-wallets/logging'
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

const initMetrics = async () => {
  if (ampli.isLoaded) return
  const enabled = await isMetricsEnabled()
  ampli.load({environment, client: {configuration: {optOut: !enabled, flushIntervalMillis: 5000}}})
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
    ampli.client.setOptOut(!enabled)
  } catch (e) {
    ampli.client.setOptOut(true)
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
