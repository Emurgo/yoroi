// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {ScrollView, StyleSheet, Switch, Platform} from 'react-native'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import {SETTINGS_ROUTES} from '../../RoutesList'
import {withNavigationTitle} from '../../utils/renderUtils'
import {errorMessages} from '../../i18n/global-messages'
import {setAppSettingField, setSystemAuth, showErrorDialog} from '../../actions'
import {APP_SETTINGS_KEYS} from '../../helpers/appSettings'
import {CONFIG} from '../../config/config'
import {
  isBiometricEncryptionHardwareSupported,
  canBiometricEncryptionBeEnabled,
} from '../../helpers/deviceSettings'
import {
  SettingsItem,
  SettingsBuildItem,
  NavigatedSettingsItem,
  SettingsSection,
} from './SettingsItems'
import {
  biometricHwSupportSelector,
  isSystemAuthEnabledSelector,
  installationIdSelector,
  sendCrashReportsSelector,
  languageSelector,
} from '../../selectors'
import walletManager from '../../crypto/walletManager'
import KeyStore from '../../crypto/KeyStore'
import {StatusBar} from '../UiKit'

import type {ComponentType} from 'react'
import type {Navigation} from '../../types/navigation'

import DeviceInfo from 'react-native-device-info'

const messages = defineMessages({
  title: {
    id: 'components.settings.applicationsettingsscreen.title',
    defaultMessage: 'Settings',
  },
  tabTitle: {
    id: 'components.settings.applicationsettingsscreen.tabTitle',
    defaultMessage: 'Application',
  },
  language: {
    id: 'components.settings.applicationsettingsscreen.language',
    defaultMessage: 'Your language',
  },
  currentLanguage: {
    id: 'components.settings.applicationsettingsscreen.currentLanguage',
    defaultMessage: '!!!English',
  },
  security: {
    id: 'components.settings.applicationsettingsscreen.security',
    defaultMessage: 'Security',
  },
  changePin: {
    id: 'components.settings.applicationsettingsscreen.changePin',
    defaultMessage: 'Change PIN',
  },
  biometricsSignIn: {
    id: 'components.settings.applicationsettingsscreen.biometricsSignIn',
    defaultMessage: '!!!Sign in with your biometrics',
    description: 'some desc',
  },
  crashReporting: {
    id: 'components.settings.applicationsettingsscreen.crashReporting',
    defaultMessage: '!!!Crash reporting',
    description: 'some desc',
  },
  crashReportingText: {
    id: 'components.settings.applicationsettingsscreen.crashReportingText',
    defaultMessage:
      'Send crash reports to Emurgo. ' +
      'Changes to this option will be reflected ' +
      ' after restarting the application.',
  },
  termsOfUse: {
    id: 'components.settings.applicationsettingsscreen.termsOfUse',
    defaultMessage: 'Terms of Use',
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

const disableBiometrics = ({navigation, setSystemAuth}) => async () => {
  await setSystemAuth(false)

  navigation.navigate(SETTINGS_ROUTES.MAIN)
}

const onToggleBiometricsAuthIn = ({
  isSystemAuthEnabled,
  navigation,
  intl,
  installationId,
  disableBiometrics,
}) => async () => {
  if (isSystemAuthEnabled) {
    if (!walletManager.canBiometricsSignInBeDisabled()) {
      await showErrorDialog(errorMessages.disableEasyConfirmationFirst, intl)

      return
    }

    navigation.navigate(SETTINGS_ROUTES.BIO_AUTHENTICATE, {
      keyId: installationId,
      onSuccess: () =>
        navigation.navigate(SETTINGS_ROUTES.SETUP_CUSTOM_PIN, {
          onSuccess: disableBiometrics,
        }),
      onFail: (reason) => {
        if (reason === KeyStore.REJECTIONS.CANCELED) {
          navigation.navigate(SETTINGS_ROUTES.MAIN)
        } else {
          throw new Error(`Could not authenticate user: ${reason}`)
        }
      },
    })
  } else {
    navigation.navigate(SETTINGS_ROUTES.FINGERPRINT_LINK)
  }
}

const updateDeviceSettings = async ({setAppSettingField}) => {
  // prettier-ignore
  const isHardwareSupported =
    await isBiometricEncryptionHardwareSupported()
  // prettier-ignore
  const canEnableBiometricEncryption =
    await canBiometricEncryptionBeEnabled()

  await setAppSettingField(
    APP_SETTINGS_KEYS.BIOMETRIC_HW_SUPPORT,
    isHardwareSupported,
  )
  await setAppSettingField(
    APP_SETTINGS_KEYS.CAN_ENABLE_BIOMETRIC_ENCRYPTION,
    canEnableBiometricEncryption,
  )
}

const version = DeviceInfo.getVersion()

const ApplicationSettingsScreen = ({
  onToggleBiometricsAuthIn,
  intl,
  updateDeviceSettings,
  isBiometricHardwareSupported,
  isSystemAuthEnabled,
  sendCrashReports,
  setCrashReporting,
  navigation,
}) => {
  React.useEffect(
    () => {
      const unsubscribe = navigation.addListener('focus', () => {
        updateDeviceSettings()
      })
      return unsubscribe
    },
    [navigation],
  )

  // it's better if we prevent users who:
  //   1. are not using biometric auth yet
  //   2. are on Android 10+
  // from enabling this feature since they can encounter issues (and may not be
  // able to access their wallets eventually, neither rollback this!)
  const shouldNotEnableBiometricAuth =
    Platform.OS === 'android' &&
    CONFIG.ANDROID_BIO_AUTH_EXCLUDED_SDK.includes(Platform.Version) &&
    !isSystemAuthEnabled

  return (
    <ScrollView style={styles.scrollView}>
      <StatusBar type="dark" />

      <SettingsSection title={intl.formatMessage(messages.language)}>
        <NavigatedSettingsItem
          label={intl.formatMessage(messages.currentLanguage)}
          navigateTo={SETTINGS_ROUTES.CHANGE_LANGUAGE}
        />
      </SettingsSection>

      <SettingsSection title={intl.formatMessage(messages.security)}>
        <NavigatedSettingsItem
          label={intl.formatMessage(messages.changePin)}
          navigateTo={SETTINGS_ROUTES.CHANGE_CUSTOM_PIN}
          disabled={isSystemAuthEnabled}
        />

        <SettingsItem
          label={intl.formatMessage(messages.biometricsSignIn)}
          disabled={
            !isBiometricEncryptionHardwareSupported ||
            shouldNotEnableBiometricAuth
          }
        >
          <Switch
            value={isSystemAuthEnabled}
            onValueChange={onToggleBiometricsAuthIn}
            disabled={
              !isBiometricHardwareSupported || shouldNotEnableBiometricAuth
            }
          />
        </SettingsItem>
      </SettingsSection>

      <SettingsSection title={intl.formatMessage(messages.crashReporting)}>
        <SettingsItem label={intl.formatMessage(messages.crashReportingText)}>
          <Switch value={sendCrashReports} onValueChange={setCrashReporting} />
        </SettingsItem>
      </SettingsSection>

      <SettingsSection>
        <NavigatedSettingsItem
          label={intl.formatMessage(messages.termsOfUse)}
          navigateTo={SETTINGS_ROUTES.TERMS_OF_USE}
        />

        <NavigatedSettingsItem
          label={intl.formatMessage(messages.support)}
          navigateTo={SETTINGS_ROUTES.SUPPORT}
        />
      </SettingsSection>

      <SettingsSection title="About">
        <SettingsBuildItem
          label={intl.formatMessage(messages.version)}
          value={version}
        />

        <SettingsBuildItem
          label={intl.formatMessage(messages.commit)}
          value={CONFIG.COMMIT}
        />
      </SettingsSection>
    </ScrollView>
  )
}
export default injectIntl(
  (compose(
    connect(
      (state) => ({
        isBiometricHardwareSupported: biometricHwSupportSelector(state),
        sendCrashReports: sendCrashReportsSelector(state),
        isSystemAuthEnabled: isSystemAuthEnabledSelector(state),
        installationId: installationIdSelector(state),
        key: languageSelector(state),
      }),
      {setAppSettingField, setSystemAuth},
    ),
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withNavigationTitle(
      ({intl}) => intl.formatMessage(messages.tabTitle),
      'applicationTabTitle',
    ),
    withHandlers({
      disableBiometrics,
    }),
    withHandlers({
      onToggleBiometricsAuthIn,
      updateDeviceSettings: ({setAppSettingField}) => () => {
        // Runaway promise. This is needed because
        // onWillFocus accepts only ()=>void
        updateDeviceSettings({setAppSettingField})
      },
      setCrashReporting: ({setAppSettingField}) => (value: boolean) => {
        setAppSettingField(APP_SETTINGS_KEYS.SEND_CRASH_REPORTS, value)
      },
    }),
  )(ApplicationSettingsScreen): ComponentType<{
    navigation: Navigation,
    intl: IntlShape,
  }>),
)
