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
