import {freeze} from 'immer'
import {Platform} from 'react-native'
import DeviceInfo from 'react-native-device-info'

import {isNightly, isProduction} from './env'

const environment = isNightly ? 'nightly' : isProduction ? 'production' : 'development'
const version = DeviceInfo.getVersion()
const release = isProduction ? version : 'dev'
const build = DeviceInfo.getBuildNumber()
const distribution = `${Platform.OS}.${build}`

export const appInfo = freeze({
  environment,
  version,
  release,
  build,
  distribution,
})
