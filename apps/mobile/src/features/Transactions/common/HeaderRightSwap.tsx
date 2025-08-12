import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {TouchableOpacity} from 'react-native'

import {TxHistoryRouteNavigation} from '~/kernel/navigation/types'
import {Icon} from '~/ui/Icon'

export const HeaderRightSwap = React.memo(() => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const {palette: p} = useTheme()

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('swap-orders')}
      style={{paddingRight: 8}}
    >
      <Icon.TermsOfUse color={p.gray_max} size={24} />
    </TouchableOpacity>
  )
})
