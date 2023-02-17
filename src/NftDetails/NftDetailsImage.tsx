import {RouteProp, useRoute} from '@react-navigation/native'
import React from 'react'
import {Dimensions, Image, StyleSheet, View} from 'react-native'
import ViewTransformer from 'react-native-easy-view-transformer'

import {FadeIn} from '../components'
import {useNft} from '../hooks'
import {NftRoutes} from '../navigation'
import {useSelectedWallet} from '../SelectedWallet'

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
          <Image source={{uri: nft.image}} style={{height: imageSize, width: imageSize}} resizeMode="contain" />
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
