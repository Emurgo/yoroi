// @flow

import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Platform, ScrollView, StyleSheet, Switch} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import {useDispatch, useSelector} from 'react-redux'

// $FlowExpectedError
import {useSelectedWalletMeta, useSetSelectedWalletMeta} from '../../../src/SelectedWallet'
import {setAppSettingField, setEasyConfirmation, setSystemAuth} from '../../actions'
import {CONFIG} from '../../config/config'
import KeyStore from '../../crypto/KeyStore'
import walletManager from '../../crypto/walletManager'
import {APP_SETTINGS_KEYS} from '../../helpers/appSettings'
import {canBiometricEncryptionBeEnabled, isBiometricEncryptionHardwareSupported} from '../../helpers/deviceSettings'
import {SETTINGS_ROUTES} from '../../RoutesList'
import {
  biometricHwSupportSelector,
  installationIdSelector,
  isSystemAuthEnabledSelector,
  sendCrashReportsSelector,
} from '../../selectors'
import {StatusBar} from '../UiKit'
import {NavigatedSettingsItem, SettingsBuildItem, SettingsItem, SettingsSection} from './SettingsItems'

const messages = defineMessages({
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

const version = DeviceInfo.getVersion()

const ApplicationSettingsScreen = () => {
  const intl = useIntl()
  const navigation = useNavigation()
  const isBiometricHardwareSupported = useSelector(biometricHwSupportSelector)
  const sendCrashReports = useSelector(sendCrashReportsSelector)
  const isSystemAuthEnabled = useSelector(isSystemAuthEnabledSelector)
  const installationId = useSelector(installationIdSelector)
  const dispatch = useDispatch()
  const walletMeta = useSelectedWalletMeta()
  const setSelectedWalletMeta = useSetSelectedWalletMeta()

  const setCrashReporting = (value: boolean) =>
    dispatch(setAppSettingField(APP_SETTINGS_KEYS.SEND_CRASH_REPORTS, value))

  const onToggleBiometricsAuthIn = async () => {
    if (isSystemAuthEnabled) {
      navigation.navigate(SETTINGS_ROUTES.BIO_AUTHENTICATE, {
        keyId: installationId,
        onSuccess: () =>
          navigation.navigate(SETTINGS_ROUTES.SETUP_CUSTOM_PIN, {
            onSuccess: async () => {
              await dispatch(setSystemAuth(false))
              await walletManager.disableEasyConfirmation()
              dispatch(setEasyConfirmation(false))
              setSelectedWalletMeta({
                ...walletMeta,
                isEasyConfirmationEnabled: false,
              })
              navigation.navigate(SETTINGS_ROUTES.MAIN)
            },
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

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const updateDeviceSettings = async () => {
        const isHardwareSupported = await isBiometricEncryptionHardwareSupported()
        const canEnableBiometricEncryption = await canBiometricEncryptionBeEnabled()
        await dispatch(setAppSettingField(APP_SETTINGS_KEYS.BIOMETRIC_HW_SUPPORT, isHardwareSupported))
        await dispatch(
          setAppSettingField(APP_SETTINGS_KEYS.CAN_ENABLE_BIOMETRIC_ENCRYPTION, canEnableBiometricEncryption),
        )
      }

      updateDeviceSettings()
    })
    return unsubscribe
  }, [navigation, dispatch])

  // it's better if we prevent users who:
  //   1. are not using biometric auth yet
  //   2. are on Android 10+
  // from enabling this feature since they can encounter issues (and may not be
  // able to access their wallets eventually, neither rollback this!)
  const shouldNotEnableBiometricAuth =
    Platform.OS === 'android' && CONFIG.ANDROID_BIO_AUTH_EXCLUDED_SDK.includes(Platform.Version) && !isSystemAuthEnabled

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
          disabled={!isBiometricHardwareSupported || shouldNotEnableBiometricAuth}
        >
          <Switch
            value={isSystemAuthEnabled}
            onValueChange={onToggleBiometricsAuthIn}
            disabled={!isBiometricHardwareSupported || shouldNotEnableBiometricAuth}
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

        <NavigatedSettingsItem label={intl.formatMessage(messages.support)} navigateTo={SETTINGS_ROUTES.SUPPORT} />
      </SettingsSection>

      <SettingsSection title="About">
        <SettingsBuildItem label={intl.formatMessage(messages.version)} value={version} />

        <SettingsBuildItem label={intl.formatMessage(messages.commit)} value={CONFIG.COMMIT} />
      </SettingsSection>
    </ScrollView>
  )
}
export default ApplicationSettingsScreen
