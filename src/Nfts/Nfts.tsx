import React, {ReactNode} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Icon, Spacer} from '../components'
import {useSearch} from '../Search/SearchContext'
import {useSelectedWallet} from '../SelectedWallet'
import {useNfts} from '../yoroi-wallets'
import {filterNfts} from './filterNfts'
import {ImageGallery, SkeletonGallery} from './ImageGallery'
import {useNavigateTo} from './navigation'
import {NoNftsScreen} from './NoNftsScreen'

export const Nfts = () => {
  const navigateTo = useNavigateTo()
  const [isManualRefreshing, setIsManualRefreshing] = React.useState(false)
  const wallet = useSelectedWallet()
  const strings = useStrings()

  const {isLoading, nfts, refetch, isError} = useNfts(wallet, {
    onSettled: () => {
      if (isManualRefreshing) setIsManualRefreshing(false)
    },
  })

  const {search: nftsSearchTerm} = useSearch()
  const nftsSearchResult = filterNfts(nftsSearchTerm, nfts).sort((nftA, nftB) => nftA.name.localeCompare(nftB.name))

  const handleNftSelect = (index: number) => navigateTo.nftDetails(nftsSearchResult[index].id)

  const onRefresh = React.useCallback(() => {
    setIsManualRefreshing(true)
    refetch()
  }, [refetch])

  if (isError) {
    return (
      <ScreenWrapper>
        <ErrorScreen onRefresh={onRefresh} isRefreshing={isManualRefreshing} />
      </ScreenWrapper>
    )
  }

  if (isLoading) {
    return (
      <ScreenWrapper>
        <LoadingScreen nftsCount={nftsSearchResult.length} />
      </ScreenWrapper>
    )
  }

  if (nftsSearchTerm.length > 0 && nftsSearchResult.length === 0) {
    return (
      <ScreenWrapper>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewError}
          refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={isManualRefreshing} />}
        >
          <NoNftsScreen message={strings.noNftsFound} />
        </ScrollView>
      </ScreenWrapper>
    )
  }

  if (nftsSearchTerm.length === 0 && nftsSearchResult.length === 0) {
    return (
      <ScreenWrapper>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewError}
          refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={isManualRefreshing} />}
        >
          <NoNftsScreen
            message={strings.noNftsInWallet}
            heading={
              <View>
                <NftCount count={nftsSearchResult.length} />

                <Spacer height={16} />
              </View>
            }
          />
        </ScrollView>
      </ScreenWrapper>
    )
  }

  return (
    <ScreenWrapper>
      <View style={styles.galleryContainer}>
        {nftsSearchTerm.length === 0 && (
          <View>
            <NftCount count={nftsSearchResult.length} />

            <Spacer height={16} />
          </View>
        )}

        <ImageGallery
          nfts={nftsSearchResult}
          onSelect={handleNftSelect}
          onRefresh={onRefresh}
          isRefreshing={isManualRefreshing}
        />
      </View>
    </ScreenWrapper>
  )
}

function ScreenWrapper({children}: {children: ReactNode}) {
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <View style={styles.container}>
        <Spacer height={16} />

        {children}
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

        <Spacer height={16} />

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
  const countText = `${strings.nftCount}: ${count ?? '-'}`

  return (
    <View>
      <View style={styles.countBar}>
        <Text style={styles.count}>{countText}</Text>
      </View>
    </View>
  )
}

function LoadingScreen({nftsCount}: {nftsCount: number}) {
  return (
    <View style={styles.galleryContainer}>
      <NftCount count={nftsCount} />

      <Spacer height={16} />

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
    defaultMessage: '!!!Try to restart the app.',
  },
  noNftsFound: {
    id: 'nft.gallery.noNftsFound',
    defaultMessage: '!!!No NFTs found',
  },
  noNftsInWallet: {
    id: 'nft.gallery.noNftsInWallet',
    defaultMessage: '!!!No NFTs added to your wallet yet',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    nftCount: intl.formatMessage(messages.nftCount),
    errorTitle: intl.formatMessage(messages.errorTitle),
    errorDescription: intl.formatMessage(messages.errorDescription),
    reloadApp: intl.formatMessage(messages.reloadApp),
    noNftsFound: intl.formatMessage(messages.noNftsFound),
    noNftsInWallet: intl.formatMessage(messages.noNftsInWallet),
  }
}
