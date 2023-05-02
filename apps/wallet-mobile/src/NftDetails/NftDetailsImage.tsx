import {RouteProp, useRoute} from '@react-navigation/native'
import React from 'react'
import {Dimensions, StyleSheet, View} from 'react-native'
import ViewTransformer from 'react-native-easy-view-transformer'

import {FadeIn} from '../components'
import {NftPreview} from '../components/NftPreview'
import {NftRoutes} from '../navigation'
import {useSelectedWallet} from '../SelectedWallet'
import {useNft} from '../yoroi-wallets/hooks'

export const NftDetailsImage = () => {
  const {id} = useRoute<RouteProp<NftRoutes, 'nft-details'>>().params
  const wallet = useSelectedWallet()
  const nft = useNft(wallet, {id})

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
