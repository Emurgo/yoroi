// @flow
import BuildConfig from 'react-native-config'
import _ from 'lodash'

const getString = (key: string) => BuildConfig[key]

const getBoolean = (key: string, defaultValue: boolean) => {
  const value = getString(key)
  return _.isNil(value) ? defaultValue : value === 'true'
}

export default {
  getString,
  getBoolean,
}
