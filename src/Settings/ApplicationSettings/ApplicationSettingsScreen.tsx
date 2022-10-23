import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Alert, ScrollView, StyleSheet, Switch} from 'react-native'
import DeviceInfo from 'react-native-device-info'

import {useAuthOsErrorDecoder, useAuthWithOs, useCanEnableAuthOs} from '../../auth'
import {StatusBar} from '../../components'
import {useAuthMethod, useCrashReports, useRefetchOnFocus} from '../../hooks'
import globalMessages from '../../i18n/global-messages'
import {CONFIG, isNightly} from '../../legacy/config'
import {isEmptyString} from '../../legacy/utils'
import {useWalletNavigation} from '../../navigation'
import {useStorage} from '../../Storage'
import {useCurrencyContext} from '../Currency'
import {NavigatedSettingsItem, SettingsBuildItem, SettingsItem, SettingsSection} from '../SettingsItems'

const version = DeviceInfo.getVersion()

export const ApplicationSettingsScreen = () => {
  const strings = useStrings()
  const {navigation} = useWalletNavigation()

  const {currency} = useCurrencyContext()
  const storage = useStorage()
  const {authMethod, refetch: refetchAuthMethod} = useAuthMethod(storage)

  const {canEnableOsAuth, refetch: refetchCanEnableOSAuth} = useCanEnableAuthOs({
    // on emulator
    refetchInterval: __DEV__ ? 2000 : false,
  })
  // react-query useRefetchOnWindowsFocus doesn't work in react-native
  useRefetchOnFocus(refetchCanEnableOSAuth)
  useRefetchOnFocus(refetchAuthMethod)

  const decodeAuthOsError = useAuthOsErrorDecoder()
  const {authWithOs} = useAuthWithOs(
    {
      authenticationPrompt: {
        title: strings.authorize,
        cancel: strings.cancel,
      },
      storage,
    },
    {
      onSuccess: () => navigation.navigate('enable-login-with-pin'),
      onError: (error) => {
        const errorMessage = decodeAuthOsError(error)
        if (!isEmptyString(errorMessage)) Alert.alert(strings.error, errorMessage)
      },
    },
  )

  const crashReports = useCrashReports()

  const onToggleBiometricsAuthIn = async () => {
    if (authMethod?.isOS) {
      authWithOs()
    } else {
      navigation.navigate('app-root', {
        screen: 'settings',
        params: {
          screen: 'enable-login-with-os',
        },
      })
    }
  }

  return (
    <ScrollView style={styles.scrollView}>
      <StatusBar type="dark" />

      <SettingsSection title={strings.language}>
        <NavigatedSettingsItem label={strings.currentLanguage} navigateTo="change-language" />

        <NavigatedSettingsItem label={`${strings.currency} (${currency})`} navigateTo="change-currency" />
      </SettingsSection>

      <SettingsSection title={strings.security}>
        <NavigatedSettingsItem label={strings.changePin} navigateTo="change-custom-pin" disabled={!authMethod?.isPIN} />

        <SettingsItem label={strings.biometricsSignIn} disabled={!canEnableOsAuth}>
          <Switch value={authMethod?.isOS} onValueChange={onToggleBiometricsAuthIn} disabled={!canEnableOsAuth} />
        </SettingsItem>
      </SettingsSection>

      <SettingsSection title={strings.crashReporting}>
        <SettingsItem label={strings.crashReportingText}>
          <Switch
            value={crashReports.enabled}
            onValueChange={crashReports.enabled ? crashReports.disable : crashReports.enable}
            disabled={isNightly()}
          />
        </SettingsItem>
      </SettingsSection>

      <SettingsSection>
        <NavigatedSettingsItem label={strings.termsOfUse} navigateTo="terms-of-use" />

        <NavigatedSettingsItem label={strings.support} navigateTo="support" />
      </SettingsSection>

      <SettingsSection title="About">
        <SettingsBuildItem label={strings.version} value={version} />

        <SettingsBuildItem label={strings.commit} value={CONFIG.COMMIT} />
      </SettingsSection>
    </ScrollView>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    language: intl.formatMessage(messages.language),
    currentLanguage: intl.formatMessage(messages.currentLanguage),
    security: intl.formatMessage(messages.security),
    changePin: intl.formatMessage(messages.changePin),
    biometricsSignIn: intl.formatMessage(messages.biometricsSignIn),
    termsOfUse: intl.formatMessage(messages.termsOfUse),
    support: intl.formatMessage(messages.support),
    version: intl.formatMessage(messages.version),
    commit: intl.formatMessage(messages.commit),
    crashReporting: intl.formatMessage(messages.crashReporting),
    crashReportingText: intl.formatMessage(messages.crashReportingText),
    currency: intl.formatMessage(globalMessages.currency),
    authorize: intl.formatMessage(messages.authorize),
    cancel: intl.formatMessage(globalMessages.cancel),
    error: intl.formatMessage(globalMessages.error),
  }
}

const messages = defineMessages({
  authorize: {
    id: 'components.send.biometricauthscreen.authorizeOperation',
    defaultMessage: '!!!Authorize operation',
  },
  language: {
    id: 'components.settings.applicationsettingsscreen.language',
    defaultMessage: '!!!Your language',
  },
  currentLanguage: {
    id: 'components.settings.applicationsettingsscreen.currentLanguage',
    defaultMessage: '!!!English',
  },
  security: {
    id: 'components.settings.applicationsettingsscreen.security',
    defaultMessage: '!!!Security',
  },
  changePin: {
    id: 'components.settings.applicationsettingsscreen.changePin',
    defaultMessage: '!!!Change PIN',
  },
  biometricsSignIn: {
    id: 'components.settings.applicationsettingsscreen.biometricsSignIn',
    defaultMessage: '!!!Sign in with your biometrics',
  },
  crashReporting: {
    id: 'components.settings.applicationsettingsscreen.crashReporting',
    defaultMessage: '!!!Crash reporting',
  },
  crashReportingText: {
    id: 'components.settings.applicationsettingsscreen.crashReportingText',
    defaultMessage:
      '!!!Send crash reports to Emurgo. Changes to this option will be reflected after restarting the application.',
  },
  termsOfUse: {
    id: 'components.settings.applicationsettingsscreen.termsOfUse',
    defaultMessage: '!!!Terms of Use',
  },
  support: {
    id: 'components.settings.applicationsettingsscreen.support',
    defaultMessage: '!!!Support',
  },
  version: {
    id: 'components.settings.applicationsettingsscreen.version',
    defaultMessage: '!!!Current version:',
  },
  commit: {
    id: 'components.settings.applicationsettingsscreen.commit',
    defaultMessage: '!!!Commit:',
  },
})

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#fff',
  },
})
