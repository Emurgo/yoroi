import React, {useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Platform, ScrollView, StyleSheet, Switch} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {Icon, Spacer, StatusBar} from '../../components'
import {useLanguage} from '../../i18n'
import {setAppSettingField} from '../../legacy/actions'
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
import {useTheme} from '../../theme'
import {useCurrencyContext} from '../Currency'
import {NavigatedSettingsItem, SettingsItem, SettingsSection} from '../SettingsItems'

export const ApplicationSettingsScreen = () => {
  const strings = useStrings()
  const {navigation, navigateToSettings} = useWalletNavigation()
  const isBiometricHardwareSupported = useSelector(biometricHwSupportSelector)
  const sendCrashReports = useSelector(sendCrashReportsSelector)
  const isSystemAuthEnabled = useSelector(isSystemAuthEnabledSelector)
  const installationId = useSelector(installationIdSelector)
  const dispatch = useDispatch()
  const {currency} = useCurrencyContext()
  const {
    theme: {color},
  } = useTheme()
  const language = useLanguage()

  const [isBalanceHidden, setIsBalanceHidden] = useState(false) // TODO: temporary functionality before adding the real feature

  const iconProps = {
    color: color.gray['600'],
    size: 23,
  }

  const {languageCode, supportedLanguages} = language
  const languageSelectedLabel = supportedLanguages.find((element) => element.code === languageCode)?.label

  const setCrashReporting = (value: boolean) => {
    dispatch(setAppSettingField(APP_SETTINGS_KEYS.SEND_CRASH_REPORTS, value))
  }

  const onToggleBiometricsAuthIn = async () => {
    if (!installationId) throw new Error('invalid state')

    if (isSystemAuthEnabled) {
      navigation.navigate('biometrics', {
        keyId: installationId,
        onSuccess: () => navigation.navigate('setup-custom-pin'),
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
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.settings}>
      <ScrollView bounces={false}>
        <StatusBar type="dark" />
        <SettingsSection title={strings.general}>
          <NavigatedSettingsItem
            icon={<Icon.Globe {...iconProps} />}
            label={strings.selectLanguage}
            navigateTo="change-language"
            selected={languageSelectedLabel}
          />

          <NavigatedSettingsItem
            icon={<Icon.Coins {...iconProps} />}
            label={strings.selectFiatCurrency}
            selected={currency}
            navigateTo="change-currency"
          />

          <NavigatedSettingsItem
            icon={<Icon.Info {...iconProps} />}
            label={strings.about}
            navigateTo="about" /* TODO: https://emurgo.atlassian.net/browse/YOMO-181 */
          />

          <NavigatedSettingsItem
            icon={<Icon.TermsOfUse {...iconProps} />}
            label={strings.termsOfUse}
            navigateTo="terms-of-use"
          />
        </SettingsSection>

        <Spacer height={24} />

        <SettingsSection title={strings.securityReporting}>
          <NavigatedSettingsItem
            icon={<Icon.Pin {...iconProps} />}
            label={strings.changePin}
            navigateTo="change-custom-pin"
          />

          <SettingsItem icon={<Icon.EyeOff {...iconProps} />} label={strings.balance} info={strings.balanceInfo}>
            <Switch
              value={isBalanceHidden}
              onValueChange={() => {
                /* TODO: add the real action to enable/disable balance hiding */
                setIsBalanceHidden(!isBalanceHidden)
                console.log('balance hiding switch click!')
              }}
            />
          </SettingsItem>

          <SettingsItem
            icon={<Icon.Bio {...iconProps} />}
            label={strings.biometricsSignIn}
            info={strings.biometricsSignInInfo}
            disabled={!isBiometricHardwareSupported || shouldNotEnableBiometricAuth}
          >
            <Switch
              value={isSystemAuthEnabled}
              onValueChange={onToggleBiometricsAuthIn}
              disabled={!isBiometricHardwareSupported || shouldNotEnableBiometricAuth}
            />
          </SettingsItem>

          <SettingsItem
            icon={<Icon.Export {...iconProps} />}
            label={strings.crashReporting}
            info={strings.crashReportingInfo}
          >
            <Switch value={sendCrashReports} onValueChange={setCrashReporting} disabled={isNightly()} />
          </SettingsItem>
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  )
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
    balance: intl.formatMessage(messages.balance),
    balanceInfo: intl.formatMessage(messages.balanceInfo),
    biometricsSignIn: intl.formatMessage(messages.biometricsSignIn),
    biometricsSignInInfo: intl.formatMessage(messages.biometricsSignInInfo),
    termsOfUse: intl.formatMessage(messages.termsOfUse),
    crashReporting: intl.formatMessage(messages.crashReporting),
    crashReportingInfo: intl.formatMessage(messages.crashReportingInfo),
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
  termsOfUse: {
    id: 'components.settings.applicationsettingsscreen.termsOfUse',
    defaultMessage: '!!!Terms of Use',
  },
  changePin: {
    id: 'components.settings.applicationsettingsscreen.changePin',
    defaultMessage: '!!!Change PIN',
  },
  balance: {
    id: 'components.settings.applicationsettingsscreen.balance',
    defaultMessage: '!!!Hide balance',
  },
  balanceInfo: {
    id: 'components.settings.applicationsettingsscreen.balanceInfo',
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
})

const styles = StyleSheet.create({
  settings: {
    flex: 1,
    paddingTop: 16,
    backgroundColor: '#fff',
  },
})
