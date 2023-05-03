import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'

import {defaultStackNavigationOptionsV2, NftRoutes} from '../navigation'
import {Nfts} from './Nfts'

const Stack = createStackNavigator<NftRoutes>()

export const NftsNavigator = () => {
  return (
    <Stack.Navigator screenOptions={defaultStackNavigationOptionsV2}>
      <Stack.Screen name="nft-gallery" component={Nfts} />
    </Stack.Navigator>
  )
}
