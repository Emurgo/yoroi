// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {ScrollView, StyleSheet, Switch} from 'react-native'
import {NavigationEvents} from 'react-navigation'

import {SETTINGS_ROUTES} from '../../RoutesList'
import {withNavigationTitle} from '../../utils/renderUtils'
import {setAppSettingField, setSystemAuth, showErrorDialog} from '../../actions'
import {APP_SETTINGS_KEYS} from '../../helpers/appSettings'
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
} from '../../selectors'
import walletManager from '../../crypto/wallet'
import KeyStore from '../../crypto/KeyStore'
import {StatusBar} from '../UiKit'

import type {ComponentType} from 'react'
import type {Navigation} from '../../types/navigation'

const getTranslations = (state) => state.trans.SettingsScreen.ApplicationTab

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
  translations,
  installationId,
  disableBiometrics,
}) => async () => {
  if (isSystemAuthEnabled) {
    if (!walletManager.canBiometricsSignInBeDisabled()) {
      await showErrorDialog((dialogs) => dialogs.disableEasyConfirmationFirst)

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
  const isHardwareSupported =
    await isBiometricEncryptionHardwareSupported()
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

const ApplicationSettingsScreen = ({
  onToggleBiometricsAuthIn,
  translations,
  updateDeviceSettings,
  isBiometricHardwareSupported,
  isSystemAuthEnabled,
  language,
  sendCrashReports,
  setCrashReporting,
}) => (
  <ScrollView style={styles.scrollView}>
    <StatusBar type="dark" />

    <NavigationEvents onWillFocus={updateDeviceSettings} />
    <SettingsSection title={translations.language}>
      <NavigatedSettingsItem
        label={language}
        navigateTo={SETTINGS_ROUTES.CHANGE_LANGUAGE}
      />
    </SettingsSection>

    <SettingsSection title={translations.security}>
      <NavigatedSettingsItem
        label={translations.changePin}
        navigateTo={SETTINGS_ROUTES.CHANGE_CUSTOM_PIN}
        disabled={isSystemAuthEnabled}
      />

      <SettingsItem
        label={translations.biometricsSignIn}
        disabled={!isBiometricEncryptionHardwareSupported}
      >
        <Switch
          value={isSystemAuthEnabled}
          onValueChange={onToggleBiometricsAuthIn}
          disabled={!isBiometricHardwareSupported}
        />
      </SettingsItem>
    </SettingsSection>

    <SettingsSection title={translations.crashReporting}>
      <SettingsItem label={translations.crashReportingText}>
        <Switch value={sendCrashReports} onValueChange={setCrashReporting} />
      </SettingsItem>
    </SettingsSection>

    <SettingsSection>
      <NavigatedSettingsItem
        label={translations.termsOfUse}
        navigateTo={SETTINGS_ROUTES.TERMS_OF_USE}
      />

      <NavigatedSettingsItem
        label={translations.support}
        navigateTo={SETTINGS_ROUTES.SUPPORT}
      />
    </SettingsSection>
  </ScrollView>
)

export default (compose(
  connect(
    (state) => ({
      translations: getTranslations(state),
      isBiometricHardwareSupported: biometricHwSupportSelector(state),
      sendCrashReports: sendCrashReportsSelector(state),
      isSystemAuthEnabled: isSystemAuthEnabledSelector(state),
      language: state.trans.global.currentLanguageName,
      installationId: installationIdSelector(state),
    }),
    {setAppSettingField, setSystemAuth},
  ),
  withNavigationTitle(({translations}) => translations.title),
  withNavigationTitle(
    ({translations}) => translations.tabTitle,
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
)(ApplicationSettingsScreen): ComponentType<{navigation: Navigation}>)
