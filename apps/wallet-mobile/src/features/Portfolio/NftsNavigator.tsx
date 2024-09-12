import {createStackNavigator} from '@react-navigation/stack'
import {useTheme} from '@yoroi/theme'
import React from 'react'

import {useMetrics} from '../../kernel/metrics/metricsManager'
import {defaultStackNavigationOptions, NftRoutes} from '../../kernel/navigation'
import {NetworkTag} from '../Settings/ChangeNetwork/NetworkTag'
import {useStrings} from './common/hooks/useStrings'
import {MediaDetails} from './common/MediaDetails/MediaDetails'
import {ListMediaGalleryScreen} from './useCases/PortfolioTokensList/PortfolioWalletTokenList/ListMediaGalleryScreen/ListMediaGalleryScreen'
import {ZoomMediaImage} from './useCases/PortfolioTokensList/PortfolioWalletTokenList/ListMediaGalleryScreen/ZoomMediaImage'

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
      <Stack.Screen name="nft-gallery" component={ListMediaGalleryScreen} />

      <Stack.Screen
        name="nft-details"
        options={{
          title: strings.titleMediaDetails,
          headerTitleAlign: 'center',
        }}
        listeners={trackDetails}
        component={MediaDetails}
      />

      <Stack.Screen name="nft-image-zoom" options={{headerTitle: () => null}} component={ZoomMediaImage} />
    </Stack.Navigator>
  )
}
