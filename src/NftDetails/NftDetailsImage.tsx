import {useRoute} from '@react-navigation/native'
import React from 'react'
import {Image, StyleSheet, View} from 'react-native'

import {FadeIn, OfflineBanner, StatusBar} from '../components'
import {useNfts} from '../hooks'

type Params = {id: string}

export const NftDetailsImage = () => {
  const {nfts} = useNfts()

  const {id} = useRoute().params as Params
  const nft = nfts.find((nft) => nft.id === id)

  if (!nft) {
    return null
  }

  return (
    <FadeIn style={styles.container}>
      <StatusBar type="dark" />
      <OfflineBanner />
      <View style={styles.contentContainer}>
        <Image source={{uri: nft.image}} style={styles.image} resizeMode="contain" />
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
  image: {
    height: '75%',
    width: '100%',
  },
})
