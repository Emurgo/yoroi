import {networkConfigs} from '@yoroi/blockchains'
import {useSyncStorageToState} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {ScrollView} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useAuthSetting} from '~/features/Auth/hooks/useAuthSetting'
import {useAuthWithOs} from '~/features/Auth/hooks/useAuthWithOs'
import {useIsAuthOsSupported} from '~/features/Auth/hooks/useIsAuthOsSupported'
import {
  NavigatedSettingsItem,
  SettingsItem,
  SettingsSection,
} from '~/features/Settings/SettingsItems'
import {useNavigateTo} from '~/features/Settings/common/navigation'
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {isAndroid} from '~/kernel/constants'
import {useLanguage} from '~/kernel/i18n/LanguageProvider'
import {LanguageRecord, supportedLanguages} from '~/kernel/i18n/localization'
import {useStrings} from '~/kernel/i18n/useStrings'
import {
  crashReportsStorageKeyManager,
  screenShareStorageKeyManager,
} from '~/kernel/storage/storages'
import {Icon} from '~/ui/Icon'
import {SettingsSwitch} from '~/ui/SettingsSwitch/SettingsSwitch'
import {Space} from '~/ui/Space/Space'

import {useCurrencyPairing} from './ChangeCurrencyScreen/CurrencyContext'
import {usePrivacyMode} from './PrivacyMode/usePrivacyMode'
import {
  changeScreenShareNativeSettingOnAndroid,
  useScreenShareSettingEnabled,
} from './ScreenShare/ScreenShare'

export const ApplicationSettingsScreen = () => {
  const strings = useStrings()
  const {atoms: ta, paletteName: name, palette: p} = useTheme()
  const {languageCode} = useLanguage()
  const language = supportedLanguages.find(
    (lang) => lang.code === languageCode,
  ) as LanguageRecord

  const {isPrivacyActive} = usePrivacyMode()
  const {currency} = useCurrencyPairing()

  const authSetting = useAuthSetting()
  const isAuthOsSupported = useIsAuthOsSupported()
  const navigateTo = useNavigateTo()

  const {authWithOs} = useAuthWithOs({onSuccess: navigateTo.enableLoginWithPin})

  const {network} = useSelectedNetwork()

  const {isLoading: isScreenShareLoading} = useScreenShareSettingEnabled()

  const onToggleAuthWithOs = () => {
    if (authSetting === 'os') {
      authWithOs()
    } else {
      navigateTo.enableLoginWithOs()
    }
  }

  const iconProps = {
    color: p.gray_400,
    size: 23,
  }

  return (
    <SafeAreaView
      edges={['bottom', 'right', 'left']}
      style={[ta.bg_color_max, a.flex_1]}
    >
      <ScrollView bounces={false} style={[a.flex_1, a.p_lg]}>
        <SettingsSection title={strings.settings.applicationSettings.general}>
          <NavigatedSettingsItem
            icon={<Icon.Globe {...iconProps} />}
            label={strings.settings.applicationSettings.network}
            onNavigate={navigateTo.changeNetwork}
            selected={networkConfigs[network].name}
          />

          <NavigatedSettingsItem
            icon={<Icon.Language {...iconProps} />}
            label={strings.settings.applicationSettings.selectLanguage}
            onNavigate={navigateTo.changeLanguage}
            selected={language.label}
          />

          <NavigatedSettingsItem
            icon={<Icon.Coins {...iconProps} />}
            label={strings.settings.applicationSettings.selectFiatCurrency}
            selected={currency}
            onNavigate={navigateTo.changeCurrency}
          />

          <NavigatedSettingsItem
            icon={<Icon.Info {...iconProps} />}
            label={strings.settings.applicationSettings.about}
            onNavigate={navigateTo.about}
          />

          <NavigatedSettingsItem
            icon={<Icon.TermsOfUse {...iconProps} />}
            label={strings.settings.applicationSettings.termsOfservice}
            onNavigate={navigateTo.termsOfUse}
          />

          <NavigatedSettingsItem
            icon={<Icon.TermsOfUse {...iconProps} />}
            label={strings.settings.applicationSettings.privacyPolicy}
            onNavigate={navigateTo.privacyPolicy}
          />

          <NavigatedSettingsItem
            icon={<Icon.Analytics {...iconProps} />}
            label={strings.settings.applicationSettings.analytics}
            onNavigate={navigateTo.analytics}
          />

          <NavigatedSettingsItem
            icon={<Icon.Theme {...iconProps} />}
            label={strings.settings.applicationSettings.selectTheme}
            onNavigate={navigateTo.changeTheme}
            selected={strings.settings.theme.translateThemeName(name)}
          />
        </SettingsSection>

        <Space.Height.xl />

        <SettingsSection
          title={strings.settings.applicationSettings.securityReporting}
        >
          <NavigatedSettingsItem
            disabled={authSetting === 'os'}
            icon={<Icon.Pin {...iconProps} />}
            label={strings.settings.applicationSettings.changePin}
            onNavigate={navigateTo.changeCustomPin}
          />

          <SettingsItem
            icon={<Icon.EyeOff {...iconProps} />}
            label={strings.settings.applicationSettings.privacyMode}
            info={strings.settings.applicationSettings.privacyModeInfo}
          >
            <PrivacyModeSwitch isPrivacyActive={isPrivacyActive} />
          </SettingsItem>

          <SettingsItem
            icon={<Icon.Bio {...iconProps} />}
            label={strings.settings.applicationSettings.biometricsSignIn}
            info={strings.settings.applicationSettings.biometricsSignInInfo}
            disabled={!isAuthOsSupported}
          >
            <SettingsSwitch
              value={authSetting === 'os'}
              onValueChange={onToggleAuthWithOs}
              disabled={!isAuthOsSupported}
            />
          </SettingsItem>

          <SettingsItem
            icon={<Icon.Export {...iconProps} />}
            label={strings.settings.applicationSettings.crashReporting}
            info={strings.settings.applicationSettings.crashReportingInfo}
          >
            <CrashReportsSwitch />
          </SettingsItem>

          {isAndroid && (
            <SettingsItem
              icon={<Icon.Share {...iconProps} />}
              label={strings.settings.applicationSettings.screenSharing}
              info={strings.settings.applicationSettings.screenSharingInfo}
            >
              <ScreenSharingSwitch disabled={isScreenShareLoading} />
            </SettingsItem>
          )}
        </SettingsSection>

        <Space.Height.xl />
      </ScrollView>
    </SafeAreaView>
  )
}

