import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {InititalizationNavigation} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<InititalizationNavigation>()

  return useRef({
    analytics: () => navigation.navigate('analytics'),
    languagePick: () => navigation.navigate('language-pick'),
    enableLogingWithPin: () => navigation.navigate('enable-login-with-pin'),
    accepTos: () => navigation.navigate('accept-terms-of-service'),
  }).current
}
