import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {Dimensions, StyleSheet, View} from 'react-native'
import ViewTransformer from 'react-native-easy-view-transformer'
import {useSelectedWallet} from 'src/SelectedWallet'

import {FadeIn} from '../components'
import {NftPreview} from '../components/NftPreview'
import {useMetrics} from '../metrics/metricsManager'
import {NftRoutes, useParams} from '../navigation'
import {isEmptyString} from '../utils/utils'

type Params = NftRoutes['nft-details']

const isParams = (params?: Params | object | undefined): params is Params => {
  return !!params && 'id' in params && !isEmptyString(params.id)
}

export const NftDetailsImage = () => {
  const navigation = useNavigation()
  const {id} = useParams<Params>(isParams)
  const {track} = useMetrics()
  const wallet = useSelectedWallet()
  // TODO: everything that access the balances by index
  // means that the data can go away while the user is on screen 
  const nft = wallet.balances[id] // TODO: create a fallback -> WoW is gone.

  React.useEffect(() => {
    if (!isEmptyString(nft?.id)) track.nftGalleryDetailsImageViewed()
  }, [nft?.id, track])

  // TODO: remove after the fallback, for now navigating back
  if (nft == null) {
    navigation.goBack()
    return null
  }

  const dimensions = Dimensions.get('window')
  const imageSize = Math.min(dimensions.width, dimensions.height)

  return (
    <FadeIn style={styles.container}>
      <ViewTransformer maxScale={3} minScale={1}>
        <View style={styles.contentContainer}>
          <NftPreview nft={nft} width={imageSize} height={imageSize} />
        </View>
      </ViewTransformer>
    </FadeIn>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
