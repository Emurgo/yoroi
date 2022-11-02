/* eslint-disable @typescript-eslint/no-explicit-any */
import {useNavigation} from '@react-navigation/native'
import React, {useEffect, useState} from 'react'
import {Image, RefreshControl, ScrollView, StyleSheet, Text, View, ViewProps} from 'react-native'

import noNftsImage from '../assets/img/no-nft.png'
import {OfflineBanner, StatusBar} from '../components'
import {ImageGallery} from '../components/ImageGallery'
import nft1 from '../components/ImageGallery/fake-images/nft1.png'
import nft2 from '../components/ImageGallery/fake-images/nft2.png'
import nft3 from '../components/ImageGallery/fake-images/nft3.png'
import nft4 from '../components/ImageGallery/fake-images/nft4.png'
import nft5 from '../components/ImageGallery/fake-images/nft5.png'
import nft6 from '../components/ImageGallery/fake-images/nft6.png'
// import {useNfts} from '../hooks'
import {WalletStackRouteNavigation} from '../navigation'
// import {useSelectedWallet} from '../SelectedWallet'

export const mockNFTs = [
  {
    image: nft1,
    text: 'nft1',
  },
  {
    image: nft2,
    text: 'nft2',
  },
  {
    image: nft3,
    text: 'nft3',
  },
  {
    image: nft4,
    text: 'nft4',
  },
  {
    image: nft5,
    text: 'nft5',
  },
  {
    image: nft6,
    text: 'nft6',
  },
]

export const Nfts = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 3000)

    return () => {
      clearTimeout(timeout)
    }
  })
  // const wallet = useSelectedWallet()
  const navigation = useNavigation<WalletStackRouteNavigation>()

  // const nfts = useNfts(wallet)
  const showDetails = (id) =>
    navigation.navigate('nft-details-routes', {screen: 'nft-details', params: {id: id ?? '1'}})

  const NFTsWithAction = mockNFTs.map((n, i) => ({...n, onPress: () => showDetails(i)}))

  return (
    <View style={styles.root}>
      <StatusBar type="dark" />

      <View style={styles.container}>
        <OfflineBanner />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          refreshControl={<RefreshControl onRefresh={() => console.log('fetch state')} refreshing={false} />}
        >
          <Row>
            <Text style={styles.count}>NFT count: {NFTsWithAction.length}</Text>
          </Row>
          <Row>
            {NFTsWithAction.length > 0 ? (
              <ImageGallery images={NFTsWithAction} loading={loading} />
            ) : (
              <View style={styles.imageContainer}>
                <Image source={noNftsImage} style={styles.image} />
                <Text style={styles.contentText}>No NFTs added to your wallet yet</Text>
              </View>
            )}
          </Row>
        </ScrollView>
      </View>
    </View>
  )
}

const Row = ({style, ...props}: ViewProps) => <View {...props} style={[style, styles.row]} />

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flexDirection: 'column',
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  row: {
    flex: 1,
    paddingVertical: 12,
  },
  count: {
    flex: 1,
    textAlign: 'center',
    color: '#6B7384',
  },
  contentText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 20,
    color: '#000',
    marginTop: 20,
  },
  image: {
    flex: 1,
    alignSelf: 'center',
    width: 200,
    height: 228,
  },
  imageContainer: {
    flex: 1,
    marginTop: 75,
    textAlign: 'center',
  },
})
