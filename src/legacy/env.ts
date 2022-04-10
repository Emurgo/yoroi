import BuildConfig from 'react-native-config'

const getString = (key: string) => BuildConfig[key]

const getBoolean = (key: string, defaultValue: boolean) => {
  const value = getString(key)
  switch (value) {
    case 'true':
      return true
    case 'false':
      return false
    default:
      return defaultValue
  }
}

export default {
  getString,
  getBoolean,
}
