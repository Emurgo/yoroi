// @flow
import BuildConfig from 'react-native-config'

const getString = (key: string) => BuildConfig[key]

const getBoolean = (key: string) => getString(key) === 'true'

export default {
  getString,
  getBoolean,
}
