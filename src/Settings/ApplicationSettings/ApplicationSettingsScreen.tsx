import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Platform, ScrollView, StyleSheet, Switch} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import {useDispatch, useSelector} from 'react-redux'

import {StatusBar} from '../../components'
import {setAppSettingField, setEasyConfirmation, setSystemAuth} from '../../legacy/actions'
import {APP_SETTINGS_KEYS} from '../../legacy/appSettings'
import {CONFIG, isNightly} from '../../legacy/config'
import {canBiometricEncryptionBeEnabled, isBiometricEncryptionHardwareSupported} from '../../legacy/deviceSettings'
import KeyStore from '../../legacy/KeyStore'
import {
  biometricHwSupportSelector,
  installationIdSelector,
  isSystemAuthEnabledSelector,
  sendCrashReportsSelector,
} from '../../legacy/selectors'
import {useWalletNavigation} from '../../navigation'
import {useSelectedWalletMeta, useSetSelectedWalletMeta} from '../../SelectedWallet'
import {walletManager} from '../../yoroi-wallets'
import {NavigatedSettingsItem, SettingsBuildItem, SettingsItem, SettingsSection} from '../SettingsItems'

const version = DeviceInfo.getVersion()

export const ApplicationSettingsScreen = () => {
  const strings = useStrings()
  const {navigation, navigateToSettings} = useWalletNavigation()
  const isBiometricHardwareSupported = useSelector(biometricHwSupportSelector)
  const sendCrashReports = useSelector(sendCrashReportsSelector)
  const isSystemAuthEnabled = useSelector(isSystemAuthEnabledSelector)
  const installationId = useSelector(installationIdSelector)
  const dispatch = useDispatch()
  const walletMeta = useSelectedWalletMeta()
  const setSelectedWalletMeta = useSetSelectedWalletMeta()

  const setCrashReporting = (value: boolean) => {
    dispatch(setAppSettingField(APP_SETTINGS_KEYS.SEND_CRASH_REPORTS, value))
  }

  const onToggleBiometricsAuthIn = async () => {
    if (!installationId) throw new Error('invalid state')

    if (isSystemAuthEnabled) {
      navigation.navigate('biometrics', {
        keyId: installationId,
        onSuccess: () =>
          navigation.navigate('app-root', {
            screen: 'settings',
            params: {
              screen: 'setup-custom-pin',
              params: {
                onSuccess: async () => {
                  await dispatch(setSystemAuth(false))
                  await walletManager.disableEasyConfirmation()
                  dispatch(setEasyConfirmation(false))
                  if (!walletMeta) throw new Error('No wallet meta')
                  setSelectedWalletMeta({
                    ...walletMeta,
                    isEasyConfirmationEnabled: false,
                  })
                  navigateToSettings()
                },
              },
            },
          }),
        onFail: (reason) => {
          if (reason === KeyStore.REJECTIONS.CANCELED) {
            navigateToSettings()
          } else {
            throw new Error(`Could not authenticate user: ${reason}`)
          }
        },
      })
    } else {
      navigation.navigate('app-root', {
        screen: 'settings',
        params: {
          screen: 'fingerprint-link',
        },
      })
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

      <SettingsSection title={strings.language}>
        <NavigatedSettingsItem label={strings.currentLanguage} navigateTo="change-language" />
      </SettingsSection>

      <SettingsSection title={strings.security}>
        <NavigatedSettingsItem
          label={strings.changePin}
          navigateTo="change-custom-pin"
          disabled={isSystemAuthEnabled}
        />

        <SettingsItem
          label={strings.biometricsSignIn}
          disabled={!isBiometricHardwareSupported || shouldNotEnableBiometricAuth}
        >
          <Switch
            value={isSystemAuthEnabled}
            onValueChange={onToggleBiometricsAuthIn}
            disabled={!isBiometricHardwareSupported || shouldNotEnableBiometricAuth}
          />
        </SettingsItem>
      </SettingsSection>

      <SettingsSection title={strings.crashReporting}>
        <SettingsItem label={strings.crashReportingText}>
          <Switch value={sendCrashReports} onValueChange={setCrashReporting} disabled={isNightly()} />
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
  }
}

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
