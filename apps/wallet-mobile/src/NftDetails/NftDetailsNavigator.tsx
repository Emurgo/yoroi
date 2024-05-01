import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {useMetrics} from '../metrics/metricsManager'
import {defaultStackNavigationOptions, NftRoutes} from '../navigation'
import {NftDetails} from './NftDetails'
import {NftDetailsImage} from './NftDetailsImage'

const Stack = createStackNavigator<NftRoutes>()

export const NftDetailsNavigator = () => {
  const strings = useStrings()
  const {track} = useMetrics()
  const {atoms, color} = useTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        ...defaultStackNavigationOptions(atoms, color),
        headerTitleContainerStyle: {alignItems: 'center'},
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
              track.nftGalleryDetailsPageViewed()
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
