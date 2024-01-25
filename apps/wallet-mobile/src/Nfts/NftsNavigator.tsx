import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'

import {defaultStackNavigationOptions, NftRoutes} from '../navigation'
import {Nfts} from './Nfts'

const Stack = createStackNavigator<NftRoutes>()

export const NftsNavigator = () => {
  return (
    <Stack.Navigator screenOptions={defaultStackNavigationOptions}>
      <Stack.Screen name="nft-gallery" component={Nfts} options={{headerTitle: 'Web View Demo'}} />
    </Stack.Navigator>
  )
}
