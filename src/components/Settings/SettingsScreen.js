// @flow
import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withState, withHandlers} from 'recompose'
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
  NavigateTo,
  ItemLink,
  ItemIcon,
  ItemToggle,
  SettingsItem,
  SettingsLink,
} from './SettingsItems'
import {
  fingerprintsHwSupportSelector,
  systemAuthSupportSelector,
} from '../../selectors'

import styles from './styles/SettingsScreen.style'
import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.SettingsScreen

type Props = {
  isFingerprintSignIn: boolean,
  onToggleFingerprintSignIn: () => void,
  isEasyConfirmation: boolean,
  onToggleEasyConfirmation: () => void,
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

const SettingsScreen = ({
  isFingerprintSignIn,
  onToggleFingerprintSignIn,
  isEasyConfirmation,
  onToggleEasyConfirmation,
  translations,
  updateDeviceSettings,
  isFingerprintsHardwareSupported,
  isSystemAuthEnabled,
}: Props) => (
  <Screen scroll>
    <NavigationEvents onWillFocus={updateDeviceSettings} />
    <View style={styles.root}>
      <View style={styles.tab}>
        <SettingsItem
          title={translations.walletName}
          description={'getWalletName()'}
        >
          <NavigateTo screen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}>
            <ItemLink label={translations.edit} />
          </NavigateTo>
        </SettingsItem>

        <SettingsItem
          title={translations.privacy}
          description={translations.changePin}
        >
          <NavigateTo screen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}>
            <ItemIcon />
          </NavigateTo>
        </SettingsItem>

        <SettingsItem description={translations.changePassword}>
          <NavigateTo screen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}>
            <ItemIcon />
          </NavigateTo>
        </SettingsItem>

        <SettingsItem description={translations.fingerprintSignIn}>
          <ItemToggle
            value={isSystemAuthEnabled}
            onToggle={onToggleFingerprintSignIn}
            disabled={!isFingerprintsHardwareSupported}
          />
        </SettingsItem>

        <SettingsItem description={translations.easyConfirmation}>
          <ItemToggle
            value={isEasyConfirmation}
            onToggle={onToggleEasyConfirmation}
          />
        </SettingsItem>

        <SettingsItem
          title={translations.downloadLogs}
          description={translations.downloadLogsText}
        >
          <NavigateTo screen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}>
            <ItemIcon />
          </NavigateTo>
        </SettingsItem>

        <SettingsLink
          label={translations.removeWallet}
          dstScreen={SETTINGS_ROUTES.SUPPORT}
        />
      </View>

      <View style={styles.tab}>
        <SettingsItem
          title={translations.language}
          description={'getLanguage()'}
        >
          <NavigateTo screen={SETTINGS_ROUTES.CHANGE_WALLET_NAME}>
            <ItemIcon />
          </NavigateTo>
        </SettingsItem>

        <SettingsLink
          label={translations.termsOfUse}
          dstScreen={SETTINGS_ROUTES.TERMS_OF_USE}
        />

        <SettingsLink
          label={translations.support}
          dstScreen={SETTINGS_ROUTES.SUPPORT}
        />
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
  withState('isEasyConfirmation', 'setEasyConfirmation', false),
  withHandlers({
    onToggleFingerprintSignIn,
    onToggleEasyConfirmation: ({
      isEasyConfirmation,
      setEasyConfirmation,
    }) => () => setEasyConfirmation(!isEasyConfirmation),
    updateDeviceSettings: ({updateFingerprintsIndicators}) => () =>
      updateDeviceSettings({updateFingerprintsIndicators}),
  }),
)(SettingsScreen)
