import React from 'react'
import {Dimensions, StyleSheet, View} from 'react-native'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ViewTransformer from 'react-native-easy-view-transformer'

import {FadeIn} from '../components'
import {NftPreview} from '../components/NftPreview'
import {useSelectedWallet} from '../features/WalletManager/Context/SelectedWalletContext'
import {useMetrics} from '../metrics/metricsManager'
import {NftRoutes, useParams} from '../navigation'
import {isEmptyString} from '../utils/utils'
import {useNft} from '../yoroi-wallets/hooks'

type Params = NftRoutes['nft-details']

const isParams = (params?: Params | object | undefined): params is Params => {
  return !!params && 'id' in params && !isEmptyString(params.id)
}

export const NftDetailsImage = () => {
  const {id} = useParams<Params>(isParams)
  const wallet = useSelectedWallet()
  const nft = useNft(wallet, {id})
  const {track} = useMetrics()

  React.useEffect(() => {
    if (!isEmptyString(nft?.id)) track.nftGalleryDetailsImageViewed()
  }, [nft?.id, track])

  const dimensions = Dimensions.get('window')

  return (
    <FadeIn style={styles.container}>
      <ViewTransformer maxScale={3} minScale={1}>
        <View style={styles.contentContainer}>
          <NftPreview nft={nft} width={dimensions.width} height={dimensions.height} zoom={1} contentFit="contain" />
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
