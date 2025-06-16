import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {useIntl} from 'react-intl'
import {SystemBars} from 'react-native-edge-to-edge'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useAuth} from './src/features/Auth/common/context'
import {LoginWithHostScreen} from './src/features/Auth/screens/LoginWithHostScreen'
import {useConnectionStatus} from './src/kernel/connection/ConnectionProvider'
import {useLanguage} from './src/kernel/i18n/LanguageProvider'
import {LocalizableError} from './src/kernel/i18n/LocalizableError'
import {Boundary} from './src/ui/Boundary/Boundary'
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
  const {
    authSetting,
    changeAuthSetting,
    isLoggedIn,
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

      <Boundary
        loading={{
          enabled: true,
          size: 'full',
        }}
      >
        {/* <LoginWithPinScreen /> */}
        <LoginWithHostScreen />
      </Boundary>

      {/* <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
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
          const startEncrypt = Date.now()
          const encrypted = encryptData({
            plainData: hex.fromUtf8('masterkey'),
            secretKey: hex.fromUtf8('password'),
          })
          console.log('Encryption time:', Date.now() - startEncrypt, 'ms')

          const startDecrypt = Date.now()
          const decrypted = decryptData({
            encryptedData: encrypted,
            secretKey: hex.fromUtf8('password'),
          })
          console.log('Decryption time:', Date.now() - startDecrypt, 'ms')

          console.log('Decrypted result:', decrypted.utf8)
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

      <BuggyComponent showCrash={showCrash} /> */}

      <LoadingOverlay />
    </SafeAreaView>
  )
}

const BuggyComponent = ({showCrash}: {showCrash: boolean}) => {
  if (showCrash) {
    throw new LocalizableError({id: 'api.error.badRequest'})
  }

  return <></>
}
