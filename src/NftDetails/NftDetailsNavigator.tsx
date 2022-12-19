import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'

import {NftDetailsRoutes} from '../navigation'
import {NftDetails} from './NftDetails'
import {NftDetailsImage} from './NftDetailsImage'

const Stack = createStackNavigator<NftDetailsRoutes>()

export const NftDetailsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleContainerStyle: {width: '100%', alignItems: 'center'},
        cardStyle: {backgroundColor: '#fff'},
      }}
      initialRouteName="nft-details"
    >
      <Stack.Screen name="nft-details" component={NftDetails} />
      <Stack.Screen name="nft-details-image" component={NftDetailsImage} />
    </Stack.Navigator>
  )
}
