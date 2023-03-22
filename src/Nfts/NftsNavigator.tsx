import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'

import {NftRoutes} from '../navigation'
import {SearchProvider} from '../Search'
import {useSearchHeaderOptions} from '../Search/SearchHeader'
import {Nfts} from './Nfts'

const Stack = createStackNavigator<NftRoutes>()

export const NftsNavigator = () => {
  return (
    <SearchProvider>
      <Routes />
    </SearchProvider>
  )
}

const Routes = () => {
  const {searchHeaderOptions} = useSearchHeaderOptions()

  return (
    <Stack.Navigator>
      <Stack.Screen name="nft-gallery" component={Nfts} options={searchHeaderOptions} />
    </Stack.Navigator>
  )
}
