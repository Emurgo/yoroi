import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Icon, Spacer} from '../components'
import {useFilteredNfts} from '../hooks'
import {WalletStackRouteNavigation} from '../navigation'
import {ImageGallery, SkeletonGallery} from './ImageGallery'
import NoNftsScreen from './NoNftsScreen'

export const Nfts = () => {
  const navigation = useNavigation<WalletStackRouteNavigation>()
  const {search, filteredNfts, isLoading, refetch, isRefetching, isError} = useFilteredNfts()

  const navigateToDetails = (id: string) =>
    navigation.navigate('nft-details-routes', {screen: 'nft-details', params: {id}})
  const handleNftSelect = (index: number) => navigateToDetails(filteredNfts[index].id)

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
        <View style={styles.container}>
          <Spacer height={16} />
          {isError ? (
            <ErrorScreen onRefresh={refetch} isRefreshing={isRefetching} />
          ) : isLoading ? (
            <LoadingScreen nftsCount={filteredNfts.length} onRefresh={refetch} isRefreshing={isRefetching} />
          ) : search.length > 0 && filteredNfts.length === 0 ? (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewError}
              refreshControl={<RefreshControl onRefresh={refetch} refreshing={isRefetching} />}
            >
              <NoNftsScreen />
            </ScrollView>
          ) : search.length === 0 && filteredNfts.length === 0 ? (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewError}
              refreshControl={<RefreshControl onRefresh={refetch} refreshing={isRefetching} />}
            >
              <NoNftsScreen count={<NftCount count={filteredNfts.length} />} />
            </ScrollView>
          ) : (
            <View style={styles.galleryContainer}>
              {search.length === 0 && <NftCount count={filteredNfts.length} />}
              <ImageGallery
                nfts={filteredNfts}
                onSelect={handleNftSelect}
                onRefresh={refetch}
                isRefreshing={isRefetching}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  )
}

function ErrorScreen({onRefresh, isRefreshing}: {onRefresh: () => void; isRefreshing: boolean}) {
  const strings = useStrings()
  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewError}
      refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={isRefreshing} />}
    >
      <View>
        <View>
          <Text style={styles.count}>{strings.nftCount}: --</Text>
        </View>
        <View style={styles.errorContainer}>
          <Icon.NoNfts size={140} />
          <Spacer height={20} />
          <Text style={styles.titleText}>{strings.errorTitle}</Text>
          <Spacer height={4} />
          <Text>{strings.errorDescription}</Text>
          <Text>{strings.reloadApp}</Text>
        </View>
      </View>
    </ScrollView>
  )
}

function NftCount({count}: {count?: number}) {
  const strings = useStrings()
  return (
    <View>
      <View style={styles.countBar}>
        <Text style={styles.count}>
          {strings.nftCount}: {count}
        </Text>
      </View>
      <Spacer height={16} />
    </View>
  )
}

function LoadingScreen({nftsCount}: {nftsCount: number; onRefresh: () => void; isRefreshing: boolean}) {
  return (
    <View style={styles.galleryContainer}>
      <NftCount count={nftsCount} />
      <SkeletonGallery amount={6} />
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
    flexGrow: 1,
  },
  scrollViewError: {
    flexGrow: 1,
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },

  countBar: {
    height: 22,
  },
  count: {
    flex: 1,
    textAlign: 'center',
    color: '#6B7384',
  },

  titleText: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 20,
    color: '#000',
  },

  errorContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryContainer: {
    paddingHorizontal: 16,
    flex: 1,
    flexGrow: 1,
  },
})

const messages = defineMessages({
  nftCount: {
    id: 'nft.gallery.nftCount',
    defaultMessage: '!!!NFT count',
  },
  errorTitle: {
    id: 'nft.gallery.errorTitle',
    defaultMessage: '!!!Oops!',
  },
  errorDescription: {
    id: 'nft.gallery.errorDescription',
    defaultMessage: '!!!Something went wrong.',
  },
  reloadApp: {
    id: 'nft.gallery.reloadApp',
    defaultMessage: '!!!Try to reload this page or restart the app.',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    nftCount: intl.formatMessage(messages.nftCount),
    errorTitle: intl.formatMessage(messages.errorTitle),
    errorDescription: intl.formatMessage(messages.errorDescription),
    reloadApp: intl.formatMessage(messages.reloadApp),
  }
}
