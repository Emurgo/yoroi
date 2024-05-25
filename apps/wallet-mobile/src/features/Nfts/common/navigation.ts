import {useNavigation} from '@react-navigation/native'
import {Portfolio} from '@yoroi/types'

import {NftRouteNavigation} from '../../../kernel/navigation'

export const useNavigateTo = () => {
  const navigation = useNavigation<NftRouteNavigation>()
  const nftDetails = (id: Portfolio.Token.Id) => navigation.navigate('nft-details', {id})
  const nftZoom = (id: Portfolio.Token.Id) => navigation.navigate('nft-image-zoom', {id})

  return {
    nftDetails,
    nftZoom,
  }
}
