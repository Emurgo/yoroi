import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {Image, RefreshControl, ScrollView, StyleSheet, Text, View, ViewProps} from 'react-native'

import noNftsImage from '../assets/img/no-nft.png'
import {OfflineBanner, StatusBar} from '../components'
import {useNfts} from '../hooks'
import {WalletStackRouteNavigation} from '../navigation'
import {ImageGallery, SkeletonGallery} from './ImageGallery'

export const Nfts = () => {
  const {nfts, isLoading, refetch, isRefetching} = useNfts()
  const navigation = useNavigation<WalletStackRouteNavigation>()

  const showDetails = (id: string) => navigation.navigate('nft-details-routes', {screen: 'nft-details', params: {id}})
  const handleNFTPress = (index: number) => showDetails(nfts[index].id)
  return (
    <View style={styles.root}>
      <StatusBar type="dark" />

      <View style={styles.container}>
        <OfflineBanner />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          refreshControl={<RefreshControl onRefresh={refetch} refreshing={isRefetching} />}
        >
          <Row>
            <Text style={styles.count}>NFT count: {nfts.length}</Text>
          </Row>
          <Row>
            {isLoading && <SkeletonGallery amount={3} />}
            {!isLoading && nfts.length > 0 && <ImageGallery nfts={nfts} onNftPress={handleNFTPress} />}
            {!isLoading && nfts.length === 0 && (
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
