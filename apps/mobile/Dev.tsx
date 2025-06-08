import {atoms as a, useTheme} from '@yoroi/theme'

import {BigNumber} from 'bignumber.js'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {Text, TouchableOpacity} from 'react-native'
import {SystemBars} from 'react-native-edge-to-edge'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useAuth} from './src/features/Auth/common/context'
import {useCopy} from './src/features/Copy/context'
import {useConnectionStatus} from './src/kernel/connection/ConnectionProvider'
import {decryptData} from './src/kernel/crypto/decrypt-data'
import globalMessages from './src/kernel/i18n/global-messages'
import {useLanguage} from './src/kernel/i18n/LanguageProvider'
import {rootSyncStorage} from './src/kernel/storage/storages'
import {LoadingOverlay} from './src/ui/LoadingOverlay/LoadingOverlay'

export function Dev() {
  const {
    isDark,
    config,
    palette: p,
    basePalette,
    selectTheme,
    atoms: ta,
  } = useTheme()
  const {authSetting, changeAuthSetting, isLoggedIn, login, logout} = useAuth()
  const {languageCode, selectLanguage} = useLanguage()
  const {formatMessage: f} = useIntl()
  const connectionStatus = useConnectionStatus()
  const [isLoading, setIsLoading] = React.useState(false)
  const showLoadingFor3Seconds = React.useCallback(() => {
    setIsLoading(true)
    const t = setTimeout(() => {
      setIsLoading(false)
      clearTimeout(t)
    }, 3000)
  }, [])
  const {copy, isCopying} = useCopy()

  return (
    <SafeAreaView
      style={[a.flex_1, ta.bg_color_max, a.gap_sm, a.flex_row, a.flex_wrap]}
    >
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

      <TouchableOpacity
        onPress={showLoadingFor3Seconds}
        style={[
          a.pt_md,
          a.p_md,
          a.rounded_md,
          {backgroundColor: p.el_gray_min},
        ]}
      >
        <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
          Show Loading for 3 Seconds
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={(event) =>
          copy({text: 'Hello, world!', feedback: 'Copied', event})
        }
        style={[
          a.pt_md,
          a.p_md,
          a.rounded_md,
          {backgroundColor: p.el_gray_min},
        ]}
      >
        <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
          Copy {isCopying ? 'Copying...' : 'Copy'}
        </Text>
      </TouchableOpacity>

      <LoadingOverlay isLoading={isLoading} />
    </SafeAreaView>
  )
}
