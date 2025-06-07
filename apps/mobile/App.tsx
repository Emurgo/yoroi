import {AsyncStorageProvider} from '@yoroi/common'
import {ThemeProvider} from '@yoroi/theme'

import * as Font from 'expo-font'
import * as React from 'react'
<<<<<<< HEAD
import {useIntl} from 'react-intl'
import {Text, TouchableOpacity, View} from 'react-native'
import {SystemBars} from 'react-native-edge-to-edge'
import {Transaction} from '@emurgo/csl-mobile-bridge-jsi'
import {SafeAreaView} from 'react-native-safe-area-context'
=======
>>>>>>> c4e451d83 (chore(mobile): moved Icons)

import {Dev} from './Dev'
import {PlatformShell} from './PlatformShell'
import {AuthProvider} from './src/features/Auth/common/context'
import {
  ConnectionProvider,
} from './src/kernel/connection/ConnectionProvider'
import {LanguageProvider} from './src/kernel/i18n/LanguageProvider'
import {useMigrations} from './src/kernel/storage/migrations/useMigrations'
import {
  authStorageKeyManager,
  languageStorageKeyManager,
  pinHashStorageKeyManager,
  rootStorage,
  themeStorageKeyManager,
} from './src/kernel/storage/storages'

// import * as LocalAuthentication from 'expo-local-authentication'

function AppShell({children}: React.PropsWithChildren) {
  const isMigrated = useMigrations(rootStorage)

  if (!isMigrated) return null

  return (
    <AsyncStorageProvider storage={rootStorage}>
      <ConnectionProvider>
        <ThemeProvider storage={themeStorageKeyManager}>
          <LanguageProvider storage={languageStorageKeyManager}>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </ConnectionProvider>
    </AsyncStorageProvider>
  )
}

function Yoroi() {
  const [fontsLoaded, setFontsLoaded] = React.useState(false)

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

<<<<<<< HEAD
  return (
    <SafeAreaView style={[a.flex_1, ta.bg_color_max]}>
      {/* <View style={[a.flex_1, ta.bg_color_max]}> */}
      <SystemBars style={isDark ? 'light' : 'dark'} />

      <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
        Welcome! base: {basePalette} selectedTheme: {config}
      </Text>

      <TouchableOpacity
        onPress={() => selectTheme(isDark ? 'default-light' : 'default-dark')}
        style={[
          a.pt_md,
          a.p_md,
          a.rounded_md,
          {backgroundColor: p.el_gray_min},
        ]}
      >
        <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
          Toggle {isDark ? 'Light' : 'Dark'} Theme
        </Text>
      </TouchableOpacity>

      <View style={[a.p_md]} />

      <TouchableOpacity
        onPress={() => changeAuthSetting(authSetting === 'pin' ? 'os' : 'pin')}
        style={[
          a.pt_md,
          a.p_md,
          a.rounded_md,
          {backgroundColor: p.el_gray_min},
        ]}
      >
        <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
          Toggle Auth Setting {authSetting?.toUpperCase()}
        </Text>
      </TouchableOpacity>

      <View style={[a.p_md]} />

      <TouchableOpacity
        onPress={() => rootSyncStorage.clear()}
        style={[
          a.pt_md,
          a.p_md,
          a.rounded_md,
          {backgroundColor: p.el_gray_min},
        ]}
      >
        <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
          Clear Storage
        </Text>
      </TouchableOpacity>

      <View style={[a.p_md]} />

      <TouchableOpacity
        onPress={async () => {
          const salt =
            '50515253c0c1c2c3c4c5c6c750515253c0c1c2c3c4c5c6c750515253c0c1c2c3'
          const nonce = '50515253c0c1c2c3c4c5c6c7'
          const payload = '308f9977d04e7f3a45abd148905c628e2bb2621360a585f352'
          const d = await decryptData(
            [salt, nonce, payload].join(''),
            'password',
          )
          console.log(d)
          console.log('================================')
        }}
        style={[
          a.pt_md,
          a.p_md,
          a.rounded_md,
          {backgroundColor: p.el_gray_min},
        ]}
      >
        <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
          Decrypt Data
        </Text>
      </TouchableOpacity>

      <View style={[a.p_md]} />
      <TouchableOpacity
        onPress={async () => {
          try {
            console.log('================================')
            let tx = Transaction.from_hex(
              '84a700818258208b9c96823c19f2047f32210a330434b3d163e194ea17b2b702c0667f6fea7a7a000d80018182581d6138fe1dd1d91221a199ff0dacf41fdd5b87506b533d00e70fae8dae8f1abfbac06a021a0002b645031a03962de305a1581de1b3cabd3914ef99169ace1e8b545b635f809caa35f8b6c8bc69ae48061abf4009040e80a100828258207dc05ac55cdfb9cc24571d491d3a3bdbd7d48489a916d27fce3ffe5c9af1b7f55840d7eda8457f1814fe3333b7b1916e3b034e6d480f97f4f286b1443ef72383279718a3a3fddf127dae0505b01a48fd9ffe0f52d9d8c46d02bcb85d1d106c13aa048258201b3d6e1236891a921abf1a3f90a9fb1b2568b1096b6cd6d3eaaeb0ef0ee0802f58401ce4658303c3eb0f2b9705992ccd62de30423ade90219e2c4cfc9eb488c892ea28ba3110f0c062298447f4f6365499d97d31207075f9815c3fe530bd9a927402f5f6',
            )
            console.log('tx', tx.to_json())
            console.log('================================')
          } catch (e) {
            console.error('Error decoding transaction:', e)
          }
        }}
        style={[
          a.pt_md,
          a.p_md,
          a.rounded_md,
          {backgroundColor: p.el_gray_min},
        ]}
      >
        <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
          Text tx decode
        </Text>
      </TouchableOpacity>
      <View style={[a.p_md]} />

      <TouchableOpacity
        onPress={() =>
          selectLanguage(languageCode === 'en-US' ? 'de-DE' : 'en-US')
        }
        style={[
          a.pt_md,
          a.p_md,
          a.rounded_md,
          {backgroundColor: p.el_gray_min},
        ]}
      >
        <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
          Change Language {languageCode} {f(globalMessages.available)} `$
          {BigNumber(10.12).toString()}`
        </Text>
      </TouchableOpacity>

      <View style={[a.p_md]} />

      <TouchableOpacity
        onPress={() => (isLoggedIn ? logout() : login())}
        style={[
          a.pt_md,
          a.p_md,
          a.rounded_md,
          {backgroundColor: p.el_gray_min},
        ]}
      >
        <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
          Connection State: {connectionStatus}{' '}
          {isLoggedIn ? 'Logged In' : 'Logged Out'}
        </Text>
      </TouchableOpacity>

      <LoadingOverlay />
    </SafeAreaView>
  )
=======
  return <Dev />
>>>>>>> c4e451d83 (chore(mobile): moved Icons)
}

function BusinessShell({children}: React.PropsWithChildren) {
  return (
    <AuthProvider
      authStorageKeyManager={authStorageKeyManager}
      pinHashStorageKeyManager={pinHashStorageKeyManager}
    >
      {children}
    </AuthProvider>
  )
}

export default function App() {
  return (
    <AppShell>
      <PlatformShell>
        <BusinessShell>
          <Yoroi />
        </BusinessShell>
      </PlatformShell>
    </AppShell>
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
