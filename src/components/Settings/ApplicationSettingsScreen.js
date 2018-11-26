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
  isFingerprintEncryptionHardwareSupported,
  canFingerprintEncryptionBeEnabled,
} from '../../helpers/deviceSettings'
import {
  SettingsItem,
  NavigatedSettingsItem,
  SettingsSection,
} from './SettingsItems'
import {
  fingerprintsHwSupportSelector,
  systemAuthSupportSelector,
} from '../../selectors'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.SettingsScreen

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#fff',
  },
})

type Props = {
  onToggleBiometricsAuthIn: () => void,
  translations: SubTranslation<typeof getTranslations>,
  updateDeviceSettings: () => void,
  setSystemAuth: () => void,
  isFingerprintsHardwareSupported: boolean,
  isSystemAuthEnabled: boolean,
  language: string,
}

const onToggleBiometricsAuthIn = ({
  isSystemAuthEnabled,
  navigation,
  setSystemAuth,
  translations,
}) => () => {
  if (isSystemAuthEnabled) {
    setSystemAuth(false).catch(() =>
      showErrorDialog((dialogs) => dialogs.disableEasyConfirmationFirst),
    )
  } else {
    navigation.navigate(SETTINGS_ROUTES.FINGERPRINT_LINK)
  }
}

const updateDeviceSettings = async ({setAppSettingField}) => {
  // prettier-ignore
  const isHardwareSupported =
    await isFingerprintEncryptionHardwareSupported()
  // prettier-ignore
  const hasEnrolledFingerprints =
    await canFingerprintEncryptionBeEnabled()

  setAppSettingField(
    APP_SETTINGS_KEYS.FINGERPRINT_HW_SUPPORT,
    isHardwareSupported,
  )
  setAppSettingField(
    APP_SETTINGS_KEYS.HAS_FINGERPRINTS_ENROLLED,
    hasEnrolledFingerprints,
  )
}

const ApplicationSettingsScreen = ({
  onToggleBiometricsAuthIn,
  translations,
  updateDeviceSettings,
  isFingerprintsHardwareSupported,
  isSystemAuthEnabled,
  language,
}: Props) => (
  <ScrollView style={styles.scrollView}>
    <NavigationEvents onWillFocus={updateDeviceSettings} />
    <SettingsSection title={translations.language}>
      <NavigatedSettingsItem
        label={language}
        navigateTo={SETTINGS_ROUTES.CHANGE_LANGUAGE}
      />
    </SettingsSection>

    <SettingsSection title={translations.privacy}>
      <NavigatedSettingsItem
        label={translations.changePin}
        navigateTo={SETTINGS_ROUTES.CHANGE_CUSTOM_PIN}
        disabled={isSystemAuthEnabled}
      />

      <SettingsItem label={translations.biometricsSignIn}>
        <Switch
          value={isSystemAuthEnabled}
          onValueChange={onToggleBiometricsAuthIn}
          disabled={!isFingerprintsHardwareSupported}
        />
      </SettingsItem>
    </SettingsSection>

    <SettingsSection title={translations.downloadLogs}>
      <NavigatedSettingsItem
        label={translations.downloadLogsText}
        navigateTo={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
      />
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

export default compose(
  connect(
    (state) => ({
      translations: getTranslations(state),
      isFingerprintsHardwareSupported: fingerprintsHwSupportSelector(state),
      isSystemAuthEnabled: systemAuthSupportSelector(state),
      language: state.trans.global.currentLanguageName,
    }),
    {setAppSettingField, setSystemAuth},
  ),
  withNavigationTitle(({translations}) => translations.title),
  withHandlers({
    onToggleBiometricsAuthIn,
    updateDeviceSettings: ({setAppSettingField}) => () =>
      updateDeviceSettings({setAppSettingField}),
  }),
)(ApplicationSettingsScreen)
