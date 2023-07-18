import {createStackNavigator} from '@react-navigation/stack'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {metrics} from '../metrics'
import {defaultStackNavigationOptionsV2, NftRoutes} from '../navigation'
import {NftDetails} from './NftDetails'
import {NftDetailsImage} from './NftDetailsImage'

const Stack = createStackNavigator<NftRoutes>()

export const NftDetailsNavigator = () => {
  const strings = useStrings()

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackNavigationOptionsV2,
        headerTitleContainerStyle: {alignItems: 'center'},
        cardStyle: {backgroundColor: '#fff'},
      }}
      initialRouteName="nft-details"
    >
      <Stack.Screen
        name="nft-details"
        options={{title: strings.title, headerTitleAlign: 'center'}}
        component={NftDetails}
        listeners={() => {
          return {
            focus: () => {
              metrics.nftGalleryDetailsPageViewed()
            },
          }
        }}
      />

      <Stack.Screen name="image-zoom" options={{headerTitle: () => null}} component={NftDetailsImage} />
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
