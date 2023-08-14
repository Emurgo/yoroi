import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {InititalizationNavigation} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<InititalizationNavigation>()

  return useRef({
    analytics: () => navigation.navigate('analytics'),
    languagePick: () => navigation.navigate('language-pick'),
    enableLogingWithPin: () => navigation.navigate('enable-login-with-pin'),
    readTermsOfService: () => navigation.navigate('read-terms-of-service'),
    readPrivacyPolicy: () => navigation.navigate('read-privacy-policy'),
    termsOfServiceChanged: () => navigation.navigate('terms-of-service-changed'),
    analyticsChanged: () => navigation.navigate('analytics-changed'),
  }).current
}
