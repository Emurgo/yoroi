import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ScrollView, StyleSheet, Switch} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Icon, Spacer, StatusBar} from '../../../components'
import {useLanguage} from '../../../i18n'
import {CONFIG} from '../../../legacy/config'
import {SettingsRouteNavigation, useWalletNavigation} from '../../../navigation'
import {lightPalette} from '../../../theme'
import {useAuthOsEnabled, useAuthSetting, useAuthWithOs} from '../../../yoroi-wallets/auth'
import {useCrashReports} from '../../../yoroi-wallets/hooks'
import {usePrivacyMode} from '../../Settings/PrivacyMode/PrivacyMode'
import {useCurrencyContext} from '../Currency'
import {NavigatedSettingsItem, SettingsItem, SettingsSection} from '../SettingsItems'

const iconProps = {
  color: lightPalette.gray['600'],
  size: 23,
}

export const ApplicationSettingsScreen = () => {
  const strings = useStrings()
  const {languageCode, supportedLanguages} = useLanguage()
  const language = supportedLanguages.find((lang) => lang.code === languageCode) ?? supportedLanguages['en-US']

  const {isTogglePrivacyModeLoading, isPrivacyOff} = usePrivacyMode()

  const walletNavigation = useWalletNavigation()
  const {currency} = useCurrencyContext()
  const settingsNavigation = useNavigation<SettingsRouteNavigation>()
  const {enabled} = useCrashReports()

  const authSetting = useAuthSetting()
  const authOsEnabled = useAuthOsEnabled()
  const {authWithOs} = useAuthWithOs({onSuccess: () => walletNavigation.navigation.navigate('enable-login-with-pin')})

  const onToggleAuthWithOs = () => {
    if (authSetting === 'os') {
      authWithOs()
    } else {
      walletNavigation.navigation.navigate('app-root', {
        screen: 'settings',
        params: {
          screen: 'enable-login-with-os',
        },
      })
    }
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.settings}>
      <ScrollView bounces={false}>
        <StatusBar type="dark" />

        <SettingsSection title={strings.general}>
          <NavigatedSettingsItem
            icon={<Icon.Globe {...iconProps} />}
            label={strings.selectLanguage}
            onNavigate={() => settingsNavigation.navigate('change-language')}
            selected={language.label}
          />

          <NavigatedSettingsItem
            icon={<Icon.Coins {...iconProps} />}
            label={strings.selectFiatCurrency}
            selected={currency}
            onNavigate={() => settingsNavigation.navigate('change-currency')}
          />

          <NavigatedSettingsItem
            icon={<Icon.Info {...iconProps} />}
            label={strings.about}
            onNavigate={() => settingsNavigation.navigate('about')}
          />

          <NavigatedSettingsItem
            icon={<Icon.TermsOfUse {...iconProps} />}
            label={strings.termsOfservice}
            onNavigate={() => settingsNavigation.navigate('terms-of-use')}
          />

          <NavigatedSettingsItem
            icon={<Icon.TermsOfUse {...iconProps} />}
            label={strings.privacyPolicy}
            onNavigate={() => settingsNavigation.navigate('privacy-policy')}
          />

          <NavigatedSettingsItem
            icon={<Icon.Analytics {...iconProps} />}
            label={strings.analytics}
            onNavigate={() => walletNavigation.navigateToAnalyticsSettings()}
          />
        </SettingsSection>

        <Spacer height={24} />

        <SettingsSection title={strings.securityReporting}>
          <NavigatedSettingsItem
            disabled={authSetting === 'os'}
            icon={<Icon.Pin {...iconProps} />}
            label={strings.changePin}
            onNavigate={() => settingsNavigation.navigate('change-custom-pin')}
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
            disabled={!authOsEnabled}
          >
            <Switch
              value={authSetting === 'os'}
              onValueChange={onToggleAuthWithOs}
              disabled={!authOsEnabled || isTogglePrivacyModeLoading}
            />
          </SettingsItem>

          <SettingsItem
            icon={<Icon.Export {...iconProps} />}
            label={strings.crashReporting}
            info={strings.crashReportingInfo}
          >
            <CrashReportsSwitch enabled={enabled} />
          </SettingsItem>
        </SettingsSection>
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
      if (prevState === true) {
        setPrivacyModeOn()
      } else {
        setPrivacyModeOff()
      }

      return !prevState
    })
  }

  return <Switch value={isLocalPrivacyOff} onValueChange={onTogglePrivacyMode} disabled={isTogglePrivacyModeLoading} />
}

// to avoid switch jumps
const CrashReportsSwitch = ({enabled}: {enabled: boolean}) => {
  const {enable, disable} = useCrashReports()
  const [isLocalEnabled, setIsLocalEnabled] = React.useState(enabled)

  const onToggleCrashReports = () => {
    setIsLocalEnabled((prevState) => {
      if (prevState === true) {
        enable()
      } else {
        disable()
      }

      return !prevState
    })
  }

  return <Switch value={isLocalEnabled} onValueChange={onToggleCrashReports} disabled={CONFIG.FORCE_CRASH_REPORTS} />
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
})

const styles = StyleSheet.create({
  settings: {
    flex: 1,
    paddingTop: 16,
    backgroundColor: '#fff',
  },
})
