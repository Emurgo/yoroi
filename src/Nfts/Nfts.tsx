import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Icon, Spacer} from '../components'
import {useNfts} from '../hooks'
import {WalletStackRouteNavigation} from '../navigation'
import {useSelectedWallet} from '../SelectedWallet'
import {ImageGallery, SkeletonGallery} from './ImageGallery'
import NoNftsScreen from './NoNftsScreen'

type Props = {
  search?: string
}

export const Nfts = ({search}: Props) => {
  const searchTermLowerCase = (search ?? '').toLowerCase()
  const wallet = useSelectedWallet()
  const {nfts, isLoading, refetch, isRefetching, isError} = useNfts(wallet)
  const navigation = useNavigation<WalletStackRouteNavigation>()
  const filteredNfts =
    searchTermLowerCase.length > 0 && nfts.length > 0
      ? nfts.filter((n) => n.name.toLowerCase().includes(searchTermLowerCase))
      : nfts

  const navigateToDetails = (id: string) =>
    navigation.navigate('nft-details-routes', {screen: 'nft-details', params: {id}})
  const handleNftSelect = (index: number) => navigateToDetails(nfts[index].id)

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <View style={styles.container}>
        <Spacer height={16} />
        {isError ? (
          <ErrorScreen onRefresh={refetch} isRefreshing={isRefetching} />
        ) : isLoading ? (
          <LoadingScreen nftsCount={filteredNfts.length} onRefresh={refetch} isRefreshing={isRefetching} />
        ) : searchTermLowerCase.length > 0 && filteredNfts.length === 0 ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.galleryContainer}
            refreshControl={<RefreshControl onRefresh={refetch} refreshing={isRefetching} />}
          >
            <NoNftsScreen />
          </ScrollView>
        ) : searchTermLowerCase.length === 0 && filteredNfts.length === 0 ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.galleryContainer}
            refreshControl={<RefreshControl onRefresh={refetch} refreshing={isRefetching} />}
          >
            <NoNftsScreen heading={<NftCount count={filteredNfts.length} />} />
          </ScrollView>
        ) : (
          <View style={styles.galleryContainer}>
            {searchTermLowerCase.length === 0 && <NftCount count={filteredNfts.length} />}
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
  )
}

function ErrorScreen({onRefresh, isRefreshing}: {onRefresh: () => void; isRefreshing: boolean}) {
  const strings = useStrings()

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.galleryContainer}
      refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={isRefreshing} />}
    >
      <View style={styles.scrollViewError}>
        <NftCount count="-" />

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

function NftCount({count}: {count?: number | string}) {
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
  container: {
    flexDirection: 'column',
    flex: 1,
  },
  scrollView: {
    flex: 1,
    flexGrow: 1,
  },
  scrollViewError: {
    flex: 1,
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
