import {isBoolean} from '@yoroi/common'
import {useTheme} from '@yoroi/theme'
import {capitalize} from 'lodash'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Platform, ScrollView, StyleSheet, Switch} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Icon, Spacer} from '../../../components'
import {useLanguage} from '../../../i18n'
import {defaultLanguage} from '../../../i18n/languages'
import {CONFIG, isNightly, isProduction} from '../../../legacy/config'
import {lightPalette} from '../../../theme'
import {useAuthSetting, useAuthWithOs, useIsAuthWithOsSupported} from '../../../yoroi-wallets/auth'
import {useCrashReports} from '../../../yoroi-wallets/hooks'
import {usePrivacyMode} from '../../Settings/PrivacyMode/PrivacyMode'
import {useNavigateTo} from '../common/navigation'
import {useCurrencyContext} from '../Currency'
import {useChangeScreenShareSetting, useScreenShareSettingEnabled} from '../ScreenShare'
import {NavigatedSettingsItem, SettingsItem, SettingsSection} from '../SettingsItems'

const iconProps = {
  color: lightPalette.gray['600'],
  size: 23,
}

export const ApplicationSettingsScreen = () => {
  const strings = useStrings()
  const styles = useStyles()
  const {colorScheme} = useTheme()
  const {languageCode, supportedLanguages} = useLanguage()
  const language = supportedLanguages.find((lang) => lang.code === languageCode) ?? defaultLanguage

  const {isTogglePrivacyModeLoading, isPrivacyOff} = usePrivacyMode()
  const {currency} = useCurrencyContext()
  const {enabled: crashReportEnabled} = useCrashReports()

  const authSetting = useAuthSetting()
  const isAuthOsSupported = useIsAuthWithOsSupported()
  const navigateTo = useNavigateTo()
  const {authWithOs} = useAuthWithOs({onSuccess: navigateTo.enableLoginWithPin})

  const {data: screenShareEnabled} = useScreenShareSettingEnabled()
  const displayScreenShareSetting = Platform.OS === 'android' && !isProduction()
  const displayToggleThemeSetting = !isNightly() && !isProduction()

  const onToggleAuthWithOs = () => {
    if (authSetting === 'os') {
      authWithOs()
    } else {
      navigateTo.enableLoginWithOs()
    }
  }

  return (
    <SafeAreaView edges={['bottom', 'right', 'left']} style={styles.root}>
      <ScrollView bounces={false} style={styles.settings}>
        <SettingsSection title={strings.general}>
          <NavigatedSettingsItem
            icon={<Icon.Globe {...iconProps} />}
            label={strings.selectLanguage}
            onNavigate={navigateTo.changeLanguage}
            selected={language.label}
          />

          <NavigatedSettingsItem
            icon={<Icon.Coins {...iconProps} />}
            label={strings.selectFiatCurrency}
            selected={currency}
            onNavigate={navigateTo.changeCurrency}
          />

          <NavigatedSettingsItem
            icon={<Icon.Info {...iconProps} />}
            label={strings.about}
            onNavigate={navigateTo.about}
          />

          <NavigatedSettingsItem
            icon={<Icon.TermsOfUse {...iconProps} />}
            label={strings.termsOfservice}
            onNavigate={navigateTo.termsOfUse}
          />

          <NavigatedSettingsItem
            icon={<Icon.TermsOfUse {...iconProps} />}
            label={strings.privacyPolicy}
            onNavigate={navigateTo.privacyPolicy}
          />

          <NavigatedSettingsItem
            icon={<Icon.Analytics {...iconProps} />}
            label={strings.analytics}
            onNavigate={navigateTo.analytics}
          />

          {displayToggleThemeSetting && (
            <SettingsItem
              icon={<Icon.EyeOff {...iconProps} />} // TODO
              label={`${capitalize(colorScheme)} Theme`} // TODO
            >
              <ToggleThemeSwitch />
            </SettingsItem>
          )}
        </SettingsSection>

        <Spacer height={24} />

        <SettingsSection title={strings.securityReporting}>
          <NavigatedSettingsItem
            disabled={authSetting === 'os'}
            icon={<Icon.Pin {...iconProps} />}
            label={strings.changePin}
            onNavigate={navigateTo.changeCustomPin}
          />

          <SettingsItem
            icon={<Icon.EyeOff {...iconProps} />}
            label={strings.privacyMode}
            info={strings.privacyModeInfo}
          >
            <PrivacyModeSwitch isPrivacyOff={isPrivacyOff} />
          </SettingsItem>

          <SettingsItem
            icon={<Icon.Bio {...iconProps} />}
            label={strings.biometricsSignIn}
            info={strings.biometricsSignInInfo}
            disabled={!isAuthOsSupported}
          >
            <Switch
              value={authSetting === 'os'}
              onValueChange={onToggleAuthWithOs}
              disabled={!isAuthOsSupported || isTogglePrivacyModeLoading}
            />
          </SettingsItem>

          <SettingsItem
            icon={<Icon.Export {...iconProps} />}
            label={strings.crashReporting}
            info={strings.crashReportingInfo}
          >
            <CrashReportsSwitch crashReportEnabled={crashReportEnabled} />
          </SettingsItem>

          {displayScreenShareSetting && (
            <SettingsItem
              icon={<Icon.Share {...iconProps} />}
              label={strings.screenSharing}
              info={strings.screenSharingInfo}
            >
              <ScreenSharingSwitch
                screenSharingEnabled={screenShareEnabled ?? false}
                disabled={!isBoolean(screenShareEnabled)}
              />
            </SettingsItem>
          )}
        </SettingsSection>

        <Spacer height={24} />
      </ScrollView>
    </SafeAreaView>
  )
}

