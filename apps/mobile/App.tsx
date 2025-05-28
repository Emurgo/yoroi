import * as React from 'react'
import {StatusBar} from 'expo-status-bar'
import {Text, View, TouchableOpacity} from 'react-native'
// import * as LocalAuthentication from 'expo-local-authentication'
import * as Font from 'expo-font'
import {AsyncStorageProvider, useSyncStorageToState} from '@yoroi/common'
import {ThemeProvider, useTheme, atoms as a} from '@yoroi/theme'

import {
  authStorageKeyManager,
  crashReportsStorageKeyManager,
  rootStorage,
  rootSyncStorage,
  themeStorageKeyManager,
} from './src/kernel/storage/storages'
import {useMigrations} from './src/kernel/storage/migrations/useMigrations'
import {decryptData} from './src/kernel/crypto/decrypt-data'

function Shell({children}: React.PropsWithChildren) {
  const isMigrated = useMigrations(rootStorage)

  if (!isMigrated) return null

  return (
    <AsyncStorageProvider storage={rootStorage}>
      <ThemeProvider storage={themeStorageKeyManager}>{children}</ThemeProvider>
    </AsyncStorageProvider>
  )
}

function Yoroi() {
  const {
    isDark,
    name,
    palette: {bg_color_max, text_gray_low},
    basePalette,
    selectTheme,
  } = useTheme()
  const [fontsLoaded, setFontsLoaded] = React.useState(false)
  const [isCrashReportsEnabled, setIsCrashReportsEnabled] =
    useSyncStorageToState(crashReportsStorageKeyManager)
  const [authSetting, setAuthSetting] = useSyncStorageToState(
    authStorageKeyManager,
  )

  React.useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Rubik': require('./assets/fonts/Rubik-Regular.ttf'),
        'Rubik-Regular': require('./assets/fonts/Rubik-Regular.ttf'),
        'Rubik-Medium': require('./assets/fonts/Rubik-Medium.ttf'),
        'Rubik-Bold': require('./assets/fonts/Rubik-Bold.ttf'),
        'Rubik-Light': require('./assets/fonts/Rubik-Light.ttf'),
        'Rubik-SemiBold': require('./assets/fonts/Rubik-SemiBold.ttf'),
        'Rubik-Black': require('./assets/fonts/Rubik-Black.ttf'),
        'Rubik-ExtraBold': require('./assets/fonts/Rubik-ExtraBold.ttf'),
        'Rubik-Italic': require('./assets/fonts/Rubik-Italic.ttf'),
        'Rubik-MediumItalic': require('./assets/fonts/Rubik-MediumItalic.ttf'),
        'Rubik-BoldItalic': require('./assets/fonts/Rubik-BoldItalic.ttf'),
        'Rubik-LightItalic': require('./assets/fonts/Rubik-LightItalic.ttf'),
        'Rubik-SemiBoldItalic': require('./assets/fonts/Rubik-SemiBoldItalic.ttf'),
        'Rubik-BlackItalic': require('./assets/fonts/Rubik-BlackItalic.ttf'),
        'Rubik-ExtraBoldItalic': require('./assets/fonts/Rubik-ExtraBoldItalic.ttf'),
      })
      setFontsLoaded(true)
    }
    loadFonts()
  }, [])

  if (!fontsLoaded) {
    return null
  }

  return (
    <View
      style={[
        a.flex_1,
        a.align_center,
        a.justify_center,
        {backgroundColor: bg_color_max},
      ]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Text style={[a.body_2_md_regular, {color: text_gray_low}]}>
        Welcome! base: {basePalette} selectedTheme: {name}
      </Text>

      <TouchableOpacity
        onPress={() => selectTheme(isDark ? 'default-light' : 'default-dark')}
        style={[
          a.pt_md,
          a.p_md,
          a.rounded_md,
          {backgroundColor: text_gray_low},
        ]}
      >
        <Text style={[a.body_2_md_regular, {color: bg_color_max}]}>
          Toggle {isDark ? 'Light' : 'Dark'} Theme
        </Text>
      </TouchableOpacity>

      <View style={[a.p_lg]} />

      <TouchableOpacity
        onPress={() => setIsCrashReportsEnabled(!isCrashReportsEnabled)}
        style={[
          a.pt_md,
          a.p_md,
          a.rounded_md,
          {backgroundColor: text_gray_low},
        ]}
      >
        <Text style={[a.body_2_md_regular, {color: bg_color_max}]}>
          Toggle Crash Reports {isCrashReportsEnabled ? 'Enabled' : 'Disabled'}
        </Text>
      </TouchableOpacity>

      <View style={[a.p_lg]} />

      <TouchableOpacity
        onPress={() => setAuthSetting(authSetting === 'pin' ? 'os' : 'pin')}
        style={[
          a.pt_md,
          a.p_md,
          a.rounded_md,
          {backgroundColor: text_gray_low},
        ]}
      >
        <Text style={[a.body_2_md_regular, {color: bg_color_max}]}>
          Toggle Auth Setting {authSetting?.toUpperCase()}
        </Text>
      </TouchableOpacity>

      <View style={[a.p_lg]} />
      <TouchableOpacity
        onPress={() => rootSyncStorage.clear()}
        style={[
          a.pt_md,
          a.p_md,
          a.rounded_md,
          {backgroundColor: text_gray_low},
        ]}
      >
        <Text style={[a.body_2_md_regular, {color: bg_color_max}]}>
          Clear Storage
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={async () => {
          console.log('--------------------------------')
          const salt =
            '50515253c0c1c2c3c4c5c6c750515253c0c1c2c3c4c5c6c750515253c0c1c2c3'
          const nonce = '50515253c0c1c2c3c4c5c6c7'
          const payload = '308f9977d04e7f3a45abd148905c628e2bb2621360a585f352'
          const d = await decryptData(
            [salt, nonce, payload].join(''),
            'password',
          )
          console.log('--------------------------------')
          console.log(d)
          console.log('================================')
        }}
        style={[
          a.pt_md,
          a.p_md,
          a.rounded_md,
          {backgroundColor: text_gray_low},
        ]}
      >
        <Text style={[a.body_2_md_regular, {color: bg_color_max}]}>
          Decrypt Data
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default function App() {
  return (
    <Shell>
      <Yoroi />
    </Shell>
  )
}

// export default function App() {
//   const [isAuthenticated, setIsAuthenticated] = React.useState(false)
//   const [isLoading, setIsLoading] = React.useState(true)

//   const authenticate = async () => {
//     try {
//       // Check if hardware supports biometrics
//       const compatible = await LocalAuthentication.hasHardwareAsync()
//       if (!compatible) {
//         Alert.alert(
//           'Error',
//           'Your device does not support biometric authentication',
//         )
//         setIsLoading(false)
//         return
//       }

//       // Check if biometrics are enrolled
//       const enrolled = await LocalAuthentication.isEnrolledAsync()
//       if (!enrolled) {
//         Alert.alert('Error', 'No biometrics enrolled on this device')
//         setIsLoading(false)
//         return
//       }

//       // Authenticate user
//       const result = await LocalAuthentication.authenticateAsync({
//         promptMessage: 'Authenticate to access the app',
//         fallbackLabel: 'Use passcode',
//       })

//       setIsAuthenticated(result.success)
//       setIsLoading(false)
//     } catch (error) {
//       console.error('Authentication error:', error)
//       Alert.alert('Error', 'Authentication failed')
//       setIsLoading(false)
//     }
//   }

//   React.useEffect(() => {
//     authenticate()
//   }, [])

//   if (isLoading) {
//     return (
//       <View>
//         <Text>Loading...</Text>
//         <StatusBar style="auto" />
//       </View>
//     )
//   }

//   if (!isAuthenticated) {
//     return (
//       <View>
//         <Text>Authentication Required</Text>
//         <Text onPress={authenticate}>Try Again</Text>
//         <StatusBar style="auto" />
//       </View>
//     )
//   }

//   return (
//     <View>
//       <Text>Welcome! You are authenticated!</Text>
//       <StatusBar style="auto" />
//     </View>
//   )
// }
