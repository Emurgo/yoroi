import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import React from 'react'

import {defaultStackNavigationOptions, NftRoutes} from '../navigation'
import {Nfts} from './Nfts'

const Stack = createStackNavigator<NftRoutes>()

export const NftsNavigator = () => {
  const {theme} = useTheme()
  return (
    <Stack.Navigator screenOptions={defaultStackNavigationOptions(theme)}>
      <Stack.Screen name="nft-gallery" component={Nfts} />
    </Stack.Navigator>
  )
}
