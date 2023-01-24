import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {NftDetailsRoutes} from '../navigation'
import {NftDetails} from './NftDetails'
import {NftDetailsImage} from './NftDetailsImage'

const Stack = createStackNavigator<NftDetailsRoutes>()

export const NftDetailsNavigator = () => {
  const strings = useStrings()
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleContainerStyle: {alignItems: 'center'},
        cardStyle: {backgroundColor: '#fff'},
      }}
      initialRouteName="nft-details"
    >
      <Stack.Screen
        name="nft-details"
        options={{title: strings.title, headerTitleAlign: 'center'}}
        component={NftDetails}
      />
      <Stack.Screen name="nft-details-image" options={{header: () => null}} component={NftDetailsImage} />
    </Stack.Navigator>
  )
}

const messages = defineMessages({
  title: {
    id: 'nft.detail.title',
    defaultMessage: '!!!NFT Details',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
  }
}