// to avoid switch jumps
const PrivacyModeSwitch = ({isPrivacyOff}: {isPrivacyOff: boolean}) => {
  const {setPrivacyModeOn, setPrivacyModeOff, isTogglePrivacyModeLoading} = usePrivacyMode()
  const [isLocalPrivacyOff, setIsLocalPrivacyOff] = React.useState(isPrivacyOff)

  const onTogglePrivacyMode = () => {
    setIsLocalPrivacyOff((prevState) => {
      if (prevState) {
        setPrivacyModeOn()
      } else {
        setPrivacyModeOff()
      }

      return !prevState
    })
  }

  return <Switch value={isLocalPrivacyOff} onValueChange={onTogglePrivacyMode} disabled={isTogglePrivacyModeLoading} />
}

const ToggleThemeSwitch = () => {
  const {selectColorScheme, colorScheme} = useTheme()
  const [theme, setTheme] = React.useState(true)

  const onToggleThemeMode = () => {
    if (colorScheme === 'light') {
      selectColorScheme('dark')
      setTheme(true)
    }
    if (colorScheme === 'dark') {
      selectColorScheme('light')
      setTheme(false)
    }
  }

  return <Switch value={theme} onValueChange={onToggleThemeMode} />
}

// to avoid switch jumps
const CrashReportsSwitch = ({crashReportEnabled}: {crashReportEnabled: boolean}) => {
  const {enable, disable} = useCrashReports()
  const [isLocalEnabled, setIsLocalEnabled] = React.useState(crashReportEnabled)

  const onToggleCrashReports = () => {
    setIsLocalEnabled((prevState) => {
      if (prevState) {
        enable()
      } else {
        disable()
      }

      return !prevState
    })
  }

  return <Switch value={isLocalEnabled} onValueChange={onToggleCrashReports} disabled={CONFIG.FORCE_CRASH_REPORTS} />
}

// to avoid switch jumps
const ScreenSharingSwitch = ({screenSharingEnabled, disabled}: {screenSharingEnabled: boolean; disabled?: boolean}) => {
  const {changeScreenShareSettings} = useChangeScreenShareSetting()
  const [isLocalEnabled, setIsLocalEnabled] = React.useState(screenSharingEnabled)

  const onToggle = (enabled: boolean) => {
    changeScreenShareSettings(enabled)
    setIsLocalEnabled(enabled)
  }

  return <Switch value={isLocalEnabled} onValueChange={onToggle} disabled={disabled} />
}

