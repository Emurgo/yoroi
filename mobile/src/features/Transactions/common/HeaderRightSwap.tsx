import {atoms as a, useTheme} from '@yoroi/theme'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {TouchableOpacity} from 'react-native'

import {Icon} from '~/ui/Icon'

export const HeaderRightSwap = React.memo(() => {
  const navigation = useNavigation()
  const {palette: p} = useTheme()

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('manage-wallets', {
          screen: 'main-wallet-routes',
          params: {
            screen: 'history',
            params: {
              screen: 'swap',
              params: {
                screen: 'orders',
              },
            },
          },
        })
      }
      style={a.pr_sm}
    >
      <Icon.TermsOfUse color={p.gray_max} size={24} />
    </TouchableOpacity>
  )
})
