import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {Image, RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import noNftsImage from '../assets/img/no-nft.png'
import {Icon, OfflineBanner, Spacer, StatusBar} from '../components'
import {useNfts} from '../hooks'
import {WalletStackRouteNavigation} from '../navigation'
import {useSelectedWallet} from '../SelectedWallet'
import {ImageGallery, SkeletonGallery} from './ImageGallery'

type Props = {
  search?: string
}

export const Nfts = ({search}: Props) => {
  const wallet = useSelectedWallet()
  const {nfts, isLoading, refetch, isRefetching, isError} = useNfts(wallet, {search})
  const navigation = useNavigation<WalletStackRouteNavigation>()

  const showDetails = (id: string) => navigation.navigate('nft-details-routes', {screen: 'nft-details', params: {id}})
  const handleNFTSelect = (index: number) => showDetails(nfts[index].id)

  return (
    <View style={styles.root}>
      <StatusBar type="dark" />
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
        <View style={styles.container}>
          <OfflineBanner />
          <Spacer height={16} />
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={isError ? styles.scrollViewError : styles.contentContainer}
            refreshControl={<RefreshControl onRefresh={refetch} refreshing={isRefetching} />}
          >
            {isError ? (
              <>
                <View>
                  <Text style={styles.count}>NFT count: --</Text>
                </View>
                <View style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Icon.NoNFTs size={140} />
                  <Spacer height={20} />
                  <Text style={styles.titleText}>Oops!</Text>
                  <Spacer height={4} />
                  <Text>Something went wrong.</Text>
                  <Text>Try to reload this page or restart the app.</Text>
                </View>
              </>
            ) : (
              <>
                {search?.length === 0 && (
                  <>
                    <View>
                      <Text style={styles.count}>NFT count: {nfts.length}</Text>
                    </View>
                    <Spacer height={16} />
                  </>
                )}
                <View>
                  {isLoading ? (
                    <SkeletonGallery amount={6} />
                  ) : nfts.length > 0 ? (
                    <ImageGallery nfts={nfts} onSelect={handleNFTSelect} />
                  ) : (
                    <>
                      <Spacer height={75} />
                      <View style={styles.imageContainer}>
                        <Image source={noNftsImage} style={styles.image} />
                        <Spacer height={20} />
                        <Text style={styles.contentText}>No NFTs found</Text>
                      </View>
                    </>
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: 'white',
  },
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
  scrollViewError: {
    flexGrow: 1,
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  count: {
    flex: 1,
    textAlign: 'center',
    color: '#6B7384',
    height: 22,
  },
  contentText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 20,
    color: '#000',
  },
  titleText: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 20,
    color: '#000',
  },
  image: {
    flex: 1,
    alignSelf: 'center',
    width: 200,
    height: 228,
  },
  imageContainer: {
    flex: 1,
    textAlign: 'center',
  },
})
