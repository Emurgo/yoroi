import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import {Balance} from '@yoroi/types'
import React, {ReactNode} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {RefreshControl, ScrollView, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Icon, NftImageGallery, SkeletonGallery, Spacer} from '../components'
import {useSelectedWallet} from '../features/WalletManager/Context'
import {useMetrics} from '../metrics/metricsManager'
import {useSearch, useSearchOnNavBar} from '../Search/SearchContext'
import {useNfts} from '../yoroi-wallets/hooks'
import {filterNfts, useTrackNftGallerySearchActivated} from './filterNfts'
import {useNavigateTo} from './navigation'
import {NoNftsScreen} from './NoNftsScreen'

export const Nfts = () => {
  const navigateTo = useNavigateTo()
  const strings = useStrings()
  const styles = useStyles()
  const {track} = useMetrics()

  // use case: search nfts
  useSearchOnNavBar({
    title: strings.title,
    placeholder: strings.search,
    noBack: true,
  })

  const wallet = useSelectedWallet()
  const [isManualRefreshing, setIsManualRefreshing] = React.useState(false)

  const {isLoading, nfts, refetch, isError} = useNfts(wallet, {
    onSettled: () => {
      if (isManualRefreshing) setIsManualRefreshing(false)
    },
  })

  useFocusEffect(
    React.useCallback(() => {
      if (isLoading || isError) return
      track.nftGalleryPageViewed({nft_count: nfts.length})
    }, [isError, isLoading, nfts.length, track]),
  )

  const sortedNfts = React.useMemo(() => nfts.sort(byName), [nfts])

  const {search: nftsSearchTerm} = useSearch()
  const nftsSearchResult = filterNfts(nftsSearchTerm, sortedNfts)
  useTrackNftGallerySearchActivated(nftsSearchTerm, nftsSearchResult.length)

  const hasEmptySearchResult = nftsSearchTerm.length > 0 && nftsSearchResult.length === 0
  const hasNotNfts = nftsSearchResult.length === 0

  const onRefresh = () => {
    setIsManualRefreshing(true)
    refetch()
  }

  if (isError) {
    return (
      <Wrapper>
        <ErrorScreen onRefresh={onRefresh} isRefreshing={isManualRefreshing} />
      </Wrapper>
    )
  }

  if (isLoading) {
    return (
      <Wrapper>
        <LoadingScreen nftsCount={nftsSearchResult.length} />
      </Wrapper>
    )
  }

  if (hasEmptySearchResult) {
    return (
      <Wrapper>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewError}
          refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={isManualRefreshing} />}
        >
          <NoNftsScreen message={strings.noNftsFound} />
        </ScrollView>
      </Wrapper>
    )
  }

  if (hasNotNfts) {
    return (
      <Wrapper>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewError}
          refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={isManualRefreshing} />}
        >
          <NoNftsScreen
            message={strings.noNftsInWallet}
            heading={
              <View>
                <NftCount count={0} />

                <Spacer height={16} />
              </View>
            }
          />
        </ScrollView>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <View style={styles.galleryContainer}>
        {nftsSearchTerm.length === 0 && (
          <>
            <NftCount count={nftsSearchResult.length} />

            <Spacer height={16} />
          </>
        )}

        <NftImageGallery
          nfts={nftsSearchResult}
          onSelect={navigateTo.nftDetails}
          onRefresh={onRefresh}
          isRefreshing={isManualRefreshing}
        />
      </View>
    </Wrapper>
  )
}

const Wrapper = ({children}: {children: ReactNode}) => {
  const styles = useStyles()
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <View style={styles.container}>
        <Spacer height={16} />

        {children}
      </View>
    </SafeAreaView>
  )
}

const ErrorScreen = ({onRefresh, isRefreshing}: {onRefresh: () => void; isRefreshing: boolean}) => {
  const strings = useStrings()
  const styles = useStyles()

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

const NftCount = ({count}: {count?: number | string}) => {
  const strings = useStrings()
  const styles = useStyles()

  return (
    <View style={styles.countBar} testID="txtNftCount">
      <Text style={styles.count}>{`${strings.nftCount}: ${count ?? '-'}`}</Text>
    </View>
  )
}

const LoadingScreen = ({nftsCount}: {nftsCount: number}) => {
  const styles = useStyles()
  return (
    <View style={styles.galleryContainer}>
      <NftCount count={nftsCount} />

      <Spacer height={16} />

      <SkeletonGallery amount={6} />
    </View>
  )
}

const byName = ({name: A}: Balance.TokenInfo, {name: B}: Balance.TokenInfo) => A.localeCompare(B)

const useStyles = () => {
  const {theme} = useTheme()
  const {color} = theme
  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: color.gray.min,
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
      color: color.gray[600],
    },

    titleText: {
      textAlign: 'center',
      color: color.gray.max,
      ...theme.typography['heading-3-medium'],
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

  return styles
}

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
  title: {
    id: 'nft.navigation.title',
    defaultMessage: '!!!NFT Gallery',
  },
  search: {
    id: 'nft.navigation.search',
    defaultMessage: '!!!Search NFT',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    title: intl.formatMessage(messages.title),
    search: intl.formatMessage(messages.search),
    nftCount: intl.formatMessage(messages.nftCount),
    errorTitle: intl.formatMessage(messages.errorTitle),
    errorDescription: intl.formatMessage(messages.errorDescription),
    reloadApp: intl.formatMessage(messages.reloadApp),
    noNftsFound: intl.formatMessage(messages.noNftsFound),
    noNftsInWallet: intl.formatMessage(messages.noNftsInWallet),
  }
}
