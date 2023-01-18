import {Platform} from 'react-native'
import Keychain from 'react-native-keychain'

import {authOsEnabled} from './KeychainStorage'

let mockedBioType = Keychain.BIOMETRY_TYPE.FINGERPRINT
let mockedCanImply = true
jest.mock('react-native-keychain', () => {
  return {
    BIOMETRY_TYPE: {
      TOUCH_ID: 'TouchID',
      FACE_ID: 'FaceID',
      FINGERPRINT: 'Fingerprint',
      FACE: 'Face',
      IRIS: 'Iris',
    },
    AUTHENTICATION_TYPE: {
      DEVICE_PASSCODE_OR_BIOMETRICS: 'x',
    },
    getSupportedBiometryType: jest.fn(() => Promise.resolve(mockedBioType)),
    canImplyAuthentication: jest.fn(() => Promise.resolve(mockedCanImply)),
  }
})

describe('authOsEnabledOnDevice()', () => {
  describe('on Android', () => {
    it.each`
      expected | bioType
      ${true}  | ${Keychain.BIOMETRY_TYPE.FINGERPRINT}
      ${true}  | ${Keychain.BIOMETRY_TYPE.IRIS}
      ${true}  | ${Keychain.BIOMETRY_TYPE.FACE}
    `('should return $expected when type is $bioType', ({expected, bioType}) => {
      Platform.select = jest.fn((platformConfig) => platformConfig['android'])
      mockedBioType = bioType

      return authOsEnabled().then((result) => expect(result).toBe(expected))
    })
  })
  describe('on iOS', () => {
    it.each`
      expected | bioType                            | canImply
      ${true}  | ${Keychain.BIOMETRY_TYPE.FACE_ID}  | ${true}
      ${false} | ${Keychain.BIOMETRY_TYPE.FACE_ID}  | ${false}
      ${true}  | ${Keychain.BIOMETRY_TYPE.TOUCH_ID} | ${true}
      ${false} | ${Keychain.BIOMETRY_TYPE.TOUCH_ID} | ${false}
    `('should return $expected when type is $bioType and canImply is $canImply', ({expected, bioType, canImply}) => {
      Platform.select = jest.fn((platformConfig) => platformConfig['ios'])
      mockedBioType = bioType
      mockedCanImply = canImply

      return authOsEnabled().then((result) => expect(result).toBe(expected))
    })
  })
  describe('on other platforms', () => {
    it.each`
      expected | platform
      ${Error} | ${'web'}
      ${Error} | ${'windows'}
      ${Error} | ${'macos'}
    `('should reject when platform is $platform', ({expected, platform}) => {
      Platform.select = jest.fn((platformConfig) => platformConfig[platform])

      return authOsEnabled().catch((error) => expect(error).toBeInstanceOf(expected))
    })
  })
})