const useStrings = () => {
  const intl = useIntl()

  return {
    general: intl.formatMessage(messages.general),
    securityReporting: intl.formatMessage(messages.securityReporting),
    selectLanguage: intl.formatMessage(messages.selectLanguage),
    selectFiatCurrency: intl.formatMessage(messages.selectFiatCurrency),
    about: intl.formatMessage(messages.about),
    changePin: intl.formatMessage(messages.changePin),
    privacyMode: intl.formatMessage(messages.privacyMode),
    privacyModeInfo: intl.formatMessage(messages.privacyModeInfo),
    biometricsSignIn: intl.formatMessage(messages.biometricsSignIn),
    biometricsSignInInfo: intl.formatMessage(messages.biometricsSignInInfo),
    termsOfservice: intl.formatMessage(messages.termsOfservice),
    crashReporting: intl.formatMessage(messages.crashReporting),
    crashReportingInfo: intl.formatMessage(messages.crashReportingInfo),
    analytics: intl.formatMessage(messages.analytics),
    privacyPolicy: intl.formatMessage(messages.privacyPolicy),
    screenSharing: intl.formatMessage(messages.screenSharing),
    screenSharingInfo: intl.formatMessage(messages.screenSharingInfo),
  }
}

const messages = defineMessages({
  general: {
    id: 'components.settings.applicationsettingsscreen.label.general',
    defaultMessage: '!!!General',
  },
  securityReporting: {
    id: 'components.settings.applicationsettingsscreen.label.securityReporting',
    defaultMessage: '!!!Security & Reporting',
  },
  selectLanguage: {
    id: 'components.settings.applicationsettingsscreen.selectLanguage',
    defaultMessage: '!!!Language',
  },
  selectFiatCurrency: {
    id: 'components.settings.applicationsettingsscreen.selectFiatCurrency',
    defaultMessage: '!!!Fiat Currency',
  },
  about: {
    id: 'components.settings.applicationsettingsscreen.about',
    defaultMessage: '!!!About',
  },
  termsOfservice: {
    id: 'components.initialization.acepttermsofservicescreen.title',
    defaultMessage: '!!!Terms of Service Agreement',
  },
  changePin: {
    id: 'components.settings.applicationsettingsscreen.changePin',
    defaultMessage: '!!!Change PIN',
  },
  privacyMode: {
    id: 'components.settings.applicationsettingsscreen.privacyMode',
    defaultMessage: '!!!Hide balance',
  },
  privacyModeInfo: {
    id: 'components.settings.applicationsettingsscreen.privacyModeInfo',
    defaultMessage: '!!!This function will be applied to all wallets in your app',
  },
  biometricsSignIn: {
    id: 'components.settings.applicationsettingsscreen.biometricsSignIn',
    defaultMessage: '!!!Sign in with your biometrics',
  },
  biometricsSignInInfo: {
    id: 'components.settings.applicationsettingsscreen.biometricsSignInInfo',
    defaultMessage: '!!!Changes to this option will be reflected after restarting the application',
  },
  crashReporting: {
    id: 'components.settings.applicationsettingsscreen.crashReporting',
    defaultMessage: '!!!Send crash report to Emurgo',
  },
  crashReportingInfo: {
    id: 'components.settings.applicationsettingsscreen.crashReportingInfo',
    defaultMessage: '!!!Changes to this option will be reflected after restarting the application',
  },
  analytics: {
    id: 'components.settings.applicationsettingsscreen.analytics',
    defaultMessage: '!!!Analytics',
  },
  privacyPolicy: {
    id: 'components.settings.applicationsettingsscreen.privacyPolicy',
    defaultMessage: '!!!Privacy Policy',
  },
  screenSharing: {
    id: 'components.settings.applicationsettingsscreen.screenSharing',
    defaultMessage: '!!!Enable screensharing',
  },
  screenSharingInfo: {
    id: 'components.settings.applicationsettingsscreen.screenSharingInfo',
    defaultMessage:
      '!!!Changes to this option will enable you to make screenshots as well share your screen via third party apps',
  },
})

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.gray.min,
    },
    settings: {
      flex: 1,
      padding: 16,
    },
  })

  return styles
}
