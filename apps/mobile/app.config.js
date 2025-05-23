export default {
  expo: {
    name: "yoroi",
    slug: "yoroi",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/yoroi/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/yoroi/splash/light/bootsplash_logo.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      userInterfaceStyle: "automatic",
      bundleIdentifier: "com.emurgo.yoroi-v2",
      splash: {
        image: "./assets/yoroi/splash/light/bootsplash_logo.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          image: "./assets/yoroi/splash/dark/bootsplash_logo.png",
          backgroundColor: "#000000"
        }
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/yoroi/adaptive-icon/foreground/foreground.png",
        backgroundImage: "./assets/yoroi/adaptive-icon/background/background.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      userInterfaceStyle: "automatic",
      splash: {
        image: "./assets/yoroi/splash/light/bootsplash_logo.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          image: "./assets/yoroi/splash/dark/bootsplash_logo.png",
          backgroundColor: "#000000"
        }
      }
    },
    web: {
      favicon: "./assets/yoroi/favicon.png"
    },
    extra: {
      SENTRY_DSN: process.env.SENTRY_DSN || '',
      UNSTOPPABLE_API_KEY: process.env.UNSTOPPABLE_API_KEY || '',
      COMMIT: process.env.COMMIT || '',
      BUILD_VARIANT: process.env.BUILD_VARIANT || 'DEV',
      FRONTEND_FEE_ADDRESS_MAINNET: process.env.FRONTEND_FEE_ADDRESS_MAINNET || '',
      FRONTEND_FEE_ADDRESS_PREPROD: process.env.FRONTEND_FEE_ADDRESS_PREPROD || '',
      BANXA_TEST_WALLET: process.env.BANXA_TEST_WALLET || '',
      DISABLE_LOGBOX: process.env.DISABLE_LOGBOX || false,
      LOGGER_FILTER: process.env.LOGGER_FILTER || '',
    }
  }
}; 