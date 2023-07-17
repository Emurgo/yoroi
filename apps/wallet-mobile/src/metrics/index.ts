import AsyncStorage from '@react-native-async-storage/async-storage'
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

const client = new Proxy(ampli.client, {
  get(target, prop) {
    const original = target[prop]
    if (typeof original !== 'function') return original
    if (!featureFlag) return (...args) => console.debug('[metrics-react-native] client ', prop, ...args)
    return original
  },
})

export const metrics = new Proxy(ampli, {
  get(target, prop) {
    if (prop === 'client') return client
    const original = target[prop]
    if (typeof original !== 'function') return original
    if (!featureFlag) return (...args) => console.debug('[metrics-react-native] ', prop, ...args)
    return original
  },
})

export const initMetrics = async () =>
  metrics.load({environment, client: {configuration: {optOut: !(await isMetricsEnabled())}}})

const metricsStorageEnabledKey = 'metrics-enabled'
export const isMetricsEnabled = async () => parseBoolean(await AsyncStorage.getItem(metricsStorageEnabledKey)) ?? false
export const setMetricsEnabled = async (enabled: boolean) => {
  await AsyncStorage.setItem(metricsStorageEnabledKey, JSON.stringify(enabled))
  metrics.client.setOptOut(!enabled)
}
