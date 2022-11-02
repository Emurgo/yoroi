/* eslint-disable @typescript-eslint/no-explicit-any */
import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'

import {NftRoutes} from '../navigation'
import {NftDetails} from './NftDetails'

const Stack = createStackNavigator<NftRoutes>()

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
    </Stack.Navigator>
  )
}