// to avoid switch jumps
const PrivacyModeSwitch = ({isPrivacyActive}: {isPrivacyActive: boolean}) => {
  const {setPrivacyModeOn, setPrivacyModeOff} = usePrivacyMode()
  const [isLocalPrivacyActive, setIsLocalPrivacyOff] =
    React.useState(isPrivacyActive)

  const onTogglePrivacyMode = () => {
    setIsLocalPrivacyOff((prevState) => {
      const next = !prevState
      if (next) {
        setPrivacyModeOn()
      } else {
        setPrivacyModeOff()
      }
      return next
    })
  }

  return (
    <SettingsSwitch
      value={isLocalPrivacyActive}
      onValueChange={onTogglePrivacyMode}
    />
  )
}

// to avoid switch jumps
const CrashReportsSwitch = ({}: {}) => {
  const [isLocalCrashReportEnabled, setIsLocalCrashReportEnabled] =
    useSyncStorageToState(crashReportsStorageKeyManager)

  const onToggleCrashReports = () => {
    setIsLocalCrashReportEnabled(!isLocalCrashReportEnabled)
  }

  return (
    <SettingsSwitch
      value={isLocalCrashReportEnabled}
      onValueChange={onToggleCrashReports}
    />
  )
}

// to avoid switch jumps
const ScreenSharingSwitch = ({disabled}: {disabled: boolean}) => {
  const [isLocalScreenSharingEnabled, setIsLocalScreenSharingEnabled] =
    useSyncStorageToState(screenShareStorageKeyManager)

  const onToggleScreenSharing = () => {
    const newState = !isLocalScreenSharingEnabled
    setIsLocalScreenSharingEnabled(newState)
    changeScreenShareNativeSettingOnAndroid(newState)
  }

  return (
    <SettingsSwitch
      value={isLocalScreenSharingEnabled}
      onValueChange={onToggleScreenSharing}
      disabled={disabled}
    />
  )
}
