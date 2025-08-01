import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import React from 'react'

import {NetworkTag} from '~/features/Settings/useCases/changeAppSettings/ChangeNetwork/NetworkTag'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {
  defaultStackNavigationOptions,
  NftRoutes,
} from '~/kernel/navigation/navigation'
import {ListMediaGalleryScreen} from './screens/PortfolioTokensList/PortfolioWalletTokenList/ListMediaGalleryScreen/ListMediaGalleryScreen'
import {ZoomMediaImageScreen} from './screens/PortfolioTokensList/PortfolioWalletTokenList/ListMediaGalleryScreen/ZoomMediaImageScreen'
import {MediaDetailsScreen} from './ui/MediaDetailsScreen/MediaDetailsScreen'

const Stack = createStackNavigator<NftRoutes>()

export const NftsNavigator = () => {
  const {atoms, palette: p} = useTheme()
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
    <Stack.Navigator
      screenOptions={{
        ...defaultStackNavigationOptions(atoms, p),
        headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
      }}
    >
      <Stack.Screen
        name="nft-gallery"
        getComponent={() => ListMediaGalleryScreen}
      />

      <Stack.Screen
        name="nft-details"
        options={{
          title: strings.portfolio.titleMediaDetails,
          headerTitleAlign: 'center',
        }}
        listeners={trackDetails}
        getComponent={() => MediaDetailsScreen}
      />

      <Stack.Screen
        name="nft-image-zoom"
        options={{headerTitle: () => null}}
        getComponent={() => ZoomMediaImageScreen}
      />
    </Stack.Navigator>
  )
}
