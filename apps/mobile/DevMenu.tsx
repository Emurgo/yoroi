import {hex} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'

import {BigNumber} from 'bignumber.js'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {Text} from 'react-native'
import {BleManager, LogLevel} from 'react-native-ble-plx'
import {SystemBars} from 'react-native-edge-to-edge'
import {SafeAreaView} from 'react-native-safe-area-context'

import {debugStorage} from 'src/kernel/storage/debug-storage'
import {useAuth} from './src/features/Auth/context/AuthProvider'
import {usePairing} from './src/features/Pairing/context/PairingProvider'
import {decryptData} from './src/kernel/crypto/decrypt-data'
import {encryptData} from './src/kernel/crypto/encrypt-data'
import globalMessages from './src/kernel/i18n/global-messages'
import {useLanguage} from './src/kernel/i18n/LanguageProvider'
import {LocalizableError} from './src/kernel/i18n/LocalizableError'
import {useMetrics} from './src/kernel/metrics/metricsManager'
import {rootMMKV, rootSyncStorage} from './src/kernel/storage/storages'
import {Button, ButtonType} from './src/ui/Button/Button'
import {LoadingOverlay} from './src/ui/LoadingOverlay/LoadingOverlay'

export function DevMenu({visible}: {visible?: boolean}) {
  const {
    isDark,
    config,
    palette: p,
    basePalette,
    selectTheme,
    atoms: ta,
  } = useTheme()
  const {authWithHost} = useAuth()
  const {languageCode, selectLanguage} = useLanguage()
  const {formatMessage: f} = useIntl()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showCrash, setShowCrash] = React.useState(false)
  const showLoadingFor3Seconds = React.useCallback(() => {
    setIsLoading(true)
    const t = setTimeout(() => {
      setIsLoading(false)
      clearTimeout(t)
    }, 3000)
  }, [])
  const metrics = useMetrics()
  const {currency, ptActivity} = usePairing()

  if (!visible) {
    return null
  }

  return (
    <SafeAreaView
      style={[a.flex_1, ta.bg_color_max, a.gap_sm, a.flex_row, a.flex_wrap]}
    >
      <SystemBars style={isDark ? 'light' : 'dark'} />

      <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
        base: {basePalette} selectedTheme: {config} currency: {currency}{' '}
        ptActivity: {ptActivity.close}
      </Text>

      <Button
        onPress={() => selectTheme(isDark ? 'default-light' : 'default-dark')}
        type={ButtonType.Secondary}
        title={`Toggle ${isDark ? 'Light' : 'Dark'} Theme`}
        style={[a.pt_md, a.p_md, a.rounded_md]}
      />

      <Button
        onPress={() => rootSyncStorage.clear()}
        type={ButtonType.Secondary}
        title="Clear Storage"
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

      <Button
        onPress={() => authWithHost().then(console.log).catch(console.error)}
        type={ButtonType.Secondary}
        title="Auth with Host"
        style={[a.pt_md, a.p_md, a.rounded_md]}
      />

      <Button
        onPress={() => {
          metrics.isEnabled ? metrics.disable() : metrics.enable()
        }}
        type={ButtonType.Secondary}
        title={metrics.isEnabled ? 'Disable Metrics' : 'Enable Metrics'}
      />

      <Button
        onPress={() => {
          metrics.track.buyAdaSuccessRedirect()
        }}
        type={ButtonType.Secondary}
        title="Test Metrics"
        disabled={!metrics.isEnabled}
      />

      <Button
        onPress={async () => {
          const ble = new BleManager()
          await ble.enable()
          ble.setLogLevel(LogLevel.Debug)
          ble.startDeviceScan([], {allowDuplicates: true}, (error, devices) => {
            if (error) {
              console.log(error)
            }
            console.log(devices)
          })
        }}
        type={ButtonType.Secondary}
        title="TBLE"
      />

      <Button
        onPress={() => {
          debugStorage(rootMMKV)
        }}
        type={ButtonType.Secondary}
        title="DebugStorage"
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
