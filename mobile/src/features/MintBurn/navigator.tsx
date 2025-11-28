import {useTheme} from '@yoroi/theme'

import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs'
import * as React from 'react'

import {useStrings} from '~/kernel/i18n/useStrings'
import {defaultMaterialTopTabNavigationOptions} from '~/kernel/navigation/common/helpers'

import {MintTabScreen} from './ui/screens/MintTabScreen'
import {MyTokensTabScreen} from './ui/screens/MyTokensTabScreen'

const Tab = createMaterialTopTabNavigator()

export const MintBurnNavigator = () => {
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()

  const screenOptions = React.useCallback(
    ({route}: {route: {name: string}}) => ({
      ...defaultMaterialTopTabNavigationOptions(p),
      tabBarLabel:
        route.name === 'mint'
          ? strings.mintBurn.tabs.mint
          : strings.mintBurn.tabs.myTokens,
    }),
    [p, strings.mintBurn.tabs.mint, strings.mintBurn.tabs.myTokens],
  )

  return (
    <Tab.Navigator style={ta.bg_color_max} screenOptions={screenOptions}>
      <Tab.Screen name="mint" getComponent={() => MintTabScreen} />

      <Tab.Screen name="my-tokens" getComponent={() => MyTokensTabScreen} />
    </Tab.Navigator>
  )
}
