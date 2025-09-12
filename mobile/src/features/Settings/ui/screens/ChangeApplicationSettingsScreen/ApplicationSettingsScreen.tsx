import {networkConfigs} from '@yoroi/blockchains'
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
import {useNavigateTo} from '~/features/Settings/hooks/useNavigateTo'
import {useScreenCapture} from '~/features/Settings/hooks/useScreenCapture'
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {useLanguage} from '~/kernel/i18n/LanguageProvider'
import {LanguageRecord, supportedLanguages} from '~/kernel/i18n/localization'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Icon} from '~/ui/Icon'
import {SettingsSwitch} from '~/ui/SettingsSwitch/SettingsSwitch'

import {useCurrencyPairing} from '../../../context/CurrencyProvider'
import {useCrashReport} from '../../../hooks/useCrashReport'
import {usePrivacyMode} from '../../../hooks/usePrivacyMode'

export const ApplicationSettingsScreen = () => {
  const strings = useStrings()
  const {isPrivacyActive, togglePrivacyMode} = usePrivacyMode()
  const {isCrashReportEnabled, toggleIsCrashReportEnabled} = useCrashReport()
  const {currency} = useCurrencyPairing()
  const authSetting = useAuthSetting()
  const isAuthOsSupported = useIsAuthOsSupported()
  const navigateTo = useNavigateTo()
  const {network} = useSelectedNetwork()
  const {atoms: ta, paletteName: name, palette: p} = useTheme()
  const {languageCode} = useLanguage()
  const {authWithOs} = useAuthWithOs({onSuccess: navigateTo.enableLoginWithPin})
  const {
    isScreenSharingEnabled,
    toggleIsScreenSharingEnabled,
    canSwitchScreenSharing,
  } = useScreenCapture()

  const language = supportedLanguages.find(
    (lang) => lang.code === languageCode,
  ) as LanguageRecord

  const handleOnToggleAuthWithOs = () => {
    if (authSetting === 'os') {
      authWithOs()
    } else {
      navigateTo.enableLoginWithOs()
    }
  }

  const handleOnTogglePrivacyMode = () => {
    togglePrivacyMode()
  }
  const handleOnToggleCrashReports = () => {
    toggleIsCrashReportEnabled()
  }

  const handleOnToggleScreenSharingEnabled = () => {
    toggleIsScreenSharingEnabled()
  }

  const iconProps = {
    color: p.gray_400,
    size: 23,
  }

  return (
    <SafeAreaView
      edges={['bottom', 'right', 'left']}
      style={[a.flex_1, ta.bg_color_max]}
    >
      <ScrollView
        bounces={false}
        style={a.flex_1}
        contentContainerStyle={[a.px_lg, a.gap_lg]}
      >
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
            <SettingsSwitch
              value={isPrivacyActive}
              onValueChange={handleOnTogglePrivacyMode}
            />
            {/* <PrivacyModeSwitch isPrivacyActive={isPrivacyActive} /> */}
          </SettingsItem>

          <SettingsItem
            icon={<Icon.Bio {...iconProps} />}
            label={strings.settings.applicationSettings.biometricsSignIn}
            info={strings.settings.applicationSettings.biometricsSignInInfo}
            disabled={!isAuthOsSupported}
          >
            <SettingsSwitch
              value={authSetting === 'os'}
              onValueChange={handleOnToggleAuthWithOs}
              disabled={!isAuthOsSupported}
            />
          </SettingsItem>

          <SettingsItem
            icon={<Icon.Export {...iconProps} />}
            label={strings.settings.applicationSettings.crashReporting}
            info={strings.settings.applicationSettings.crashReportingInfo}
          >
            <SettingsSwitch
              value={isCrashReportEnabled}
              onValueChange={handleOnToggleCrashReports}
            />
          </SettingsItem>

          {canSwitchScreenSharing && (
            <SettingsItem
              icon={<Icon.Share {...iconProps} />}
              label={strings.settings.applicationSettings.screenSharing}
              info={strings.settings.applicationSettings.screenSharingInfo}
            >
              <SettingsSwitch
                value={isScreenSharingEnabled}
                onValueChange={handleOnToggleScreenSharingEnabled}
              />
            </SettingsItem>
          )}
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  )
}
