// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'
import {View} from 'react-native'
import {NavigationEvents} from 'react-navigation'

import Screen from '../../components/Screen'
import {SETTINGS_ROUTES} from '../../RoutesList'
import {withNavigationTitle} from '../../utils/renderUtils'
import {updateFingerprintsIndicators, setSystemAuth} from '../../actions'
import {
  isFingerprintEncryptionHardwareSupported,
  canFingerprintEncryptionBeEnabled,
} from '../../helpers/deviceSettings'
import {
  ItemToggle,
  SettingsItem,
  NavigatedSettingsItem,
  SettingsSection,
} from './SettingsItems'
import {
  fingerprintsHwSupportSelector,
  systemAuthSupportSelector,
} from '../../selectors'

import styles from './styles/SettingsScreen.style'
import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.SettingsScreen

type Props = {
  onToggleFingerprintSignIn: () => void,
  translations: SubTranslation<typeof getTranslations>,
  updateDeviceSettings: () => void,
  setSystemAuth: () => void,
  isFingerprintsHardwareSupported: boolean,
  isSystemAuthEnabled: boolean,
}

const onToggleFingerprintSignIn = ({
  isSystemAuthEnabled,
  navigation,
  setSystemAuth,
}) => () => {
  if (isSystemAuthEnabled) {
    setSystemAuth(false)
  } else {
    navigation.navigate(SETTINGS_ROUTES.FINGERPRINT_LINK)
  }
}

const updateDeviceSettings = async ({updateFingerprintsIndicators}) => {
  // prettier-ignore
  const isHardwareSupported =
    await isFingerprintEncryptionHardwareSupported()
  // prettier-ignore
  const hasEnrolledFingerprints =
    await canFingerprintEncryptionBeEnabled()

  updateFingerprintsIndicators(
    'isFingerprintsHardwareSupported',
    isHardwareSupported,
  )
  updateFingerprintsIndicators(
    'hasEnrolledFingerprints',
    hasEnrolledFingerprints,
  )
}

const ApplicationSettingsScreen = ({
  onToggleFingerprintSignIn,
  translations,
  updateDeviceSettings,
  isFingerprintsHardwareSupported,
  isSystemAuthEnabled,
}: Props) => (
  <Screen scroll>
    <NavigationEvents onWillFocus={updateDeviceSettings} />
    <View style={styles.root}>
      <View style={styles.tab}>
        <SettingsSection title={translations.language}>
          <NavigatedSettingsItem
            label={'getLanguage()'}
            navigateTo={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
          />
        </SettingsSection>

        <SettingsSection title={translations.privacy}>
          <NavigatedSettingsItem
            label={translations.changePin}
            navigateTo={SETTINGS_ROUTES.CHANGE_WALLET_NAME}
          />

          <SettingsItem description={translations.fingerprintSignIn}>
            <ItemToggle
              value={isSystemAuthEnabled}
              onToggle={onToggleFingerprintSignIn}
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
      </View>
    </View>
  </Screen>
)

export default compose(
  connect(
    (state) => ({
      translations: getTranslations(state),
      isFingerprintsHardwareSupported: fingerprintsHwSupportSelector(state),
      isSystemAuthEnabled: systemAuthSupportSelector(state),
    }),
    {updateFingerprintsIndicators, setSystemAuth},
  ),
  withNavigationTitle(({translations}) => translations.title),
  withHandlers({
    onToggleFingerprintSignIn,
    updateDeviceSettings: ({updateFingerprintsIndicators}) => () =>
      updateDeviceSettings({updateFingerprintsIndicators}),
  }),
)(ApplicationSettingsScreen)
