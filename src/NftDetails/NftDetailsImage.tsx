import {useNavigation, useRoute} from '@react-navigation/native'
import React, {useEffect} from 'react'
import {Dimensions, Image, StyleSheet, View} from 'react-native'
import ViewTransformer from 'react-native-easy-view-transformer'

import {FadeIn, OfflineBanner, StatusBar} from '../components'
import {useNfts} from '../hooks'
import {useSelectedWallet} from '../SelectedWallet'

type Params = {id: string}

export const NftDetailsImage = () => {
  const wallet = useSelectedWallet()
  const {nfts} = useNfts(wallet)
  const navigation = useNavigation()

  const {id} = useRoute().params as Params
  const nft = nfts.find((nft) => nft.id === id)

  useEffect(() => {
    navigation.setOptions({title: ''})
  }, [navigation])

  if (!nft) {
    return null
  }
  const dimensions = Dimensions.get('window')
  const imageSize = Math.min(dimensions.width, dimensions.height)

  return (
    <FadeIn style={styles.container}>
      <StatusBar type="dark" />
      <OfflineBanner />
      <View style={styles.contentContainer}>
        <ViewTransformer maxScale={3} minScale={1}>
          <Image source={{uri: nft.image}} style={{height: imageSize, width: imageSize}} resizeMode="contain" />
        </ViewTransformer>
      </View>
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
    paddingTop: '12.5%',
  },
})
