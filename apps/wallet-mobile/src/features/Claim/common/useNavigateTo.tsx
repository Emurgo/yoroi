import {useNavigation} from '@react-navigation/native'
import {useRef} from 'react'

import {TxHistoryRouteNavigation} from '../../../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()

  return useRef({
    showSuccess: () => navigation.navigate('claim-show-success'),

    back: () => navigation.goBack(),
  } as const).current
}
