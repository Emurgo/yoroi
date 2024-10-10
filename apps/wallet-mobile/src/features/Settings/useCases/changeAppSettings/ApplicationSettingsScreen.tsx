import {isBoolean} from '@yoroi/common'
import {SupportedThemes, useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Platform, ScrollView, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Icon} from '../../../../components/Icon'
import {Spacer} from '../../../../components/Spacer/Spacer'
import {isNightly, isProduction} from '../../../../kernel/env'
import {useLanguage} from '../../../../kernel/i18n'
import {themeNames} from '../../../../kernel/i18n/global-messages'
import {defaultLanguage} from '../../../../kernel/i18n/languages'
import {useCrashReports} from '../../../../yoroi-wallets/hooks'
import {useAuthSetting, useAuthWithOs, useIsAuthOsSupported} from '../../../Auth/common/hooks'
import {useSelectedNetwork} from '../../../WalletManager/common/hooks/useSelectedNetwork'
import {networkConfigs} from '../../../WalletManager/network-manager/network-manager'
import {useNavigateTo} from '../../common/navigation'
import {SettingsSwitch} from '../../common/SettingsSwitch'
import {NavigatedSettingsItem, SettingsItem, SettingsSection} from '../../SettingsItems'
import {useCurrencyPairing} from './Currency/CurrencyContext'
import {usePrivacyMode} from './PrivacyMode/PrivacyMode'
import {useChangeScreenShareSetting, useScreenShareSettingEnabled} from './ScreenShare'

export const ApplicationSettingsScreen = () => {
  const strings = useStrings()
  const {styles, colors} = useStyles()
  const {name} = useTheme()
  const {languageCode, supportedLanguages} = useLanguage()
  const language = supportedLanguages.find((lang) => lang.code === languageCode) ?? defaultLanguage

  const {isTogglePrivacyModeLoading, isPrivacyActive} = usePrivacyMode()
  const {currency} = useCurrencyPairing()
  const {enabled: crashReportEnabled} = useCrashReports()

  const authSetting = useAuthSetting()
  const isAuthOsSupported = useIsAuthOsSupported()
  const navigateTo = useNavigateTo()
  const {authWithOs} = useAuthWithOs({onSuccess: navigateTo.enableLoginWithPin})
  const {network} = useSelectedNetwork()

  const {data: screenShareEnabled} = useScreenShareSettingEnabled()
  const displayScreenShareSetting = Platform.OS === 'android' && !isProduction

  const onToggleAuthWithOs = () => {
    if (authSetting === 'os') {
      authWithOs()
    } else {
      navigateTo.enableLoginWithOs()
    }
  }

  const iconProps = {
    color: colors.icon,
    size: 23,
  }

  return (
    <SafeAreaView edges={['bottom', 'right', 'left']} style={styles.root}>
      <ScrollView bounces={false} style={styles.settings}>
        <SettingsSection title={strings.general}>
          <NavigatedSettingsItem
            icon={<Icon.Globe {...iconProps} />}
            label={strings.network}
            onNavigate={navigateTo.changeNetwork}
            selected={networkConfigs[network].name}
          />

          <NavigatedSettingsItem
            icon={<Icon.Language {...iconProps} />}
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

          <NavigatedSettingsItem
            icon={<Icon.Theme {...iconProps} />}
            label={strings.selectTheme}
            onNavigate={navigateTo.changeTheme}
            selected={strings.translateThemeName(name)}
          />
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
            <PrivacyModeSwitch isPrivacyActive={isPrivacyActive} />
          </SettingsItem>

          <SettingsItem
            icon={<Icon.Bio {...iconProps} />}
            label={strings.biometricsSignIn}
            info={strings.biometricsSignInInfo}
            disabled={!isAuthOsSupported}
          >
            <SettingsSwitch
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
const PrivacyModeSwitch = ({isPrivacyActive}: {isPrivacyActive: boolean}) => {
  const {setPrivacyModeOn, setPrivacyModeOff, isTogglePrivacyModeLoading} = usePrivacyMode()
  const [isLocalPrivacyActive, setIsLocalPrivacyOff] = React.useState(isPrivacyActive)

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

  return (
    <SettingsSwitch
      value={isLocalPrivacyActive}
      onValueChange={onTogglePrivacyMode}
      disabled={isTogglePrivacyModeLoading}
    />
  )
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

  return <SettingsSwitch value={isLocalEnabled} onValueChange={onToggleCrashReports} disabled={isNightly} />
}

// to avoid switch jumps
const ScreenSharingSwitch = ({screenSharingEnabled, disabled}: {screenSharingEnabled: boolean; disabled?: boolean}) => {
  const {changeScreenShareSettings} = useChangeScreenShareSetting()
  const [isLocalEnabled, setIsLocalEnabled] = React.useState(screenSharingEnabled)

  const onToggle = (enabled: boolean) => {
    changeScreenShareSettings(enabled)
    setIsLocalEnabled(enabled)
  }

  return <SettingsSwitch value={isLocalEnabled} onValueChange={onToggle} disabled={disabled} />
}

const useStrings = () => {
  const intl = useIntl()

  return {
    general: intl.formatMessage(messages.general),
    securityReporting: intl.formatMessage(messages.securityReporting),
    selectLanguage: intl.formatMessage(messages.selectLanguage),
    selectTheme: intl.formatMessage(messages.selectTheme),
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
    translateThemeName: (theme: SupportedThemes) => intl.formatMessage(themeNames[theme]),
    network: intl.formatMessage(messages.network),
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
  selectTheme: {
    id: 'components.settings.applicationsettingsscreen.selectTheme',
    defaultMessage: '!!!Theme',
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
  network: {
    id: 'components.settings.applicationsettingsscreen.network',
    defaultMessage: '!!!Network',
  },
})

const useStyles = () => {
  const {color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.bg_color_max,
    },
    settings: {
      flex: 1,
      padding: 16,
    },
  })

  return {styles, colors: {icon: color.gray_600}} as const
}
