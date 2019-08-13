// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {ScrollView, StyleSheet, Switch} from 'react-native'
import {NavigationEvents} from 'react-navigation'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {SETTINGS_ROUTES} from '../../RoutesList'
import {withNavigationTitle} from '../../utils/renderUtils'
import {errorMessages} from '../../i18n/global-messages'
import {setAppSettingField, setSystemAuth, showErrorDialog} from '../../actions'
import {APP_SETTINGS_KEYS} from '../../helpers/appSettings'
import env from '../../env'
import {
  isBiometricEncryptionHardwareSupported,
  canBiometricEncryptionBeEnabled,
} from '../../helpers/deviceSettings'
import {
  SettingsItem,
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
import walletManager from '../../crypto/wallet'
import KeyStore from '../../crypto/KeyStore'
import {StatusBar} from '../UiKit'

import type {ComponentType} from 'react'
import type {Navigation} from '../../types/navigation'

import DeviceInfo from 'react-native-device-info';

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
  setSystemAuth,
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

const versionLabel = "Current version: " + DeviceInfo.getVersion()

const network = env.getBoolean('USE_TESTNET', true) ? 'Testnet' : 'Mainnet'

const networkLabel = "Network: " + network

const ApplicationSettingsScreen = ({
  onToggleBiometricsAuthIn,
  intl,
  updateDeviceSettings,
  isBiometricHardwareSupported,
  isSystemAuthEnabled,
  sendCrashReports,
  setCrashReporting,
  locale,
}) => (
  <ScrollView style={styles.scrollView}>
    <StatusBar type="dark" />

    <NavigationEvents onWillFocus={updateDeviceSettings} />
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
        disabled={!isBiometricEncryptionHardwareSupported}
      >
        <Switch
          value={isSystemAuthEnabled}
          onValueChange={onToggleBiometricsAuthIn}
          disabled={!isBiometricHardwareSupported}
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
      <SettingsItem
        label={versionLabel}
      />

      <SettingsItem
        label={networkLabel}
      />
    </SettingsSection>
  </ScrollView>
)

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
        // Runaway promise. This is neaded because
        // onWillFocus accepts only ()=>void
        updateDeviceSettings({setAppSettingField})
      },
      setCrashReporting: ({setAppSettingField}) => (value: boolean) => {
        setAppSettingField(APP_SETTINGS_KEYS.SEND_CRASH_REPORTS, value)
      },
    }),
  )(ApplicationSettingsScreen): ComponentType<{
    navigation: Navigation,
    intl: intlShape,
  }>),
)
