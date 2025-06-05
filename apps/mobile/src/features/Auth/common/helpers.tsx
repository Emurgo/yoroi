export const canAuthWithOS = (options: IosAuthOptions | AndroidAuthOptions) => {
  const {platform, supportedBiometryType} = options

  if (platform === 'ios') {
    const {canImplyAuthentication} = options
    if (!canImplyAuthentication) return false

    return !!supportedBiometryType
  }

  if (platform === 'android') {
    return !!supportedBiometryType
  }

  return false
}

type AndroidAuthOptions = {
  platform: 'android'
  supportedBiometryType: `${RNKeychain.BIOMETRY_TYPE}` | null
}

type IosAuthOptions = {
  platform: 'ios'
  supportedBiometryType: `${RNKeychain.BIOMETRY_TYPE}` | null
  canImplyAuthentication: boolean
}
