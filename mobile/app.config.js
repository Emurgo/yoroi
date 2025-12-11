const baseConfig = require('./app.json')

// Determine if this is a development build
// Development builds use different bundle IDs so they can coexist with production
const isProduction =
  process.env.EAS_BUILD_PROFILE === 'production' ||
  process.env.EXPO_PUBLIC_BUILD_VARIANT === 'PROD'
const isPreview =
  process.env.EAS_BUILD_PROFILE === 'preview' ||
  process.env.EXPO_PUBLIC_BUILD_VARIANT === 'NIGHTLY'
// Explicitly exclude production and preview builds to prevent dev bundle IDs in production
const isDevelopment =
  !isProduction &&
  !isPreview &&
  (process.env.EAS_BUILD_PROFILE === 'development' ||
    process.env.EXPO_PUBLIC_BUILD_VARIANT === 'DEV' ||
    true) // Default to dev for local builds when neither production nor preview

module.exports = {
  expo: {
    ...baseConfig.expo,
    // Change app name for development builds
    name: isDevelopment ? 'Yoroi Dev' : baseConfig.expo.name,
    ios: {
      ...baseConfig.expo.ios,
      // Use different bundle identifier for development builds
      bundleIdentifier: isDevelopment
        ? 'com.emurgo.yoroi.dev'
        : baseConfig.expo.ios.bundleIdentifier,
    },
    android: {
      ...baseConfig.expo.android,
      // Use different package name for development builds
      package: isDevelopment
        ? 'com.emurgo.dev'
        : baseConfig.expo.android.package,
    },
  },
}
