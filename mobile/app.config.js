// Dynamic app configuration based on environment
const getAppConfig = () => {
  const buildVariant =
    process.env.BUILD_VARIANT || process.env.EXPO_PUBLIC_APP_CONFIG || 'DEV'

  if (buildVariant === 'NIGHTLY' || buildVariant.includes('nightly')) {
    return require('./app.config.nightly.js').default
  } else if (
    buildVariant === 'PROD' ||
    buildVariant.includes('production')
  ) {
    return require('./app.config.production.js').default
  }

  // Default development config
  return {
    expo: {
      name: 'Yoroi Dev',
      slug: 'yoroi-v2',
      owner: 'stacky',
      version: '6.0.0',
      orientation: 'portrait',
      icon: './assets/yoroi/icon.png',
      userInterfaceStyle: 'automatic',
      newArchEnabled: true,
      splash: {
        image: './assets/yoroi/splash/light/bootsplash_logo.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
      ios: {
        supportsTablet: false,
        userInterfaceStyle: 'automatic',
        bundleIdentifier: 'com.emurgo.yoroi',
        buildNumber: '800',
        infoPlist: {
          NSCameraUsageDescription:
            'Allow $(PRODUCT_NAME) to access your camera to scan QR codes',
          NSLocationWhenInUseUsageDescription:
            'Allow $(PRODUCT_NAME) to access your location for Bluetooth scanning',
          NSBluetoothAlwaysUsageDescription:
            'Allow $(PRODUCT_NAME) to access Bluetooth for hardware wallet connection',
          NSBluetoothPeripheralUsageDescription:
            'Allow $(PRODUCT_NAME) to access Bluetooth for hardware wallet connection',
          UIBackgroundModes: ['fetch', 'remote-notification'],
          NSUserNotificationUsageDescription:
            'Allow $(PRODUCT_NAME) to send you notifications about your wallet activity',
          NSFaceIDUsageDescription:
            'Allow $(PRODUCT_NAME) to access your face ID for biometric authentication',
        },
        splash: {
          image: './assets/yoroi/splash/light/bootsplash_logo.png',
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            image: './assets/yoroi/splash/dark/bootsplash_logo.png',
            backgroundColor: '#000000',
          },
        },
      },
      android: {
        adaptiveIcon: {
          foregroundImage:
            './assets/yoroi/adaptive-icon/foreground/foreground.png',
          backgroundImage:
            './assets/yoroi/adaptive-icon/background/background.png',
          backgroundColor: '#ffffff',
        },
        package: 'com.emurgo.dev',
        versionCode: 800,
        edgeToEdgeEnabled: true,
        userInterfaceStyle: 'automatic',
        permissions: [
          'android.permission.INTERNET',
          'android.permission.SYSTEM_ALERT_WINDOW',
          'android.permission.VIBRATE',
          'android.permission.USE_FINGERPRINT',
          'android.permission.USE_BIOMETRIC',
          'android.permission.ACCESS_NETWORK_STATE',
          'android.permission.CAMERA',
          'android.permission.ACCESS_FINE_LOCATION',
          'android.permission.BLUETOOTH',
          'android.permission.BLUETOOTH_ADMIN',
          'android.permission.BLUETOOTH_CONNECT',
          'android.permission.BLUETOOTH_SCAN',
          'android.permission.POST_NOTIFICATIONS',
          'android.permission.USB_PERMISSION',
        ],
        splash: {
          image: './assets/yoroi/splash/light/bootsplash_logo.png',
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            image: './assets/yoroi/splash/dark/bootsplash_logo.png',
            backgroundColor: '#000000',
          },
        },
      },
      web: {
        favicon: './assets/yoroi/favicon.png',
      },
      extra: {
        SENTRY_DSN: process.env.SENTRY_DSN || '',
        UNSTOPPABLE_API_KEY: process.env.UNSTOPPABLE_API_KEY || '',
        COMMIT: process.env.COMMIT || '',
        BUILD_VARIANT: process.env.BUILD_VARIANT || 'DEV',
        FRONTEND_FEE_ADDRESS_MAINNET:
          process.env.FRONTEND_FEE_ADDRESS_MAINNET || '',
        FRONTEND_FEE_ADDRESS_PREPROD:
          process.env.FRONTEND_FEE_ADDRESS_PREPROD || '',
        BANXA_TEST_WALLET: process.env.BANXA_TEST_WALLET || '',
        DISABLE_LOGBOX: process.env.DISABLE_LOGBOX || false,
        LOGGER_FILTER: process.env.LOGGER_FILTER || '',
        eas: {
          projectId: '1c2b2211-8e87-40ef-a8df-9552926c481a',
        },
      },
      plugins: [
        'react-native-ble-plx',
        [
          'react-native-edge-to-edge',
          {
            android: {
              parentTheme: 'Default',
              enforceNavigationBarContrast: false,
            },
          },
        ],
        'expo-font',
        'expo-localization',
        [
          'expo-camera',
          {
            cameraPermission:
              'Allow $(PRODUCT_NAME) to access your camera to scan QR codes',
          },
        ],
        [
          'expo-location',
          {
            locationAlwaysAndWhenInUsePermission:
              'Allow $(PRODUCT_NAME) to use your location for Bluetooth scanning',
          },
        ],
        [
          'expo-notifications',
          {
            color: '#ffffff',
          },
        ],
        [
          'expo-build-properties',
          {
            ios: {
              deploymentTarget: '15.1',
              newArchEnabled: true,
            },
            android: {
              compileSdkVersion: 35,
              targetSdkVersion: 35,
              buildToolsVersion: '35.0.0',
              newArchEnabled: true,
            },
          },
        ],
        './plugins/with-app-turbo-module-provider.js',
      ],
    },
  }
}

export default getAppConfig()
