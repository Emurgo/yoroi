import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {useIntl} from 'react-intl'
import {Text} from 'react-native'
import {SystemBars} from 'react-native-edge-to-edge'
import {SafeAreaView} from 'react-native-safe-area-context'
import {BigNumber} from 'bignumber.js'

import {useAuth} from './src/features/Auth/common/context'
import globalMessages from './src/kernel/i18n/global-messages'
import {useLanguage} from './src/kernel/i18n/LanguageProvider'
import {LocalizableError} from './src/kernel/i18n/LocalizableError'
import {useMetrics} from './src/kernel/metrics/metricsManager'
import {rootSyncStorage} from './src/kernel/storage/storages'
import {Button, ButtonType} from './src/ui/Button/Button'
import {LoadingOverlay} from './src/ui/LoadingOverlay/LoadingOverlay'

export function DevMenu({visible}: {visible: boolean}) {
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

  if (!visible) {
    return null
  }

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
