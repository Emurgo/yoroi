import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import React from 'react'

import {defaultStackNavigationOptions, NftRoutes} from '../navigation'
import {Nfts} from './Nfts'

const Stack = createStackNavigator<NftRoutes>()

export const NftsNavigator = () => {
  const {atoms, color} = useTheme()
  return (
    <Stack.Navigator screenOptions={defaultStackNavigationOptions(atoms, color)}>
      <Stack.Screen name="nft-gallery" component={Nfts} />
    </Stack.Navigator>
  )
}
