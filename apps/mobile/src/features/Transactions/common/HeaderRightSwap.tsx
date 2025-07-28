import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {TouchableOpacity} from 'react-native'

import {Icon} from '~/ui/Icon'
import {TxHistoryRouteNavigation} from '~/kernel/navigation'

export const HeaderRightSwap = React.memo(() => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const {color} = useTheme()

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('swap-orders')}
      style={{paddingRight: 8}}
    >
      <Icon.TermsOfUse color={color.gray_max} size={24} />
    </TouchableOpacity>
  )
})
