import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Platform, ScrollView} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useNavigateTo} from '~/features/Settings/common/navigation'
import {
  NavigatedSettingsItem,
  SettingsItem,
  SettingsSection,
} from '~/features/Settings/SettingsItems'
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {useStrings} from '~/kernel/i18n/useStrings'
import {SettingsSwitch} from '~/ui/SettingsSwitch/SettingsSwitch'
import {useCurrencyPairing} from './Currency/CurrencyContext'
import {usePrivacyMode} from './PrivacyMode/PrivacyMode'
import {
  useChangeScreenShareSetting,
  useScreenShareSettingEnabled,
} from './ScreenShare'
import {useCrashReports} from './useCrashReports'

export const ApplicationSettingsScreen = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {network} = useSelectedNetwork()
  const {isPrivacyActive} = usePrivacyMode()
  const crashReports = useCrashReports()
  const screenShareQuery = useScreenShareSettingEnabled()
  const {currency} = useCurrencyPairing()
  const navigateTo = useNavigateTo()

  const isScreenSharingDisabled = React.useMemo(() => {
    return Platform.OS === 'ios' && network === 'mainnet'
  }, [network])

  return (
    <SafeAreaView
      edges={['bottom', 'right', 'left']}
      style={[ta.bg_color_max, a.flex_1]}
    >
      <ScrollView bounces={false} style={[a.flex_1, a.p_lg]}>
        <SettingsSection title={strings.settings.applicationSettings.general}>
          <NavigatedSettingsItem
            label={strings.settings.applicationSettings.selectLanguage}
            onNavigate={navigateTo.changeLanguage}
            selected="English"
          />

          <NavigatedSettingsItem
            label={strings.settings.applicationSettings.selectFiatCurrency}
            onNavigate={navigateTo.changeCurrency}
            selected={currency}
          />

          <NavigatedSettingsItem
            label={strings.settings.applicationSettings.selectTheme}
            onNavigate={navigateTo.changeTheme}
            selected="Light"
          />
        </SettingsSection>

        <SettingsSection
          title={strings.settings.applicationSettings.securityReporting}
        >
          <SettingsItem
            label={strings.settings.applicationSettings.privacyMode}
          >
            <PrivacyModeSwitch isPrivacyActive={isPrivacyActive} />
          </SettingsItem>

          <SettingsItem
            label={strings.settings.applicationSettings.biometricsSignIn}
          >
            <BiometricsSwitch />
          </SettingsItem>

          <SettingsItem
            label={strings.settings.applicationSettings.crashReporting}
          >
            <CrashReportsSwitch crashReportEnabled={crashReports.enabled} />
          </SettingsItem>

          <SettingsItem
            label={strings.settings.applicationSettings.screenSharing}
          >
            <ScreenSharingSwitch
              screenSharingEnabled={screenShareQuery.data ?? false}
              disabled={isScreenSharingDisabled}
            />
          </SettingsItem>
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  )
}

// to avoid switch jumps
const PrivacyModeSwitch = ({isPrivacyActive}: {isPrivacyActive: boolean}) => {
  const {setPrivacyModeOn, setPrivacyModeOff, isTogglePrivacyModeLoading} =
    usePrivacyMode()
  const [isLocalPrivacyActive, setIsLocalPrivacyOff] =
    React.useState(isPrivacyActive)

  const onTogglePrivacyMode = () => {
    if (isLocalPrivacyActive) {
      setPrivacyModeOff()
      setIsLocalPrivacyOff(false)
    } else {
      setPrivacyModeOn()
      setIsLocalPrivacyOff(true)
    }
  }

  React.useEffect(() => {
    setIsLocalPrivacyOff(isPrivacyActive)
  }, [isPrivacyActive])

  return (
    <SettingsSwitch
      value={isLocalPrivacyActive}
      onValueChange={onTogglePrivacyMode}
      disabled={isTogglePrivacyModeLoading}
    />
  )
}

// to avoid switch jumps
const CrashReportsSwitch = ({
  crashReportEnabled,
}: {
  crashReportEnabled: boolean
}) => {
  const {enable, disable} = useCrashReports()
  const [isLocalEnabled, setIsLocalEnabled] = React.useState(crashReportEnabled)

  const onToggleCrashReports = (enabled: boolean) => {
    if (enabled) {
      enable()
      setIsLocalEnabled(true)
    } else {
      disable()
      setIsLocalEnabled(false)
    }
  }

  React.useEffect(() => {
    setIsLocalEnabled(crashReportEnabled)
  }, [crashReportEnabled])

  return (
    <SettingsSwitch
      value={isLocalEnabled}
      onValueChange={onToggleCrashReports}
      disabled={false}
    />
  )
}

// to avoid switch jumps
const ScreenSharingSwitch = ({
  screenSharingEnabled,
  disabled,
}: {
  screenSharingEnabled: boolean
  disabled?: boolean
}) => {
  const {changeScreenShareSettings} = useChangeScreenShareSetting()
  const [isLocalEnabled, setIsLocalEnabled] =
    React.useState(screenSharingEnabled)

  const onToggle = (enabled: boolean) => {
    changeScreenShareSettings(enabled)
    setIsLocalEnabled(enabled)
  }

  React.useEffect(() => {
    setIsLocalEnabled(screenSharingEnabled)
  }, [screenSharingEnabled])

  return (
    <SettingsSwitch
      value={isLocalEnabled}
      onValueChange={onToggle}
      disabled={disabled}
    />
  )
}

// Placeholder component for biometrics switch
const BiometricsSwitch = () => {
  const [isEnabled, setIsEnabled] = React.useState(false)

  return (
    <SettingsSwitch
      value={isEnabled}
      onValueChange={setIsEnabled}
      disabled={false}
    />
  )
}
