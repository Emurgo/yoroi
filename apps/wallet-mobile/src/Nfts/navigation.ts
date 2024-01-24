import {useNavigation} from '@react-navigation/native'

import {WalletStackRouteNavigation} from '../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<WalletStackRouteNavigation>()
  const nftDetails = (id: string) => navigation.navigate('nft-details-routes', {screen: 'nft-details', params: {id}})
  const nftZoom = (id: string) => navigation.navigate('nft-details-routes', {screen: 'image-zoom', params: {id}})

  return {
    nftDetails,
    nftZoom,
  }
}
