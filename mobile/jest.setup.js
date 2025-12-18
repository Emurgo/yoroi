jest.mock('expo-device', () => ({
  isDevice: true,
  brand: 'Apple',
  manufacturer: 'Apple',
  modelName: 'iPhone',
  osName: 'iOS',
  osVersion: '16.0',
  deviceType: 'PHONE',
  totalMemory: 4096,
  isRootedExperimental: false,
  getDeviceTypeAsync: jest.fn().mockResolvedValue('PHONE'),
  getManufacturerAsync: jest.fn().mockResolvedValue('Apple'),
  getModelNameAsync: jest.fn().mockResolvedValue('iPhone'),
  getOsVersionAsync: jest.fn().mockResolvedValue('16.0'),
  getPlatformApiLevelAsync: jest.fn().mockResolvedValue(33),
  getTotalMemoryAsync: jest.fn().mockResolvedValue(4096),
  isRootedExperimentalAsync: jest.fn().mockResolvedValue(false),
}))

jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      name: 'Yoroi',
      version: '1.0.0',
      extra: {
        environment: 'test',
      },
    },
    appOwnership: 'standalone',
    executionEnvironment: 'standalone',
    nativeAppVersion: '1.0.0',
    nativeBuildVersion: '1',
    systemVersion: '16.0',
  },
}))

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)

jest.mock('@emurgo/cross-csl-mobile', () => require('@emurgo/cross-csl-nodejs'))

jest.mock('@emurgo/csl-mobile-bridge', () =>
  require('@emurgo/cardano-serialization-lib-nodejs'),
)

jest.mock('@emurgo/msl-mobile-bridge', () =>
  require('@emurgo/cardano-serialization-lib-nodejs'),
)

// Map mobile MSL to Node.js implementation for Jest
jest.mock('@emurgo/cross-msl-mobile', () => {
  const nodejsModule = require('@emurgo/cross-msl-nodejs')
  return {
    init: () => nodejsModule.init(),
  }
})

// Native/ESM modules that break in Jest - provide lightweight mocks
jest.mock('react-native-randombytes', () => ({
  randomBytes: (size) => require('crypto').randomBytes(size),
}))

jest.mock('react-native-quick-crypto', () => {
  const crypto = require('crypto')
  return {
    install: () => {},
    pbkdf2Sync: (password, salt, iterations, keylen, digest) => {
      return crypto.pbkdf2Sync(password, salt, iterations, keylen, digest)
    },
    randomBytes: (size) => {
      return crypto.randomBytes(size)
    },
    createHash: (algorithm) => {
      return crypto.createHash(algorithm)
    },
    createHmac: (algorithm, key) => {
      return crypto.createHmac(algorithm, key)
    },
  }
})

jest.mock('react-native-device-info', () => ({
  __esModule: true,
  default: {
    getVersion: () => '1.0.0',
    getBuildNumber: () => '1',
    getSystemName: () => 'iOS',
    getSystemVersion: () => '16.0',
    getBundleId: () => 'com.emurgo.yoroi',
    isEmulator: async () => false,
  },
}))

jest.mock(
  'chacha',
  () => {
    const crypto = require('crypto')
    const algo = 'chacha20-poly1305'
    return {
      createCipher: (key, nonce) => {
        const cipher = crypto.createCipheriv(
          algo,
          Buffer.from(key),
          Buffer.from(nonce),
          {authTagLength: 16},
        )
        let aadSet = false
        return {
          setAAD: (aad) => {
            if (!aadSet) {
              cipher.setAAD(Buffer.from(aad))
              aadSet = true
            }
          },
          update: (data) => cipher.update(Buffer.from(data)),
          final: () => cipher.final(),
          getAuthTag: () => cipher.getAuthTag(),
        }
      },
      createDecipher: (key, nonce) => {
        const decipher = crypto.createDecipheriv(
          algo,
          Buffer.from(key),
          Buffer.from(nonce),
          {authTagLength: 16},
        )
        return {
          setAAD: (aad) => decipher.setAAD(Buffer.from(aad)),
          setAuthTag: (tag) => decipher.setAuthTag(Buffer.from(tag)),
          update: (data) =>
            decipher.update(Buffer.from(data), undefined, 'hex'),
          final: (outputEncoding) => decipher.final(outputEncoding),
        }
      },
    }
  },
  {virtual: true},
)

jest.mock(
  'cbor2',
  () => ({
    decode: () => new Map(),
  }),
  {virtual: true},
)

jest.mock(
  'react-native-fast-pbkdf2',
  () => ({
    __esModule: true,
    default: {
      derive: async (
        passwordB64,
        saltB64,
        iterations,
        keyLen /* bytes */,
        algo,
      ) => {
        const crypto = require('crypto')
        const password = Buffer.from(passwordB64, 'base64')
        const salt = Buffer.from(saltB64, 'base64')
        const digest = (algo || 'sha-512')
          .replace('SHA-', 'sha')
          .replace('sha-', 'sha')
        const derived = crypto.pbkdf2Sync(
          password,
          salt,
          iterations,
          keyLen,
          digest,
        )
        return derived.toString('base64')
      },
    },
  }),
  {virtual: true},
)

jest.mock('@ledgerhq/react-native-hw-transport-ble', () => ({
  __esModule: true,
  default: class TransportBLE {},
}))

jest.mock('react-native-ble-plx', () => ({
  BleError: class BleError {},
}))
