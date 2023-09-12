import {useNavigation} from '@react-navigation/native'

import {SettingsRouteNavigation, useWalletNavigation} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<SettingsRouteNavigation>()
  const walletNavigation = useWalletNavigation()

  return {
    enableLoginWithPin: () => walletNavigation.navigation.navigate('enable-login-with-pin'),
    enableLoginWithOs: () =>
      walletNavigation.navigation.navigate('app-root', {
        screen: 'settings',
        params: {
          screen: 'enable-login-with-os',
        },
      }),
    changeLanguage: () => navigation.navigate('change-language'),
    changeCurrency: () => navigation.navigate('change-currency'),
    about: () => navigation.navigate('about'),
    termsOfUse: () => navigation.navigate('terms-of-use'),
    privacyPolicy: () => navigation.navigate('privacy-policy'),
    analytics: () => walletNavigation.navigateToAnalyticsSettings(),
    changeCustomPin: () => navigation.navigate('change-custom-pin'),
    enableEasyConfirmation: () => navigation.navigate('enable-easy-confirmation'),
    disableEasyConfirmation: () => navigation.navigate('disable-easy-confirmation'),
  }
}
