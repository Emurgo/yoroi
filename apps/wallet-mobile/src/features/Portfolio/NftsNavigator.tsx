import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import React from 'react'

import {useMetrics} from '../../kernel/metrics/metricsManager'
import {defaultStackNavigationOptions, NftRoutes} from '../../kernel/navigation'
import {NetworkTag} from '../Settings/ChangeNetwork/NetworkTag'
import {useStrings} from './common/hooks/useStrings'
import {MediaDetailsScreen} from './common/MediaDetailsScreen/MediaDetailsScreen'
import {ListMediaGalleryScreen} from './useCases/PortfolioTokensList/PortfolioWalletTokenList/ListMediaGalleryScreen/ListMediaGalleryScreen'
import {ZoomMediaImageScreen} from './useCases/PortfolioTokensList/PortfolioWalletTokenList/ListMediaGalleryScreen/ZoomMediaImageScreen'

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
    <Stack.Navigator
      screenOptions={{
        ...defaultStackNavigationOptions(atoms, color),
        headerTitle: ({children}) => <NetworkTag>{children}</NetworkTag>,
      }}
    >
      <Stack.Screen name="nft-gallery" getComponent={() => ListMediaGalleryScreen} />

      <Stack.Screen
        name="nft-details"
        options={{
          title: strings.titleMediaDetails,
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
