import {atoms as a, useTheme} from '@yoroi/theme'

import {BigNumber} from 'bignumber.js'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {Text} from 'react-native'
import {SystemBars} from 'react-native-edge-to-edge'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useAuth} from './src/features/Auth/common/context'
import {useCopy} from './src/features/Copy/context'
import {useConnectionStatus} from './src/kernel/connection/ConnectionProvider'
import {decryptData} from './src/kernel/crypto/decrypt-data'
import globalMessages from './src/kernel/i18n/global-messages'
import {useLanguage} from './src/kernel/i18n/LanguageProvider'
import {LocalizableError} from './src/kernel/i18n/LocalizableError'
import {rootSyncStorage} from './src/kernel/storage/storages'
import {Button, ButtonType} from './src/ui/Button/Button'
import {CopyButton} from './src/ui/CopyButton/CopyButton'
import {LoadingOverlay} from './src/ui/LoadingOverlay/LoadingOverlay'
import {Transaction} from '@emurgo/csl-mobile-bridge-jsi'

export function Dev() {
  const {
    isDark,
    config,
    palette: p,
    basePalette,
    selectTheme,
    atoms: ta,
  } = useTheme()
  const {
    authSetting,
    changeAuthSetting,
    isLoggedIn,
    login,
    logout,
    authWithHostConfig,
    authWithHost,
  } = useAuth()
  const {languageCode, selectLanguage} = useLanguage()
  const {formatMessage: f} = useIntl()
  const connectionStatus = useConnectionStatus()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showCrash, setShowCrash] = React.useState(false)
  const showLoadingFor3Seconds = React.useCallback(() => {
    setIsLoading(true)
    const t = setTimeout(() => {
      setIsLoading(false)
      clearTimeout(t)
    }, 3000)
  }, [])

  return (
    <SafeAreaView
      style={[a.flex_1, ta.bg_color_max, a.gap_sm, a.flex_row, a.flex_wrap]}
    >
      <SystemBars style={isDark ? 'light' : 'dark'} />

      <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
        Welcome! base: {basePalette} selectedTheme: {config}
      </Text>

      <Button
        onPress={() => selectTheme(isDark ? 'default-light' : 'default-dark')}
        type={ButtonType.Secondary}
        title={`Toggle ${isDark ? 'Light' : 'Dark'} Theme`}
        style={[a.pt_md, a.p_md, a.rounded_md]}
      />

      <Button
        onPress={() => changeAuthSetting(authSetting === 'pin' ? 'os' : 'pin')}
        type={ButtonType.Secondary}
        title={`Toggle Auth Setting ${authSetting?.toUpperCase()}`}
        style={[a.pt_md, a.p_md, a.rounded_md]}
      />

      <Button
        onPress={() => rootSyncStorage.clear()}
        type={ButtonType.Secondary}
        title="Clear Storage"
        style={[a.pt_md, a.p_md, a.rounded_md]}
      />

      <Button
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
        type={ButtonType.Secondary}
        title="Decrypt Data"
        style={[a.pt_md, a.p_md, a.rounded_md]}
      />

      <Button
        onPress={() =>
          selectLanguage(languageCode === 'en-US' ? 'de-DE' : 'en-US')
        }
        type={ButtonType.Secondary}
        title={`Change Language ${languageCode} ${f(globalMessages.available)} $${BigNumber(10.12).toString()}`}
        style={[a.pt_md, a.p_md, a.rounded_md]}
      />

      <Button
        onPress={() => (isLoggedIn ? logout() : login())}
        type={ButtonType.Secondary}
        title={`Connection State: ${connectionStatus} ${isLoggedIn ? 'Logged In' : 'Logged Out'}`}
        style={[a.pt_md, a.p_md, a.rounded_md]}
      />

      <Button
        onPress={showLoadingFor3Seconds}
        type={ButtonType.Secondary}
        title="Show Loading for 3 Seconds"
        style={[a.pt_md, a.p_md, a.rounded_md]}
      />

      <Button
        onPress={() => setShowCrash(!showCrash)}
        type={ButtonType.Primary}
        title={showCrash ? 'Hide Crash' : 'Show Crash'}
        style={[a.p_md, {borderRadius: 8}]}
      />

      <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
        {JSON.stringify(authWithHostConfig, null, 2)}
      </Text>

      <Button
        onPress={() => authWithHost().then(console.log).catch(console.error)}
        type={ButtonType.Secondary}
        title="Auth with Host"
        style={[a.pt_md, a.p_md, a.rounded_md]}
      />

      <BuggyComponent showCrash={showCrash} />

      <LoadingOverlay isLoading={isLoading} />
    </SafeAreaView>
  )
}

const BuggyComponent = ({showCrash}: {showCrash: boolean}) => {
  if (showCrash) {
    throw new LocalizableError({id: 'api.error.badRequest'})
  }

  return <></>
}
