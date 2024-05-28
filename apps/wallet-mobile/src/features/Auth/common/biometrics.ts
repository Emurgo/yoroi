import DeviceInfo from 'react-native-device-info'

const FINGERPRINT_OVERLAY_MIN_SDK = 28

export const supportsAndroidFingerprintOverlay = async () => {
  return (await DeviceInfo.getApiLevel()) >= FINGERPRINT_OVERLAY_MIN_SDK
}
