import {useNavigation} from '@react-navigation/native'
import {Portfolio} from '@yoroi/types'

import {WalletStackRouteNavigation} from '../navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<WalletStackRouteNavigation>()
  const nftDetails = (id: Portfolio.Token.Id) =>
    navigation.navigate('nft-details-routes', {screen: 'nft-details', params: {id}})
  const nftZoom = (id: Portfolio.Token.Id) =>
    navigation.navigate('nft-details-routes', {screen: 'image-zoom', params: {id}})

  return {
    nftDetails,
    nftZoom,
  }
}
