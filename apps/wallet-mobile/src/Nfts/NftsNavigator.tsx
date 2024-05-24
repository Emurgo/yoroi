import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import {MediaDetails} from '../features/Portfolio/common/MediaDetails/MediaDetails'
import {useMetrics} from '../kernel/metrics/metricsManager'
import {defaultStackNavigationOptions, NftRoutes} from '../kernel/navigation'
import {NftDetailsImage} from './NftDetails/NftDetailsImage'
import {Nfts} from './Nfts'

const Stack = createStackNavigator<NftRoutes>()

export const NftsNavigator = () => {
  const {atoms, color} = useTheme()
  const strings = useStrings()
  const {track} = useMetrics()

  const trackDetails = React.useCallback(() => {
    return {
      focus: () => {
        track.nftGalleryDetailsPageViewed()
      },
    }
  }, [track])

  return (
    <Stack.Navigator screenOptions={defaultStackNavigationOptions(atoms, color)}>
      <Stack.Screen name="nft-gallery" component={Nfts} />

      <Stack.Screen
        name="nft-details"
        options={{
          title: strings.title,
          headerTitleAlign: 'center',
        }}
        listeners={trackDetails}
        component={MediaDetails}
      />

      <Stack.Screen name="nft-image-zoom" options={{headerTitle: () => null}} component={NftDetailsImage} />
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
